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
    type?: 'paper' | 'website' | 'video' | 'podcast' | 'other'
}

interface Book {
    title: string
    url: string
}

// Database path: root of repository
const DB_PATH = path.join(__dirname, '..', 'concepts.db')
const CONCEPTS_DIR = path.join(__dirname, '..', 'src', 'data', 'concepts')

function calculateContentHash(concept: Concept): string {
    const content = JSON.stringify(concept, Object.keys(concept).sort())
    return crypto.createHash('md5').update(content).digest('hex')
}

function createTables(db: Database.Database): void {
    console.log('Creating database tables...')

    // Main concepts table
    db.exec(`
    CREATE TABLE IF NOT EXISTS concepts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      summary TEXT NOT NULL,
      explanation TEXT NOT NULL,
      category TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      icon TEXT,
      date_published TEXT NOT NULL,
      date_modified TEXT NOT NULL,
      file_path TEXT NOT NULL UNIQUE,
      content_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_name ON concepts(name);
    CREATE INDEX IF NOT EXISTS idx_category ON concepts(category);
    CREATE INDEX IF NOT EXISTS idx_content_hash ON concepts(content_hash);
  `)

    // Concept aliases table
    db.exec(`
    CREATE TABLE IF NOT EXISTS concept_aliases (
      concept_id TEXT NOT NULL,
      alias TEXT NOT NULL,
      FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
      PRIMARY KEY (concept_id, alias)
    );

    CREATE INDEX IF NOT EXISTS idx_alias ON concept_aliases(alias);
  `)

    // Concept tags table
    db.exec(`
    CREATE TABLE IF NOT EXISTS concept_tags (
      concept_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
      PRIMARY KEY (concept_id, tag)
    );

    CREATE INDEX IF NOT EXISTS idx_tag ON concept_tags(tag);
  `)

    // Concept related notes table
    db.exec(`
    CREATE TABLE IF NOT EXISTS concept_related_notes (
      concept_id TEXT NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
      PRIMARY KEY (concept_id, url)
    );

    CREATE INDEX IF NOT EXISTS idx_related_url ON concept_related_notes(url);
  `)

    // Concept references table (articles, books, references, tutorials)
    db.exec(`
    CREATE TABLE IF NOT EXISTS concept_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_id TEXT NOT NULL,
      ref_type TEXT NOT NULL CHECK(ref_type IN ('article', 'book', 'reference', 'tutorial')),
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      content_type TEXT,
      FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_ref_concept ON concept_references(concept_id);
    CREATE INDEX IF NOT EXISTS idx_ref_url ON concept_references(url);
  `)

    // Duplicate checks audit log
    db.exec(`
    CREATE TABLE IF NOT EXISTS duplicate_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      concept_name TEXT NOT NULL,
      concept_summary TEXT NOT NULL,
      found_duplicates INTEGER NOT NULL,
      similarity_scores TEXT,
      action_taken TEXT
    );
  `)

    console.log('✓ Created all tables and indices')
}

function loadConcepts(): Map<string, { concept: Concept; filePath: string }> {
    console.log('\nLoading concepts from JSON files...')
    const concepts = new Map<string, { concept: Concept; filePath: string }>()

    const files = fs.readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.json'))

    for (const file of files) {
        const filePath = path.join(CONCEPTS_DIR, file)
        try {
            const content = fs.readFileSync(filePath, 'utf-8')
            const concept = JSON.parse(content) as Concept

            // Validate that filename matches ID
            const expectedId = path.basename(file, '.json')
            if (concept.id !== expectedId) {
                console.warn(
                    `⚠ Warning: File ${file} has mismatched ID (expected: ${expectedId}, got: ${concept.id})`
                )
            }

            concepts.set(concept.id, { concept, filePath })
        } catch (error) {
            console.error(`❌ Error loading ${file}:`, error)
        }
    }

    console.log(`✓ Loaded ${concepts.size} concepts`)
    return concepts
}

function insertConcepts(
    db: Database.Database,
    concepts: Map<string, { concept: Concept; filePath: string }>
): void {
    console.log('\nInserting concepts into database...')

    const insertConcept = db.prepare(`
    INSERT INTO concepts (
      id, name, summary, explanation, category, featured, icon,
      date_published, date_modified, file_path, content_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    const insertAlias = db.prepare(`
    INSERT OR IGNORE INTO concept_aliases (concept_id, alias) VALUES (?, ?)
  `)

    const insertTag = db.prepare(`
    INSERT OR IGNORE INTO concept_tags (concept_id, tag) VALUES (?, ?)
  `)

    const insertRelatedNote = db.prepare(`
    INSERT OR IGNORE INTO concept_related_notes (concept_id, url) VALUES (?, ?)
  `)

    const insertReference = db.prepare(`
    INSERT INTO concept_references (concept_id, ref_type, title, url, content_type)
    VALUES (?, ?, ?, ?, ?)
  `)

    let conceptCount = 0
    let aliasCount = 0
    let tagCount = 0
    let relatedNoteCount = 0
    let referenceCount = 0

    // Use transaction for better performance
    const insertAll = db.transaction(() => {
        for (const [id, { concept, filePath }] of concepts) {
            const contentHash = calculateContentHash(concept)

            // Insert main concept
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
            conceptCount++

            // Insert aliases
            if (concept.aliases && concept.aliases.length > 0) {
                for (const alias of concept.aliases) {
                    insertAlias.run(concept.id, alias)
                    aliasCount++
                }
            }

            // Insert tags
            if (concept.tags && concept.tags.length > 0) {
                for (const tag of concept.tags) {
                    insertTag.run(concept.id, tag)
                    tagCount++
                }
            }

            // Insert related notes
            if (concept.relatedNotes && concept.relatedNotes.length > 0) {
                for (const url of concept.relatedNotes) {
                    insertRelatedNote.run(concept.id, url)
                    relatedNoteCount++
                }
            }

            // Insert articles
            if (concept.articles && concept.articles.length > 0) {
                for (const article of concept.articles) {
                    insertReference.run(
                        concept.id,
                        'article',
                        article.title,
                        article.url,
                        article.type || null
                    )
                    referenceCount++
                }
            }

            // Insert books
            if (concept.books && concept.books.length > 0) {
                for (const book of concept.books) {
                    insertReference.run(concept.id, 'book', book.title, book.url, null)
                    referenceCount++
                }
            }

            // Insert references
            if (concept.references && concept.references.length > 0) {
                for (const ref of concept.references) {
                    insertReference.run(
                        concept.id,
                        'reference',
                        ref.title,
                        ref.url,
                        ref.type || null
                    )
                    referenceCount++
                }
            }

            // Insert tutorials
            if (concept.tutorials && concept.tutorials.length > 0) {
                for (const tutorial of concept.tutorials) {
                    insertReference.run(
                        concept.id,
                        'tutorial',
                        tutorial.title,
                        tutorial.url,
                        tutorial.type || null
                    )
                    referenceCount++
                }
            }
        }
    })

    insertAll()

    console.log(`  - Inserted ${conceptCount} concept records`)
    console.log(`  - Inserted ${aliasCount} aliases`)
    console.log(`  - Inserted ${tagCount} tags`)
    console.log(`  - Inserted ${relatedNoteCount} related notes`)
    console.log(`  - Inserted ${referenceCount} references`)
}

function getDatabaseSize(): string {
    try {
        const stats = fs.statSync(DB_PATH)
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
        return `${sizeInMB} MB`
    } catch {
        return 'Unknown'
    }
}

function main(): void {
    console.log('='.repeat(60))
    console.log('Initializing Concepts Database')
    console.log('='.repeat(60))

    // Check if database already exists
    if (fs.existsSync(DB_PATH)) {
        console.log(`\n⚠ Database already exists at: ${DB_PATH}`)
        console.log('Deleting existing database...')
        fs.unlinkSync(DB_PATH)
    }

    // Create database
    console.log(`\nCreating database at: ${DB_PATH}`)
    const db = new Database(DB_PATH)

    // Enable foreign keys
    db.pragma('foreign_keys = ON')

    try {
        // Create tables
        createTables(db)

        // Load concepts from JSON files
        const concepts = loadConcepts()

        // Insert concepts and related data
        insertConcepts(db, concepts)

        // Print summary
        console.log('\n' + '='.repeat(60))
        console.log('✓ Database initialized successfully')
        console.log('='.repeat(60))
        console.log(`Database location: ${DB_PATH}`)
        console.log(`Database size: ${getDatabaseSize()}`)
        console.log(`Total concepts: ${concepts.size}`)
        console.log('='.repeat(60))
    } catch (error) {
        console.error('\n❌ Error initializing database:', error)
        process.exit(1)
    } finally {
        db.close()
    }
}

main()
