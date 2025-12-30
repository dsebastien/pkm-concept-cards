#!/usr/bin/env tsx

import Database from 'better-sqlite3'
import natural from 'natural'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { LevenshteinDistance, JaroWinklerDistance, TfIdf } = natural

const DB_PATH = path.join(__dirname, '..', 'concepts.db')

interface DuplicatePair {
    concept1: { id: string; name: string }
    concept2: { id: string; name: string }
    score: number
    reasons: string[]
}

function normalize(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ')
}

function levenshteinSimilarity(str1: string, str2: string): number {
    const distance = LevenshteinDistance(normalize(str1), normalize(str2))
    const maxLen = Math.max(str1.length, str2.length)
    return maxLen === 0 ? 1 : 1 - distance / maxLen
}

function jaroWinklerSimilarity(str1: string, str2: string): number {
    return JaroWinklerDistance(normalize(str1), normalize(str2))
}

function tfidfSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0

    const tfidf = new TfIdf()
    tfidf.addDocument(text1)
    tfidf.addDocument(text2)

    const terms = new Set<string>()
    tfidf.listTerms(0).forEach((item) => terms.add(item.term))
    tfidf.listTerms(1).forEach((item) => terms.add(item.term))

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

function checkPairForDuplicate(
    db: Database.Database,
    concept1: { id: string; name: string; summary: string },
    concept2: { id: string; name: string; summary: string }
): DuplicatePair | null {
    const reasons: string[] = []
    let maxScore = 0

    // Check exact name match (normalized)
    if (normalize(concept1.name) === normalize(concept2.name)) {
        reasons.push('Exact name match (normalized)')
        maxScore = Math.max(maxScore, 95)
    }

    // Check name similarity
    const nameSimilarity = Math.max(
        levenshteinSimilarity(concept1.name, concept2.name),
        jaroWinklerSimilarity(concept1.name, concept2.name)
    )

    if (nameSimilarity > 0.85) {
        reasons.push(`High name similarity: ${(nameSimilarity * 100).toFixed(1)}%`)
        maxScore = Math.max(maxScore, 80 + nameSimilarity * 10)
    }

    // Check summary similarity
    const summarySimilarity = tfidfSimilarity(concept1.summary, concept2.summary)
    if (summarySimilarity > 0.75) {
        reasons.push(`High summary similarity: ${(summarySimilarity * 100).toFixed(1)}%`)
        maxScore = Math.max(maxScore, 70 + summarySimilarity * 15)
    }

    // Check if concept1 name appears in concept2 aliases or vice versa
    const aliases1Stmt = db.prepare('SELECT alias FROM concept_aliases WHERE concept_id = ?')
    const aliases2Stmt = db.prepare('SELECT alias FROM concept_aliases WHERE concept_id = ?')

    const aliases1 = (aliases1Stmt.all(concept1.id) as { alias: string }[]).map((a) =>
        normalize(a.alias)
    )
    const aliases2 = (aliases2Stmt.all(concept2.id) as { alias: string }[]).map((a) =>
        normalize(a.alias)
    )

    if (aliases1.includes(normalize(concept2.name))) {
        reasons.push(`"${concept2.name}" appears as alias of "${concept1.name}"`)
        maxScore = Math.max(maxScore, 90)
    }

    if (aliases2.includes(normalize(concept1.name))) {
        reasons.push(`"${concept1.name}" appears as alias of "${concept2.name}"`)
        maxScore = Math.max(maxScore, 90)
    }

    // Check shared related notes
    const notes1Stmt = db.prepare('SELECT url FROM concept_related_notes WHERE concept_id = ?')
    const notes2Stmt = db.prepare('SELECT url FROM concept_related_notes WHERE concept_id = ?')

    const notes1 = (notes1Stmt.all(concept1.id) as { url: string }[]).map((n) => n.url)
    const notes2 = (notes2Stmt.all(concept2.id) as { url: string }[]).map((n) => n.url)

    const sharedNotes = notes1.filter((url) => notes2.includes(url))
    if (sharedNotes.length > 0) {
        reasons.push(`${sharedNotes.length} shared related note(s)`)
        maxScore = Math.max(maxScore, 95)
    }

    if (reasons.length === 0) {
        return null
    }

    return {
        concept1: { id: concept1.id, name: concept1.name },
        concept2: { id: concept2.id, name: concept2.name },
        score: Math.round(maxScore),
        reasons
    }
}

function parseArgs(): { threshold: number } {
    const args = process.argv.slice(2)
    let threshold = 70 // default

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        const nextArg = args[i + 1]

        if (arg === '--threshold' && nextArg) {
            threshold = parseInt(nextArg, 10)
            i++
        }
    }

    return { threshold }
}

function main(): void {
    const { threshold } = parseArgs()

    console.log('='.repeat(80))
    console.log('Finding Duplicate Concepts')
    console.log('='.repeat(80))
    console.log(`Threshold: ${threshold}% (showing matches >= ${threshold}%)\n`)

    const db = new Database(DB_PATH, { readonly: true })

    try {
        // Load all concepts
        const stmt = db.prepare('SELECT id, name, summary FROM concepts')
        const concepts = stmt.all() as { id: string; name: string; summary: string }[]

        console.log(`Scanning ${concepts.length} concepts...\n`)

        const duplicates: DuplicatePair[] = []

        // Compare all pairs
        for (let i = 0; i < concepts.length; i++) {
            for (let j = i + 1; j < concepts.length; j++) {
                const pair = checkPairForDuplicate(db, concepts[i], concepts[j])
                if (pair && pair.score >= threshold) {
                    duplicates.push(pair)
                }
            }

            // Progress indicator
            if ((i + 1) % 100 === 0) {
                console.log(`Progress: ${i + 1}/${concepts.length} concepts checked...`)
            }
        }

        // Sort by score (highest first)
        duplicates.sort((a, b) => b.score - a.score)

        // Group by confidence level
        const high = duplicates.filter((d) => d.score >= 90)
        const medium = duplicates.filter((d) => d.score >= 70 && d.score < 90)
        const low = duplicates.filter((d) => d.score < 70)

        console.log('\n' + '='.repeat(80))
        console.log('Results')
        console.log('='.repeat(80))
        console.log(`Total potential duplicates found: ${duplicates.length}`)
        console.log(`  HIGH confidence (≥90%):    ${high.length}`)
        console.log(`  MEDIUM confidence (70-89%): ${medium.length}`)
        console.log(`  LOW confidence (<70%):     ${low.length}`)
        console.log('='.repeat(80))

        // Print high confidence duplicates
        if (high.length > 0) {
            console.log('\n🔴 HIGH CONFIDENCE DUPLICATES (≥90%):')
            console.log('-'.repeat(80))
            for (const dup of high) {
                console.log(`\n[${dup.score}%] ${dup.concept1.name} ↔️ ${dup.concept2.name}`)
                console.log(`  IDs: ${dup.concept1.id} ↔️ ${dup.concept2.id}`)
                dup.reasons.forEach((r) => console.log(`  • ${r}`))
                console.log(`  Suggested action:`)
                console.log(
                    `    npx tsx scripts/merge-duplicates.ts --source ${dup.concept1.id} --target ${dup.concept2.id}`
                )
            }
        }

        // Print medium confidence duplicates
        if (medium.length > 0) {
            console.log('\n\n🟡 MEDIUM CONFIDENCE DUPLICATES (70-89%):')
            console.log('-'.repeat(80))
            for (const dup of medium.slice(0, 10)) {
                // Limit to first 10
                console.log(`\n[${dup.score}%] ${dup.concept1.name} ↔️ ${dup.concept2.name}`)
                console.log(`  IDs: ${dup.concept1.id} ↔️ ${dup.concept2.id}`)
                dup.reasons.forEach((r) => console.log(`  • ${r}`))
            }
            if (medium.length > 10) {
                console.log(`\n... and ${medium.length - 10} more medium confidence matches`)
            }
        }

        console.log('\n' + '='.repeat(80))

        if (duplicates.length === 0) {
            console.log('✅ No duplicates found above threshold!')
        } else if (high.length > 0) {
            console.log('⚠️  Action required: Review and merge high confidence duplicates')
        } else {
            console.log('✓ No high confidence duplicates. Medium/low matches may need review.')
        }

        console.log('='.repeat(80))
    } catch (error) {
        console.error('\n❌ Error finding duplicates:', error)
        process.exit(1)
    } finally {
        db.close()
    }
}

main()
