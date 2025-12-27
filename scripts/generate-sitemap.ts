#!/usr/bin/env tsx
/**
 * Generates a sitemap.xml for the concepts website.
 * Includes the homepage and all concept detail pages.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://concepts.dsebastien.net'

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
    console.log(`  - Concepts: ${concepts.length} URLs`)
    console.log(`  - Tags: ${allTags.length} URLs`)
    console.log(`  - Total: ${concepts.length + allTags.length + 4} URLs`)
}

writeSitemap()
