#!/usr/bin/env tsx

import Database from 'better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Concept {
    id: string
    name: string
    summary: string
    explanation: string
    tags: string[]
    category: string
    featured: boolean
    icon?: string
    aliases?: string[]
    relatedConcepts?: string[]
    relatedNotes?: string[]
    articles?: Reference[]
    books?: Book[]
    references?: Reference[]
    tutorials?: Reference[]
    datePublished: string
    dateModified: string
}

interface Reference {
    title: string
    url: string
    type?: string
}

interface Book {
    title: string
    url: string
}

const DB_PATH = path.join(__dirname, '..', 'concepts.db')
const CONCEPTS_DIR = path.join(__dirname, '..', 'src', 'data', 'concepts')

function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr))
}

function uniqueObjects<T extends { url: string }>(arr: T[]): T[] {
    const seen = new Set<string>()
    return arr.filter((item) => {
        if (seen.has(item.url)) return false
        seen.add(item.url)
        return true
    })
}

function loadConceptFromFile(conceptId: string): Concept | null {
    const filePath = path.join(CONCEPTS_DIR, `${conceptId}.json`)
    if (!fs.existsSync(filePath)) {
        return null
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(content) as Concept
    } catch (error) {
        console.error(`Error loading ${conceptId}:`, error)
        return null
    }
}

function saveConceptToFile(concept: Concept): void {
    const filePath = path.join(CONCEPTS_DIR, `${concept.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(concept, null, 2) + '\n', 'utf-8')
}

function deleteConceptFile(conceptId: string): void {
    const filePath = path.join(CONCEPTS_DIR, `${conceptId}.json`)
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
    }
}

function mergeConcepts(source: Concept, target: Concept, strategy: string): Concept {
    if (strategy === 'keep-target') {
        return target
    }

    // merge-fields strategy
    const merged: Concept = {
        ...target, // Keep target's core fields (name, summary, explanation, category, featured, icon)
        tags: unique([...(target.tags || []), ...(source.tags || [])]).sort(),
        aliases: unique([...(target.aliases || []), ...(source.aliases || [])]).sort(),
        relatedConcepts: unique([
            ...(target.relatedConcepts || []),
            ...(source.relatedConcepts || [])
        ]).sort(),
        relatedNotes: unique([...(target.relatedNotes || []), ...(source.relatedNotes || [])]),
        articles: uniqueObjects([...(target.articles || []), ...(source.articles || [])]),
        books: uniqueObjects([...(target.books || []), ...(source.books || [])]),
        references: uniqueObjects([...(target.references || []), ...(source.references || [])]),
        tutorials: uniqueObjects([...(target.tutorials || []), ...(source.tutorials || [])]),
        // Use latest dateModified
        dateModified: new Date().toISOString().split('T')[0],
        // Keep earliest datePublished
        datePublished:
            target.datePublished < source.datePublished
                ? target.datePublished
                : source.datePublished
    }

    return merged
}

function updateRelatedConceptsReferences(
    db: Database.Database,
    sourceId: string,
    targetId: string
): number {
    // Find all concepts that reference the source concept in relatedConcepts
    const allConceptsStmt = db.prepare('SELECT id FROM concepts WHERE id != ? AND id != ?')
    const allConcepts = allConceptsStmt.all(sourceId, targetId) as { id: string }[]

    let updatedCount = 0

    for (const { id } of allConcepts) {
        const concept = loadConceptFromFile(id)
        if (!concept) continue

        if (concept.relatedConcepts && concept.relatedConcepts.includes(sourceId)) {
            // Replace sourceId with targetId
            concept.relatedConcepts = concept.relatedConcepts
                .map((cid) => (cid === sourceId ? targetId : cid))
                .filter((cid, idx, arr) => arr.indexOf(cid) === idx) // Remove duplicates

            saveConceptToFile(concept)
            updatedCount++
            console.log(`  ✓ Updated relatedConcepts in: ${id}`)
        }
    }

    return updatedCount
}

function deleteConceptFromDb(db: Database.Database, conceptId: string): void {
    const stmt = db.prepare('DELETE FROM concepts WHERE id = ?')
    stmt.run(conceptId)
}

function parseArgs(): { source: string; target: string; strategy: string } | null {
    const args = process.argv.slice(2)
    let source: string | undefined
    let target: string | undefined
    let strategy = 'merge-fields' // default

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        const nextArg = args[i + 1]

        if (arg === '--source' && nextArg) {
            source = nextArg
            i++
        } else if (arg === '--target' && nextArg) {
            target = nextArg
            i++
        } else if (arg === '--strategy' && nextArg) {
            strategy = nextArg
            i++
        }
    }

    if (!source || !target) {
        console.error('\n❌ Error: --source and --target are required\n')
        console.log(
            'Usage: npx tsx scripts/merge-duplicates.ts --source <id> --target <id> [options]\n'
        )
        console.log('Options:')
        console.log('  --source <id>      Source concept ID (will be deleted)')
        console.log('  --target <id>      Target concept ID (will be kept)')
        console.log(
            '  --strategy <type>  Merge strategy: keep-target | merge-fields (default: merge-fields)'
        )
        console.log('\nExample:')
        console.log('  npx tsx scripts/merge-duplicates.ts \\')
        console.log('    --source gratitude \\')
        console.log('    --target gratitude-practice \\')
        console.log('    --strategy merge-fields\n')
        return null
    }

    if (!['keep-target', 'merge-fields'].includes(strategy)) {
        console.error('\n❌ Error: Invalid strategy. Use "keep-target" or "merge-fields"\n')
        return null
    }

    return { source, target, strategy }
}

function main(): void {
    const args = parseArgs()
    if (!args) {
        process.exit(1)
    }

    console.log('='.repeat(60))
    console.log('Merging Duplicate Concepts')
    console.log('='.repeat(60))
    console.log(`Source: ${args.source} (will be deleted)`)
    console.log(`Target: ${args.target} (will be kept)`)
    console.log(`Strategy: ${args.strategy}`)
    console.log('='.repeat(60))

    // Load both concepts
    const sourceConcept = loadConceptFromFile(args.source)
    const targetConcept = loadConceptFromFile(args.target)

    if (!sourceConcept) {
        console.error(`\n❌ Error: Source concept "${args.source}" not found`)
        process.exit(1)
    }

    if (!targetConcept) {
        console.error(`\n❌ Error: Target concept "${args.target}" not found`)
        process.exit(1)
    }

    console.log('\n📖 Source Concept:')
    console.log(`  Name: ${sourceConcept.name}`)
    console.log(`  Category: ${sourceConcept.category}`)
    console.log(`  Tags: ${sourceConcept.tags.length}`)
    console.log(`  Aliases: ${sourceConcept.aliases?.length || 0}`)

    console.log('\n📖 Target Concept:')
    console.log(`  Name: ${targetConcept.name}`)
    console.log(`  Category: ${targetConcept.category}`)
    console.log(`  Tags: ${targetConcept.tags.length}`)
    console.log(`  Aliases: ${targetConcept.aliases?.length || 0}`)

    // Merge concepts
    console.log('\n🔄 Merging...')
    const mergedConcept = mergeConcepts(sourceConcept, targetConcept, args.strategy)

    console.log('\n📝 Merged Concept:')
    console.log(
        `  Tags: ${mergedConcept.tags.length} (${mergedConcept.tags.length - targetConcept.tags.length > 0 ? '+' : ''}${mergedConcept.tags.length - targetConcept.tags.length})`
    )
    console.log(
        `  Aliases: ${mergedConcept.aliases?.length || 0} (${(mergedConcept.aliases?.length || 0) - (targetConcept.aliases?.length || 0) > 0 ? '+' : ''}${(mergedConcept.aliases?.length || 0) - (targetConcept.aliases?.length || 0)})`
    )
    console.log(`  Related Notes: ${mergedConcept.relatedNotes?.length || 0}`)
    console.log(
        `  References: ${(mergedConcept.articles?.length || 0) + (mergedConcept.books?.length || 0) + (mergedConcept.references?.length || 0) + (mergedConcept.tutorials?.length || 0)}`
    )

    // Open database
    const db = new Database(DB_PATH)
    db.pragma('foreign_keys = ON')

    try {
        // Update relatedConcepts references in other concepts
        console.log('\n🔗 Updating cross-references...')
        const updatedRefs = updateRelatedConceptsReferences(db, args.source, args.target)
        if (updatedRefs > 0) {
            console.log(`  ✓ Updated ${updatedRefs} concepts`)
        } else {
            console.log('  No cross-references to update')
        }

        // Delete source concept from database
        console.log('\n🗑️  Deleting source from database...')
        deleteConceptFromDb(db, args.source)
        console.log(`  ✓ Deleted ${args.source} from database`)

        // Delete source JSON file
        console.log('\n🗑️  Deleting source JSON file...')
        deleteConceptFile(args.source)
        console.log(`  ✓ Deleted ${args.source}.json`)

        // Save merged concept to target file
        console.log('\n💾 Saving merged concept...')
        saveConceptToFile(mergedConcept)
        console.log(`  ✓ Saved merged concept to ${args.target}.json`)

        console.log('\n' + '='.repeat(60))
        console.log('✅ Merge Complete')
        console.log('='.repeat(60))
        console.log('\n⚠️  Important: Run sync-concepts-db.ts to update the database:')
        console.log('   npx tsx scripts/sync-concepts-db.ts\n')
    } catch (error) {
        console.error('\n❌ Error merging concepts:', error)
        process.exit(1)
    } finally {
        db.close()
    }
}

main()
