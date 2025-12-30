#!/usr/bin/env tsx

import Database from 'better-sqlite3'
import * as crypto from 'crypto'
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

function calculateContentHash(concept: Concept): string {
    const content = JSON.stringify(concept, Object.keys(concept).sort())
    return crypto.createHash('md5').update(content).digest('hex')
}

function deleteConcept(db: Database.Database, conceptId: string): void {
    // Delete from main table (cascades to related tables)
    const stmt = db.prepare('DELETE FROM concepts WHERE id = ?')
    stmt.run(conceptId)
}

function upsertConcept(db: Database.Database, concept: Concept, filePath: string): void {
    const contentHash = calculateContentHash(concept)

    // Check if concept exists
    const existingStmt = db.prepare('SELECT id, content_hash FROM concepts WHERE id = ?')
    const existing = existingStmt.get(concept.id) as
        | { id: string; content_hash: string }
        | undefined

    if (existing) {
        // Update if hash changed
        if (existing.content_hash !== contentHash) {
            // Delete old data first (will cascade)
            deleteConcept(db, concept.id)
        } else {
            // No changes needed
            return
        }
    }

    // Insert concept
    const insertConcept = db.prepare(`
    INSERT INTO concepts (
      id, name, summary, explanation, category, featured, icon,
      date_published, date_modified, file_path, content_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    insertConcept.run(
        concept.id,
        concept.name,
        concept.summary,
        concept.explanation,
        concept.category,
        concept.featured ? 1 : 0,
        concept.icon || null,
        concept.datePublished,
        concept.dateModified,
        filePath,
        contentHash
    )

    // Insert aliases
    if (concept.aliases && concept.aliases.length > 0) {
        const insertAlias = db.prepare(
            'INSERT OR IGNORE INTO concept_aliases (concept_id, alias) VALUES (?, ?)'
        )
        for (const alias of concept.aliases) {
            insertAlias.run(concept.id, alias)
        }
    }

    // Insert tags
    if (concept.tags && concept.tags.length > 0) {
        const insertTag = db.prepare(
            'INSERT OR IGNORE INTO concept_tags (concept_id, tag) VALUES (?, ?)'
        )
        for (const tag of concept.tags) {
            insertTag.run(concept.id, tag)
        }
    }

    // Insert related notes
    if (concept.relatedNotes && concept.relatedNotes.length > 0) {
        const insertNote = db.prepare(
            'INSERT OR IGNORE INTO concept_related_notes (concept_id, url) VALUES (?, ?)'
        )
        for (const url of concept.relatedNotes) {
            insertNote.run(concept.id, url)
        }
    }

    // Insert references
    const insertRef = db.prepare(`
    INSERT INTO concept_references (concept_id, ref_type, title, url, content_type)
    VALUES (?, ?, ?, ?, ?)
  `)

    if (concept.articles && concept.articles.length > 0) {
        for (const article of concept.articles) {
            insertRef.run(concept.id, 'article', article.title, article.url, article.type || null)
        }
    }

    if (concept.books && concept.books.length > 0) {
        for (const book of concept.books) {
            insertRef.run(concept.id, 'book', book.title, book.url, null)
        }
    }

    if (concept.references && concept.references.length > 0) {
        for (const ref of concept.references) {
            insertRef.run(concept.id, 'reference', ref.title, ref.url, ref.type || null)
        }
    }

    if (concept.tutorials && concept.tutorials.length > 0) {
        for (const tutorial of concept.tutorials) {
            insertRef.run(
                concept.id,
                'tutorial',
                tutorial.title,
                tutorial.url,
                tutorial.type || null
            )
        }
    }
}

function main(): void {
    console.log('='.repeat(60))
    console.log('Syncing Concepts Database')
    console.log('='.repeat(60))

    if (!fs.existsSync(DB_PATH)) {
        console.error('\n❌ Error: Database not found. Run init-concepts-db.ts first.')
        process.exit(1)
    }

    const db = new Database(DB_PATH)
    db.pragma('foreign_keys = ON')

    try {
        // Load all concept files
        const files = fs.readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.json'))
        const fileIds = new Set<string>()

        console.log(`\nFound ${files.length} concept files`)

        let added = 0
        let updated = 0
        let unchanged = 0

        const syncAll = db.transaction(() => {
            for (const file of files) {
                const filePath = path.join(CONCEPTS_DIR, file)
                const content = fs.readFileSync(filePath, 'utf-8')
                const concept = JSON.parse(content) as Concept

                fileIds.add(concept.id)

                // Check if exists and needs update
                const existingStmt = db.prepare('SELECT content_hash FROM concepts WHERE id = ?')
                const existing = existingStmt.get(concept.id) as
                    | { content_hash: string }
                    | undefined

                const newHash = calculateContentHash(concept)

                if (!existing) {
                    upsertConcept(db, concept, filePath)
                    added++
                    console.log(`  ✓ Added: ${concept.id}`)
                } else if (existing.content_hash !== newHash) {
                    upsertConcept(db, concept, filePath)
                    updated++
                    console.log(`  ✓ Updated: ${concept.id}`)
                } else {
                    unchanged++
                }
            }
        })

        syncAll()

        // Find orphaned database entries
        const allDbConceptsStmt = db.prepare('SELECT id, name FROM concepts')
        const allDbConcepts = allDbConceptsStmt.all() as { id: string; name: string }[]

        const orphaned = allDbConcepts.filter((c) => !fileIds.has(c.id))

        if (orphaned.length > 0) {
            console.log('\n⚠ Orphaned database entries (no matching files):')
            for (const concept of orphaned) {
                console.log(`  - ${concept.id} (${concept.name})`)
            }
            console.log('\nThese entries remain in the database but have no source file.')
        }

        // Print summary
        console.log('\n' + '='.repeat(60))
        console.log('Sync Complete')
        console.log('='.repeat(60))
        console.log(`Added:     ${added}`)
        console.log(`Updated:   ${updated}`)
        console.log(`Unchanged: ${unchanged}`)
        console.log(`Orphaned:  ${orphaned.length}`)
        console.log('='.repeat(60))
    } catch (error) {
        console.error('\n❌ Error syncing database:', error)
        process.exit(1)
    } finally {
        db.close()
    }
}

main()
