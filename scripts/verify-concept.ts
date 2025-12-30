#!/usr/bin/env tsx

import Database from 'better-sqlite3'
import natural from 'natural'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { LevenshteinDistance, JaroWinklerDistance, TfIdf } = natural

const DB_PATH = path.join(__dirname, '..', 'concepts.db')

interface VerificationResult {
    conceptId: string
    conceptName: string
    score: number
    reasons: string[]
}

interface Args {
    name: string
    summary?: string
    aliases?: string[]
    relatedNotes?: string[]
}

// Normalize text for comparison
function normalize(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ')
}

// Calculate Levenshtein similarity (0-1 scale)
function levenshteinSimilarity(str1: string, str2: string): number {
    const distance = LevenshteinDistance(normalize(str1), normalize(str2))
    const maxLen = Math.max(str1.length, str2.length)
    return maxLen === 0 ? 1 : 1 - distance / maxLen
}

// Calculate Jaro-Winkler similarity
function jaroWinklerSimilarity(str1: string, str2: string): number {
    return JaroWinklerDistance(normalize(str1), normalize(str2))
}

// Calculate TF-IDF cosine similarity
function tfidfSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0

    const tfidf = new TfIdf()
    tfidf.addDocument(text1)
    tfidf.addDocument(text2)

    // Get terms from both documents
    const terms = new Set<string>()
    tfidf.listTerms(0).forEach((item) => terms.add(item.term))
    tfidf.listTerms(1).forEach((item) => terms.add(item.term))

    // Calculate cosine similarity
    let dotProduct = 0
    let mag1 = 0
    let mag2 = 0

    terms.forEach((term) => {
        const tfidf1 = tfidf.tfidf(term, 0)
        const tfidf2 = tfidf.tfidf(term, 1)
        dotProduct += tfidf1 * tfidf2
        mag1 += tfidf1 * tfidf1
        mag2 += tfidf2 * tfidf2
    })

    if (mag1 === 0 || mag2 === 0) return 0
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2))
}

function checkExactNameMatch(db: Database.Database, name: string): VerificationResult[] {
    const normalizedName = normalize(name)
    const stmt = db.prepare('SELECT id, name FROM concepts')
    const concepts = stmt.all() as { id: string; name: string }[]

    const results: VerificationResult[] = []

    for (const concept of concepts) {
        if (normalize(concept.name) === normalizedName) {
            results.push({
                conceptId: concept.id,
                conceptName: concept.name,
                score: 95,
                reasons: ['Exact name match (normalized)']
            })
        }
    }

    return results
}

function checkAliasMatch(
    db: Database.Database,
    name: string,
    aliases?: string[]
): VerificationResult[] {
    const results: VerificationResult[] = []
    const normalizedName = normalize(name)
    const normalizedAliases = (aliases || []).map(normalize)

    // Check if proposed name matches existing aliases
    const aliasStmt = db.prepare(
        'SELECT concept_id, alias FROM concept_aliases WHERE LOWER(TRIM(alias)) = ?'
    )

    const matchingAliases = aliasStmt.all(normalizedName) as { concept_id: string; alias: string }[]

    for (const match of matchingAliases) {
        const conceptStmt = db.prepare('SELECT name FROM concepts WHERE id = ?')
        const concept = conceptStmt.get(match.concept_id) as { name: string } | undefined

        if (concept) {
            results.push({
                conceptId: match.concept_id,
                conceptName: concept.name,
                score: 90,
                reasons: [`Proposed name "${name}" matches existing alias "${match.alias}"`]
            })
        }
    }

    // Check if proposed aliases match existing concept names
    if (normalizedAliases.length > 0) {
        const conceptStmt = db.prepare('SELECT id, name FROM concepts')
        const concepts = conceptStmt.all() as { id: string; name: string }[]

        for (const concept of concepts) {
            const normalizedConceptName = normalize(concept.name)
            if (normalizedAliases.includes(normalizedConceptName)) {
                results.push({
                    conceptId: concept.id,
                    conceptName: concept.name,
                    score: 90,
                    reasons: [`Proposed alias matches existing concept name "${concept.name}"`]
                })
            }
        }
    }

    return results
}

function checkFuzzyNameMatch(db: Database.Database, name: string): VerificationResult[] {
    const stmt = db.prepare('SELECT id, name FROM concepts')
    const concepts = stmt.all() as { id: string; name: string }[]

    const results: VerificationResult[] = []

    for (const concept of concepts) {
        const similarity = Math.max(
            levenshteinSimilarity(name, concept.name),
            jaroWinklerSimilarity(name, concept.name)
        )

        if (similarity > 0.85) {
            const score = 80 + similarity * 10 // 80-90 range
            results.push({
                conceptId: concept.id,
                conceptName: concept.name,
                score: Math.round(score),
                reasons: [`High name similarity: ${(similarity * 100).toFixed(1)}%`]
            })
        }
    }

    return results
}

function checkSummaryMatch(db: Database.Database, summary?: string): VerificationResult[] {
    if (!summary) return []

    const stmt = db.prepare('SELECT id, name, summary FROM concepts')
    const concepts = stmt.all() as { id: string; name: string; summary: string }[]

    const results: VerificationResult[] = []

    for (const concept of concepts) {
        const similarity = tfidfSimilarity(summary, concept.summary)

        if (similarity > 0.75) {
            const score = 70 + similarity * 15 // 70-85 range
            results.push({
                conceptId: concept.id,
                conceptName: concept.name,
                score: Math.round(score),
                reasons: [`High summary similarity: ${(similarity * 100).toFixed(1)}%`]
            })
        }
    }

    return results
}

function checkRelatedNotesOverlap(
    db: Database.Database,
    relatedNotes?: string[]
): VerificationResult[] {
    if (!relatedNotes || relatedNotes.length === 0) return []

    const results: VerificationResult[] = []

    for (const url of relatedNotes) {
        const stmt = db.prepare('SELECT concept_id FROM concept_related_notes WHERE url = ?')
        const matches = stmt.all(url) as { concept_id: string }[]

        for (const match of matches) {
            const conceptStmt = db.prepare('SELECT name FROM concepts WHERE id = ?')
            const concept = conceptStmt.get(match.concept_id) as { name: string } | undefined

            if (concept) {
                results.push({
                    conceptId: match.concept_id,
                    conceptName: concept.name,
                    score: 95,
                    reasons: [`Same related note URL: ${url}`]
                })
            }
        }
    }

    return results
}

function mergeDuplicateResults(results: VerificationResult[]): VerificationResult[] {
    const merged = new Map<string, VerificationResult>()

    for (const result of results) {
        const existing = merged.get(result.conceptId)
        if (existing) {
            // Take max score and combine reasons
            existing.score = Math.max(existing.score, result.score)
            existing.reasons.push(...result.reasons)
        } else {
            merged.set(result.conceptId, { ...result, reasons: [...result.reasons] })
        }
    }

    return Array.from(merged.values()).sort((a, b) => b.score - a.score)
}

function logCheck(
    db: Database.Database,
    name: string,
    summary: string,
    results: VerificationResult[]
): void {
    const stmt = db.prepare(`
    INSERT INTO duplicate_checks (concept_name, concept_summary, found_duplicates, similarity_scores, action_taken)
    VALUES (?, ?, ?, ?, ?)
  `)

    const similarityScores = JSON.stringify(
        results.map((r) => ({
            concept_id: r.conceptId,
            concept_name: r.conceptName,
            score: r.score,
            reasons: r.reasons
        }))
    )

    const action = results.length > 0 && results[0].score >= 90 ? 'rejected' : 'pending'

    stmt.run(name, summary || '', results.length, similarityScores, action)
}

function printResults(name: string, results: VerificationResult[]): void {
    console.log('\n' + '='.repeat(80))
    console.log(`Duplicate Check Results for: "${name}"`)
    console.log('='.repeat(80))

    if (results.length === 0) {
        console.log('\n✓ No duplicates found!')
        console.log('\nConfidence: 0%')
        console.log('Recommendation: ALLOW - Safe to add this concept')
    } else {
        const topResult = results[0]
        console.log(`\nHighest Confidence: ${topResult.score}%`)

        if (topResult.score >= 90) {
            console.log('Recommendation: ❌ REJECT - Very likely duplicate\n')
        } else if (topResult.score >= 70) {
            console.log('Recommendation: ⚠ FLAG - Manual review required\n')
        } else {
            console.log('Recommendation: ⚠ ALLOW - Low confidence match, proceed with caution\n')
        }

        console.log('Potential Duplicates:')
        console.log('-'.repeat(80))

        for (const result of results.slice(0, 5)) {
            console.log(`\n[${result.score}%] ${result.conceptName} (${result.conceptId})`)
            result.reasons.forEach((reason) => console.log(`  • ${reason}`))
        }

        if (results.length > 5) {
            console.log(`\n... and ${results.length - 5} more potential matches`)
        }
    }

    console.log('\n' + '='.repeat(80))
}

function parseArgs(): Args | null {
    const args = process.argv.slice(2)
    let name: string | undefined
    let summary: string | undefined
    let aliases: string[] | undefined
    let relatedNotes: string[] | undefined

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        const nextArg = args[i + 1]

        if (arg === '--name' && nextArg) {
            name = nextArg
            i++
        } else if (arg === '--summary' && nextArg) {
            summary = nextArg
            i++
        } else if (arg === '--aliases' && nextArg) {
            aliases = nextArg.split(',').map((a) => a.trim())
            i++
        } else if (arg === '--related-notes' && nextArg) {
            relatedNotes = nextArg.split(',').map((u) => u.trim())
            i++
        }
    }

    if (!name) {
        console.error('\n❌ Error: --name is required\n')
        console.log('Usage: npx tsx scripts/verify-concept.ts --name "Concept Name" [options]\n')
        console.log('Options:')
        console.log('  --name <string>           Concept name (required)')
        console.log('  --summary <string>        Concept summary (optional, improves accuracy)')
        console.log('  --aliases <string>        Comma-separated aliases (optional)')
        console.log('  --related-notes <string>  Comma-separated related note URLs (optional)')
        console.log('\nExample:')
        console.log('  npx tsx scripts/verify-concept.ts \\')
        console.log('    --name "Zettelkasten Method" \\')
        console.log('    --summary "Note-taking system with atomic notes" \\')
        console.log('    --aliases "Zettelkasten,Slip-box method"\n')
        return null
    }

    return { name, summary, aliases, relatedNotes }
}

function main(): void {
    const args = parseArgs()
    if (!args) {
        process.exit(1)
    }

    // Check if database exists
    const db = new Database(DB_PATH, { readonly: true })

    try {
        const allResults: VerificationResult[] = []

        // Run all similarity checks
        allResults.push(...checkExactNameMatch(db, args.name))
        allResults.push(...checkAliasMatch(db, args.name, args.aliases))
        allResults.push(...checkFuzzyNameMatch(db, args.name))

        if (args.summary) {
            allResults.push(...checkSummaryMatch(db, args.summary))
        }

        if (args.relatedNotes) {
            allResults.push(...checkRelatedNotesOverlap(db, args.relatedNotes))
        }

        // Merge and sort results
        const finalResults = mergeDuplicateResults(allResults)

        // Close readonly connection
        db.close()

        // Log check to database (need writable connection)
        const writeDb = new Database(DB_PATH)
        logCheck(writeDb, args.name, args.summary || '', finalResults)
        writeDb.close()

        // Print results
        printResults(args.name, finalResults)

        // Exit with appropriate code
        if (finalResults.length > 0 && finalResults[0].score >= 90) {
            process.exit(1) // Reject
        } else {
            process.exit(0) // Allow
        }
    } catch (error) {
        console.error('\n❌ Error verifying concept:', error)
        db.close()
        process.exit(1)
    }
}

main()
