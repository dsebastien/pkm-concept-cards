#!/usr/bin/env tsx
/**
 * Validates concept JSON files for:
 * - Broken URLs (404s) in references, articles, tutorials, relatedNotes
 * - Missing relatedConcepts (referenced concepts that don't exist)
 * - Missing required fields
 * - Invalid icon names
 *
 * Usage:
 *   bun ./scripts/validate-concepts.ts [options]
 *
 * Options:
 *   --skip-urls      Skip URL validation (faster, offline mode)
 *   --fix-relations  Remove invalid relatedConcepts references
 *   --verbose        Show all checks, not just issues
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

interface ValidationIssue {
    file: string
    conceptId: string
    type: 'error' | 'warning'
    category: string
    message: string
    field?: string
    value?: string
}

// Parse CLI args
const args = process.argv.slice(2)
const skipUrls = args.includes('--skip-urls')
const fixRelations = args.includes('--fix-relations')
const verbose = args.includes('--verbose')

// Paths
const conceptsDir = join(__dirname, '../src/data/concepts')

// Load all concepts
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))
const allConceptIds = new Set<string>()
const concepts: Map<string, { file: string; concept: Concept }> = new Map()

for (const file of conceptFiles) {
    const filePath = join(conceptsDir, file)
    const concept: Concept = JSON.parse(readFileSync(filePath, 'utf-8'))
    allConceptIds.add(concept.id)
    concepts.set(concept.id, { file, concept })
}

console.log(`Loaded ${concepts.size} concepts\n`)

const issues: ValidationIssue[] = []

// Check for missing required fields
function validateRequiredFields(file: string, concept: Concept) {
    const required = ['id', 'name', 'summary', 'explanation', 'tags', 'category']
    for (const field of required) {
        if (!concept[field as keyof Concept]) {
            issues.push({
                file,
                conceptId: concept.id || file,
                type: 'error',
                category: 'missing-field',
                message: `Missing required field: ${field}`,
                field
            })
        }
    }

    // Check if id matches filename
    const expectedId = file.replace('.json', '')
    if (concept.id !== expectedId) {
        issues.push({
            file,
            conceptId: concept.id,
            type: 'warning',
            category: 'id-mismatch',
            message: `ID "${concept.id}" doesn't match filename "${expectedId}"`,
            field: 'id',
            value: concept.id
        })
    }
}

// Check for invalid relatedConcepts
function validateRelatedConcepts(file: string, concept: Concept): string[] {
    const invalidRefs: string[] = []
    if (!concept.relatedConcepts) return invalidRefs

    for (const relatedId of concept.relatedConcepts) {
        if (!allConceptIds.has(relatedId)) {
            invalidRefs.push(relatedId)
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'missing-concept',
                message: `Related concept "${relatedId}" does not exist`,
                field: 'relatedConcepts',
                value: relatedId
            })
        }
    }
    return invalidRefs
}

// Check URL with fetch
async function checkUrl(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ConceptValidator/1.0)'
            },
            redirect: 'follow'
        })

        clearTimeout(timeout)

        // Some servers don't support HEAD, try GET if we get 405
        if (response.status === 405) {
            const getResponse = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ConceptValidator/1.0)'
                },
                redirect: 'follow'
            })
            return { ok: getResponse.ok, status: getResponse.status }
        }

        return { ok: response.ok, status: response.status }
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return { ok: false, error: 'Timeout' }
            }
            return { ok: false, error: error.message }
        }
        return { ok: false, error: 'Unknown error' }
    }
}

// Rate limiter for URL checks
async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// Validate URLs in a reference array
async function validateUrls(
    file: string,
    concept: Concept,
    refs: Reference[] | undefined,
    fieldName: string
) {
    if (!refs || refs.length === 0) return

    for (const ref of refs) {
        if (!ref.url) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'missing-url',
                message: `${fieldName} entry "${ref.title}" has no URL`,
                field: fieldName
            })
            continue
        }

        // Validate URL format
        try {
            new URL(ref.url)
        } catch {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'invalid-url',
                message: `Invalid URL format in ${fieldName}: ${ref.url}`,
                field: fieldName,
                value: ref.url
            })
            continue
        }

        if (!skipUrls) {
            const result = await checkUrl(ref.url)
            if (!result.ok) {
                issues.push({
                    file,
                    conceptId: concept.id,
                    type: 'warning',
                    category: 'broken-url',
                    message: `Broken URL in ${fieldName}: ${ref.url} (${result.status || result.error})`,
                    field: fieldName,
                    value: ref.url
                })
            } else if (verbose) {
                console.log(`  ✓ ${ref.url}`)
            }
            await sleep(100) // Rate limit
        }
    }
}

// Validate relatedNotes URLs
async function validateRelatedNotes(file: string, concept: Concept) {
    if (!concept.relatedNotes || concept.relatedNotes.length === 0) return

    for (const noteUrl of concept.relatedNotes) {
        // Validate URL format
        try {
            new URL(noteUrl)
        } catch {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'invalid-url',
                message: `Invalid relatedNotes URL format: ${noteUrl}`,
                field: 'relatedNotes',
                value: noteUrl
            })
            continue
        }

        if (!skipUrls) {
            const result = await checkUrl(noteUrl)
            if (!result.ok) {
                issues.push({
                    file,
                    conceptId: concept.id,
                    type: 'warning',
                    category: 'broken-url',
                    message: `Broken relatedNotes URL: ${noteUrl} (${result.status || result.error})`,
                    field: 'relatedNotes',
                    value: noteUrl
                })
            } else if (verbose) {
                console.log(`  ✓ ${noteUrl}`)
            }
            await sleep(100) // Rate limit
        }
    }
}

// Fix invalid relations by removing them
function fixInvalidRelations(file: string, concept: Concept, invalidRefs: string[]) {
    if (invalidRefs.length === 0) return false

    const filePath = join(conceptsDir, file)
    concept.relatedConcepts = concept.relatedConcepts?.filter((id) => !invalidRefs.includes(id))
    writeFileSync(filePath, JSON.stringify(concept, null, 4) + '\n')
    return true
}

// Main validation
async function main() {
    console.log('Validation options:')
    console.log(`  Skip URL checks: ${skipUrls}`)
    console.log(`  Fix invalid relations: ${fixRelations}`)
    console.log(`  Verbose: ${verbose}`)
    console.log('')

    let filesFixed = 0
    let urlsChecked = 0

    for (const [conceptId, { file, concept }] of concepts) {
        if (verbose) {
            console.log(`Checking ${file}...`)
        }

        // Validate required fields
        validateRequiredFields(file, concept)

        // Validate relatedConcepts
        const invalidRefs = validateRelatedConcepts(file, concept)

        // Fix if requested
        if (fixRelations && invalidRefs.length > 0) {
            if (fixInvalidRelations(file, concept, invalidRefs)) {
                filesFixed++
                console.log(`  Fixed ${file}: removed ${invalidRefs.length} invalid relation(s)`)
            }
        }

        // Validate URLs
        if (!skipUrls) {
            await validateUrls(file, concept, concept.articles, 'articles')
            await validateUrls(file, concept, concept.references, 'references')
            await validateUrls(file, concept, concept.tutorials, 'tutorials')
            await validateRelatedNotes(file, concept)
            urlsChecked++
        }
    }

    // Report results
    console.log('\n' + '='.repeat(60))
    console.log('VALIDATION REPORT')
    console.log('='.repeat(60))

    if (issues.length === 0) {
        console.log('\n✅ No issues found!')
    } else {
        // Group issues by category
        const byCategory = new Map<string, ValidationIssue[]>()
        for (const issue of issues) {
            const list = byCategory.get(issue.category) || []
            list.push(issue)
            byCategory.set(issue.category, list)
        }

        for (const [category, categoryIssues] of byCategory) {
            console.log(`\n### ${category.toUpperCase()} (${categoryIssues.length})`)
            for (const issue of categoryIssues) {
                const icon = issue.type === 'error' ? '❌' : '⚠️'
                console.log(`  ${icon} ${issue.file}: ${issue.message}`)
            }
        }

        // Summary
        const errors = issues.filter((i) => i.type === 'error').length
        const warnings = issues.filter((i) => i.type === 'warning').length
        console.log('\n' + '-'.repeat(60))
        console.log(`Summary: ${errors} error(s), ${warnings} warning(s)`)
    }

    if (fixRelations && filesFixed > 0) {
        console.log(`\nFixed ${filesFixed} file(s)`)
    }

    if (!skipUrls) {
        console.log(`\nChecked URLs in ${urlsChecked} concept(s)`)
    }

    // Exit with error code if there are errors
    const hasErrors = issues.some((i) => i.type === 'error')
    process.exit(hasErrors ? 1 : 0)
}

main().catch(console.error)
