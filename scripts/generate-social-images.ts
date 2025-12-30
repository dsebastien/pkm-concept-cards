#!/usr/bin/env tsx
/**
 * Generates social media images (Open Graph / Twitter Cards) for:
 * - All concepts
 * - All tags
 * - All categories
 * - Main pages (home, statistics, etc.)
 *
 * Uses the social-card-empty.svg template and converts to PNG for social media compatibility.
 *
 * Options:
 * --force: Regenerate all images even if they already exist
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Resvg } from '@resvg/resvg-js'
import type { Concept } from '../src/types/concept'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse command-line arguments
const args = process.argv.slice(2)
const forceRegenerate = args.includes('--force')

// Load all concepts from individual files
const conceptsDir = join(__dirname, '../src/data/concepts')
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))
const concepts: Concept[] = conceptFiles.map((file) => {
    const filePath = join(conceptsDir, file)
    return JSON.parse(readFileSync(filePath, 'utf-8'))
})

// Extract all unique tags from concepts
const allTags = Array.from(new Set(concepts.flatMap((concept) => concept.tags))).sort()

// Load categories
const categoriesPath = join(__dirname, '../src/data/categories.json')
const categories: string[] = JSON.parse(readFileSync(categoriesPath, 'utf-8')).filter(
    (cat: string) => cat !== 'All'
)

// Read the SVG template
const templatePath = join(__dirname, '../public/assets/social-card-template.svg')
const svgTemplate = readFileSync(templatePath, 'utf-8')

// Helper function to escape XML special characters
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

// Helper function to truncate text if it's too long
function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
}

// Helper function to generate social image SVG
function generateSocialImage(text: string): string {
    const escapedText = escapeXml(truncateText(text, 50))
    return svgTemplate.replace('TEXT_GOES_HERE', escapedText)
}

// Helper function to convert SVG to PNG
function svgToPng(svgString: string): Buffer {
    const resvg = new Resvg(svgString, {
        fitTo: {
            mode: 'width',
            value: 1200
        }
    })
    const pngData = resvg.render()
    return pngData.asPng()
}

// Helper function to sanitize filename
function sanitizeFilename(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

// Create output directory structure
const outputDir = join(__dirname, '../public/assets/images/social-cards')
const conceptsOutputDir = join(outputDir, 'concepts')
const tagsOutputDir = join(outputDir, 'tags')
const categoriesOutputDir = join(outputDir, 'categories')
const pagesOutputDir = join(outputDir, 'pages')

// Ensure directories exist
for (const dir of [
    outputDir,
    conceptsOutputDir,
    tagsOutputDir,
    categoriesOutputDir,
    pagesOutputDir
]) {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }
}

let generatedCount = 0
let skippedCount = 0
const expectedFiles = new Set<string>()

// Generate images for concepts
console.log('Generating social images for concepts...')
console.log(`Total concepts: ${concepts.length}`)
for (let i = 0; i < concepts.length; i++) {
    const concept = concepts[i]
    const outputPath = join(conceptsOutputDir, `${concept.id}.png`)
    expectedFiles.add(outputPath)

    // Skip if file exists and force regeneration is not enabled
    if (!forceRegenerate && existsSync(outputPath)) {
        skippedCount++
        continue
    }

    console.log(`Generating ${i + 1}/${concepts.length}: ${concept.id}`)
    const svg = generateSocialImage(concept.name)
    const png = svgToPng(svg)
    writeFileSync(outputPath, png)
    generatedCount++
}
console.log(`✓ Concepts: ${generatedCount} generated, ${skippedCount} skipped`)

// Generate images for tags
console.log('Generating social images for tags...')
console.log(`Total tags: ${allTags.length}`)
let tagGenerated = 0
let tagSkipped = 0
for (let i = 0; i < allTags.length; i++) {
    const tag = allTags[i]
    const filename = sanitizeFilename(tag)
    const outputPath = join(tagsOutputDir, `${filename}.png`)
    expectedFiles.add(outputPath)

    // Skip if file exists and force regeneration is not enabled
    if (!forceRegenerate && existsSync(outputPath)) {
        tagSkipped++
        continue
    }

    console.log(`Generating tag ${i + 1}/${allTags.length}: ${tag}`)
    const svg = generateSocialImage(tag)
    const png = svgToPng(svg)
    writeFileSync(outputPath, png)
    tagGenerated++
    generatedCount++
}
console.log(`✓ Tags: ${tagGenerated} generated, ${tagSkipped} skipped`)

// Generate images for categories
console.log('Generating social images for categories...')
let categoryGenerated = 0
let categorySkipped = 0
for (const category of categories) {
    const filename = sanitizeFilename(category)
    const outputPath = join(categoriesOutputDir, `${filename}.png`)
    expectedFiles.add(outputPath)

    // Skip if file exists and force regeneration is not enabled
    if (!forceRegenerate && existsSync(outputPath)) {
        categorySkipped++
        continue
    }

    const svg = generateSocialImage(category)
    const png = svgToPng(svg)
    writeFileSync(outputPath, png)
    categoryGenerated++
    generatedCount++
}
console.log(`✓ Categories: ${categoryGenerated} generated, ${categorySkipped} skipped`)

// Generate images for main pages
console.log('Generating social images for main pages...')
const pages = [
    { name: 'Concepts', filename: 'home' },
    { name: 'Statistics', filename: 'statistics' },
    { name: 'Random Concept', filename: 'random' },
    { name: 'Unexplored Concepts', filename: 'unexplored' },
    { name: 'Categories', filename: 'categories' },
    { name: 'Featured Concepts', filename: 'featured' },
    { name: 'History', filename: 'history' },
    { name: 'Tags', filename: 'tags' },
    { name: 'Books', filename: 'books' },
    { name: 'Articles', filename: 'articles' },
    { name: 'References', filename: 'references' },
    { name: 'Notes', filename: 'notes' }
]

let pageGenerated = 0
let pageSkipped = 0
for (const page of pages) {
    const outputPath = join(pagesOutputDir, `${page.filename}.png`)
    expectedFiles.add(outputPath)

    // Skip if file exists and force regeneration is not enabled
    if (!forceRegenerate && existsSync(outputPath)) {
        pageSkipped++
        continue
    }

    const svg = generateSocialImage(page.name)
    const png = svgToPng(svg)
    writeFileSync(outputPath, png)
    pageGenerated++
    generatedCount++
}
console.log(`✓ Pages: ${pageGenerated} generated, ${pageSkipped} skipped`)

// Clean up orphaned images (images that no longer have corresponding entities)
console.log('\nCleaning up orphaned images...')
let removedCount = 0

const dirsToClean = [
    { dir: conceptsOutputDir, name: 'concepts' },
    { dir: tagsOutputDir, name: 'tags' },
    { dir: categoriesOutputDir, name: 'categories' },
    { dir: pagesOutputDir, name: 'pages' }
]

for (const { dir, name } of dirsToClean) {
    if (!existsSync(dir)) continue

    const existingFiles = readdirSync(dir)
        .filter((f) => f.endsWith('.png'))
        .map((f) => join(dir, f))

    for (const existingFile of existingFiles) {
        if (!expectedFiles.has(existingFile)) {
            unlinkSync(existingFile)
            removedCount++
            console.log(`  - Removed orphaned ${name} image: ${existingFile.split('/').pop()}`)
        }
    }
}

if (removedCount === 0) {
    console.log('✓ No orphaned images found')
}

console.log(`\n✓ Summary:`)
console.log(`  - Generated: ${generatedCount}`)
console.log(`  - Skipped: ${skippedCount + tagSkipped + categorySkipped + pageSkipped}`)
console.log(`  - Removed: ${removedCount}`)
console.log(`  - Output directory: ${outputDir}`)

if (forceRegenerate) {
    console.log(`  - Mode: Force regeneration (--force)`)
} else {
    console.log(`  - Mode: Incremental (use --force to regenerate all)`)
}
