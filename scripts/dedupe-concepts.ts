#!/usr/bin/env tsx
/**
 * Removes duplicate entries from array fields in concept JSON files.
 * Deduplicates: relatedConcepts, aliases, relatedNotes, articles, references, tutorials, tags
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Reference {
    title: string
    url: string
    type: string
}

interface Concept {
    id: string
    name: string
    summary: string
    explanation: string
    tags: string[]
    category: string
    icon?: string
    featured: boolean
    aliases?: string[]
    relatedConcepts?: string[]
    relatedNotes?: string[]
    articles?: Reference[]
    references?: Reference[]
    tutorials?: Reference[]
}

// Deduplicate simple string arrays
function dedupeStringArray(arr: string[] | undefined): string[] | undefined {
    if (!arr || arr.length === 0) return arr
    const unique = [...new Set(arr)]
    return unique.length === arr.length ? arr : unique
}

// Deduplicate reference arrays by URL (case-insensitive)
function dedupeReferenceArray(arr: Reference[] | undefined): Reference[] | undefined {
    if (!arr || arr.length === 0) return arr
    const seen = new Set<string>()
    const unique: Reference[] = []
    for (const ref of arr) {
        const key = ref.url.toLowerCase()
        if (!seen.has(key)) {
            seen.add(key)
            unique.push(ref)
        }
    }
    return unique.length === arr.length ? arr : unique
}

// Paths
const conceptsDir = join(__dirname, '../src/data/concepts')

// Read all concept files
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))

let totalFiles = 0
let modifiedFiles = 0
let totalDuplicatesRemoved = 0

for (const file of conceptFiles) {
    const filePath = join(conceptsDir, file)
    const concept: Concept = JSON.parse(readFileSync(filePath, 'utf-8'))

    let modified = false
    let duplicatesInFile = 0

    // Deduplicate tags
    const originalTagsLength = concept.tags?.length ?? 0
    const dedupedTags = dedupeStringArray(concept.tags)
    if (dedupedTags && dedupedTags.length !== originalTagsLength) {
        const removed = originalTagsLength - dedupedTags.length
        duplicatesInFile += removed
        concept.tags = dedupedTags
        modified = true
    }

    // Deduplicate aliases
    const originalAliasesLength = concept.aliases?.length ?? 0
    const dedupedAliases = dedupeStringArray(concept.aliases)
    if (dedupedAliases && dedupedAliases.length !== originalAliasesLength) {
        const removed = originalAliasesLength - dedupedAliases.length
        duplicatesInFile += removed
        concept.aliases = dedupedAliases
        modified = true
    }

    // Deduplicate relatedConcepts
    const originalRelatedConceptsLength = concept.relatedConcepts?.length ?? 0
    const dedupedRelatedConcepts = dedupeStringArray(concept.relatedConcepts)
    if (dedupedRelatedConcepts && dedupedRelatedConcepts.length !== originalRelatedConceptsLength) {
        const removed = originalRelatedConceptsLength - dedupedRelatedConcepts.length
        duplicatesInFile += removed
        concept.relatedConcepts = dedupedRelatedConcepts
        modified = true
    }

    // Deduplicate relatedNotes
    const originalRelatedNotesLength = concept.relatedNotes?.length ?? 0
    const dedupedRelatedNotes = dedupeStringArray(concept.relatedNotes)
    if (dedupedRelatedNotes && dedupedRelatedNotes.length !== originalRelatedNotesLength) {
        const removed = originalRelatedNotesLength - dedupedRelatedNotes.length
        duplicatesInFile += removed
        concept.relatedNotes = dedupedRelatedNotes
        modified = true
    }

    // Deduplicate articles
    const originalArticlesLength = concept.articles?.length ?? 0
    const dedupedArticles = dedupeReferenceArray(concept.articles)
    if (dedupedArticles && dedupedArticles.length !== originalArticlesLength) {
        const removed = originalArticlesLength - dedupedArticles.length
        duplicatesInFile += removed
        concept.articles = dedupedArticles
        modified = true
    }

    // Deduplicate references
    const originalReferencesLength = concept.references?.length ?? 0
    const dedupedReferences = dedupeReferenceArray(concept.references)
    if (dedupedReferences && dedupedReferences.length !== originalReferencesLength) {
        const removed = originalReferencesLength - dedupedReferences.length
        duplicatesInFile += removed
        concept.references = dedupedReferences
        modified = true
    }

    // Deduplicate tutorials
    const originalTutorialsLength = concept.tutorials?.length ?? 0
    const dedupedTutorials = dedupeReferenceArray(concept.tutorials)
    if (dedupedTutorials && dedupedTutorials.length !== originalTutorialsLength) {
        const removed = originalTutorialsLength - dedupedTutorials.length
        duplicatesInFile += removed
        concept.tutorials = dedupedTutorials
        modified = true
    }

    totalFiles++

    if (modified) {
        writeFileSync(filePath, JSON.stringify(concept, null, 4) + '\n')
        modifiedFiles++
        totalDuplicatesRemoved += duplicatesInFile
        console.log(`  Modified: ${file} (removed ${duplicatesInFile} duplicate(s))`)
    }
}

console.log(`\nSummary:`)
console.log(`  Total files scanned: ${totalFiles}`)
console.log(`  Files modified: ${modifiedFiles}`)
console.log(`  Total duplicates removed: ${totalDuplicatesRemoved}`)
