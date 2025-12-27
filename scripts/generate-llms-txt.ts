#!/usr/bin/env tsx
/**
 * Generates llms.txt - a machine-readable summary for AI crawlers.
 * This file helps LLMs understand the site structure and content.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Concept {
    id: string
    name: string
    summary: string
    tags: string[]
    category: string
    featured?: boolean
}

// Load all concepts
const conceptsDir = join(__dirname, '../src/data/concepts')
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))
const concepts: Concept[] = conceptFiles.map((file) => {
    const filePath = join(conceptsDir, file)
    return JSON.parse(readFileSync(filePath, 'utf-8'))
})

// Load categories
const categoriesPath = join(__dirname, '../src/data/categories.json')
const categories: string[] = JSON.parse(readFileSync(categoriesPath, 'utf-8'))

// Count tags
const tagCounts = new Map<string, number>()
concepts.forEach((concept) => {
    concept.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
})

// Sort tags by count
const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

// Get featured concepts or most common ones
const featuredConcepts = concepts.filter((c) => c.featured).slice(0, 10)

// If not enough featured, add some well-known ones
const popularConceptIds = [
    'zettelkasten',
    'para-method',
    'atomic-notes',
    'second-brain',
    'spaced-repetition',
    'flow-state',
    'pomodoro-technique',
    'mental-models',
    'feynman-technique',
    'inbox-zero'
]

const popularConcepts = popularConceptIds
    .map((id) => concepts.find((c) => c.id === id))
    .filter((c): c is Concept => c !== undefined)
    .slice(0, 10)

const highlightedConcepts = featuredConcepts.length >= 5 ? featuredConcepts : popularConcepts

// Generate llms.txt content
const content = `# Concepts by dSebastien

> A curated collection of ${concepts.length}+ PKM concepts, methods, and principles for knowledge management and personal development.

## About
Author: Sébastien Dubois
Website: https://dsebastien.net
Main Site: https://concepts.dsebastien.net
License: Content may be cited with attribution

## Content Structure
- / - Homepage with searchable concept grid
- /concept/{id} - Individual concept pages with detailed explanations
- /tag/{name} - Tag-filtered views showing related concepts

## Categories
${categories
    .filter((c) => c !== 'All')
    .map((cat) => {
        const count = concepts.filter((c) => c.category === cat).length
        return `- ${cat} (${count} concepts)`
    })
    .join('\n')}

## Key Topics
The collection covers these primary areas:
${topTags.map(([tag, count]) => `- ${tag} (${count} concepts)`).join('\n')}

## Popular Concepts
${highlightedConcepts.map((c) => `- ${c.name} - ${c.summary}`).join('\n')}

## Data Access
- Individual concept JSON files: /src/data/concepts/{concept-id}.json
- Categories list: /src/data/categories.json

## Contact
- Author: Sébastien Dubois (https://dsebastien.net)
- GitHub: https://github.com/dsebastien
- LinkedIn: https://www.linkedin.com/in/sebastiend/
`

// Write to dist folder
const distDir = join(__dirname, '../dist')
writeFileSync(join(distDir, 'llms.txt'), content)
console.log(`✓ llms.txt generated with ${concepts.length} concepts`)
