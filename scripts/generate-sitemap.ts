#!/usr/bin/env tsx
/**
 * Generates a sitemap.xml for the concepts website.
 * Includes the homepage and all concept detail pages.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { Concept } from '../src/types/concept'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://concepts.dsebastien.net'

interface SitemapUrl {
    loc: string
    lastmod: string
    changefreq: string
    priority: string
}

// Load all concepts from individual files
const conceptsDir = join(__dirname, '../src/data/concepts')
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))
const concepts: Concept[] = conceptFiles.map((file) => {
    const filePath = join(conceptsDir, file)
    return JSON.parse(readFileSync(filePath, 'utf-8'))
})

// Extract all unique tags from concepts
const allTags = Array.from(new Set(concepts.flatMap((concept) => concept.tags))).sort()

// Extract all unique categories from concepts (excluding 'All')
const allCategories = Array.from(new Set(concepts.map((concept) => concept.category))).sort()

// Helper function to generate resource ID from URL
function generateResourceId(url: string): string {
    let hash = 0
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(36)
}

interface ExtractedResource {
    id: string
    url: string
}

// Extract unique books
const allBooks: ExtractedResource[] = []
const bookUrls = new Set<string>()
for (const concept of concepts) {
    if (concept.books) {
        for (const book of concept.books) {
            if (!bookUrls.has(book.url)) {
                bookUrls.add(book.url)
                allBooks.push({ id: generateResourceId(book.url), url: book.url })
            }
        }
    }
}

// Extract unique articles
const allArticles: ExtractedResource[] = []
const articleUrls = new Set<string>()
for (const concept of concepts) {
    if (concept.articles) {
        for (const article of concept.articles) {
            if (!articleUrls.has(article.url)) {
                articleUrls.add(article.url)
                allArticles.push({ id: generateResourceId(article.url), url: article.url })
            }
        }
    }
}

// Extract unique references
const allReferences: ExtractedResource[] = []
const referenceUrls = new Set<string>()
for (const concept of concepts) {
    if (concept.references) {
        for (const reference of concept.references) {
            if (!referenceUrls.has(reference.url)) {
                referenceUrls.add(reference.url)
                allReferences.push({ id: generateResourceId(reference.url), url: reference.url })
            }
        }
    }
}

// Extract unique notes
const allNotes: ExtractedResource[] = []
const noteUrls = new Set<string>()
for (const concept of concepts) {
    if (concept.relatedNotes) {
        for (const noteUrl of concept.relatedNotes) {
            if (!noteUrls.has(noteUrl)) {
                noteUrls.add(noteUrl)
                allNotes.push({ id: generateResourceId(noteUrl), url: noteUrl })
            }
        }
    }
}

// Get current date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0]

// Generate sitemap XML
function generateSitemap(): string {
    const urls: SitemapUrl[] = []

    // Add homepage
    urls.push({
        loc: BASE_URL,
        lastmod: today,
        changefreq: 'weekly',
        priority: '1.0'
    })

    // Add statistics page
    urls.push({
        loc: `${BASE_URL}/statistics`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add random page
    urls.push({
        loc: `${BASE_URL}/random`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.5'
    })

    // Add unexplored page
    urls.push({
        loc: `${BASE_URL}/unexplored`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.6'
    })

    // Add categories listing page
    urls.push({
        loc: `${BASE_URL}/categories`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add featured page
    urls.push({
        loc: `${BASE_URL}/featured`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add history page
    urls.push({
        loc: `${BASE_URL}/history`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add each concept page
    for (const concept of concepts) {
        urls.push({
            loc: `${BASE_URL}/concept/${concept.id}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.8'
        })
    }

    // Add each tag page
    for (const tag of allTags) {
        urls.push({
            loc: `${BASE_URL}/tag/${encodeURIComponent(tag)}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.6'
        })
    }

    // Add each category page
    for (const category of allCategories) {
        urls.push({
            loc: `${BASE_URL}/category/${encodeURIComponent(category)}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.7'
        })
    }

    // Add books listing page
    urls.push({
        loc: `${BASE_URL}/books`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add each book detail page
    for (const book of allBooks) {
        urls.push({
            loc: `${BASE_URL}/books/${book.id}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.6'
        })
    }

    // Add articles listing page
    urls.push({
        loc: `${BASE_URL}/articles`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add each article detail page
    for (const article of allArticles) {
        urls.push({
            loc: `${BASE_URL}/articles/${article.id}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.6'
        })
    }

    // Add references listing page
    urls.push({
        loc: `${BASE_URL}/references`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add each reference detail page
    for (const reference of allReferences) {
        urls.push({
            loc: `${BASE_URL}/references/${reference.id}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.6'
        })
    }

    // Add notes listing page
    urls.push({
        loc: `${BASE_URL}/notes`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add each note detail page
    for (const note of allNotes) {
        urls.push({
            loc: `${BASE_URL}/notes/${note.id}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.6'
        })
    }

    // Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n')}
</urlset>
`

    return xml
}

// Write sitemap to dist folder
function writeSitemap(): void {
    const distDir = join(__dirname, '../dist')

    // Create dist directory if it doesn't exist
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
    }

    const sitemapPath = join(distDir, 'sitemap.xml')
    const sitemap = generateSitemap()

    writeFileSync(sitemapPath, sitemap)
    console.log(`✓ Sitemap generated: ${sitemapPath}`)
    console.log(`  - Homepage: 1 URL`)
    console.log(`  - Statistics: 1 URL`)
    console.log(`  - Random: 1 URL`)
    console.log(`  - Unexplored: 1 URL`)
    console.log(`  - Categories listing: 1 URL`)
    console.log(`  - Featured: 1 URL`)
    console.log(`  - History: 1 URL`)
    console.log(`  - Concepts: ${concepts.length} URLs`)
    console.log(`  - Tags: ${allTags.length} URLs`)
    console.log(`  - Category pages: ${allCategories.length} URLs`)
    console.log(`  - Books: ${allBooks.length + 1} URLs (1 listing + ${allBooks.length} detail)`)
    console.log(
        `  - Articles: ${allArticles.length + 1} URLs (1 listing + ${allArticles.length} detail)`
    )
    console.log(
        `  - References: ${allReferences.length + 1} URLs (1 listing + ${allReferences.length} detail)`
    )
    console.log(`  - Notes: ${allNotes.length + 1} URLs (1 listing + ${allNotes.length} detail)`)
    const totalUrls =
        7 + // static pages (homepage, statistics, random, unexplored, categories, featured, history)
        concepts.length +
        allTags.length +
        allCategories.length +
        allBooks.length +
        1 +
        allArticles.length +
        1 +
        allReferences.length +
        1 +
        allNotes.length +
        1
    console.log(`  - Total: ${totalUrls} URLs`)
}

writeSitemap()
