#!/usr/bin/env tsx
/**
 * Generates static HTML pages for all routes.
 * This creates a directory structure with index.html files for each route,
 * enabling direct URL access on static hosting like GitHub Pages.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://concepts.dsebastien.net'

interface Concept {
    id: string
    name: string
    summary: string
    explanation: string
    tags: string[]
    category: string
    aliases?: string[]
    relatedConcepts?: string[]
}

// Load all concepts from individual files
const conceptsDir = join(__dirname, '../src/data/concepts')
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))
const concepts: Concept[] = conceptFiles.map((file) => {
    const filePath = join(conceptsDir, file)
    return JSON.parse(readFileSync(filePath, 'utf-8'))
})

// Extract all unique tags
const allTags = Array.from(new Set(concepts.flatMap((concept) => concept.tags))).sort()

// Get all concept IDs
const allConceptIds = concepts.map((concept) => concept.id)

const distDir = join(__dirname, '../dist')

// Read the built index.html
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

/**
 * Escape HTML special characters to prevent XSS and broken HTML
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

/**
 * Escape string for JSON (handles quotes and special chars)
 */
function escapeJson(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
}

// Shared author schema for all pages
const authorSchema = {
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
    'name': 'Sébastien Dubois',
    'givenName': 'Sébastien',
    'familyName': 'Dubois',
    'url': 'https://dsebastien.net',
    'image': 'https://www.dsebastien.net/content/images/size/w2000/2024/04/Seb-2022.jpg',
    'jobTitle': 'Knowledge Management & Productivity Mentor',
    'worksFor': {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        'name': 'DeveloPassion',
        'url': 'https://developassion.be'
    },
    'sameAs': [
        'https://www.linkedin.com/in/sebastiend/',
        'https://bsky.app/profile/dsebastien.net',
        'https://pkm.social/@dsebastien',
        'https://github.com/dsebastien',
        'https://dsebastien.medium.com/',
        'https://dev.to/dsebastien',
        'https://www.youtube.com/@dsebastien',
        'https://www.twitch.tv/dsebastien',
        'https://stackoverflow.com/users/226630/dsebastien',
        'https://dsebastien.hashnode.dev/',
        'https://www.reddit.com/user/lechtitseb/',
        'https://x.com/dSebastien'
    ]
}

const publisherSchema = {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    'name': 'DeveloPassion',
    'url': 'https://developassion.be',
    'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.dsebastien.net/content/images/size/w256h256/2022/11/logo_symbol.png',
        'width': 256,
        'height': 256
    }
}

/**
 * Generate FAQ questions for a concept
 */
function generateFaqQuestions(
    concept: Concept
): Array<{
    '@type': string
    'name': string
    'acceptedAnswer': { '@type': string; 'text': string }
}> {
    const questions = []

    // Question 1: What is [concept]?
    questions.push({
        '@type': 'Question',
        'name': `What is ${concept.name}?`,
        'acceptedAnswer': {
            '@type': 'Answer',
            'text': concept.summary
        }
    })

    // Question 2: How does [concept] work? (use first part of explanation)
    const explanationParagraphs = concept.explanation.split('\n\n')
    if (explanationParagraphs.length > 0) {
        const howItWorks =
            explanationParagraphs[0].length > 500
                ? explanationParagraphs[0].substring(0, 497) + '...'
                : explanationParagraphs[0]
        questions.push({
            '@type': 'Question',
            'name': `How does ${concept.name} work?`,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': howItWorks
            }
        })
    }

    // Question 3: What category does [concept] belong to?
    questions.push({
        '@type': 'Question',
        'name': `What category does ${concept.name} belong to?`,
        'acceptedAnswer': {
            '@type': 'Answer',
            'text': `${concept.name} belongs to the "${concept.category}" category in personal knowledge management and productivity.`
        }
    })

    // Question 4: What are the key topics related to [concept]? (if has tags)
    if (concept.tags.length > 0) {
        questions.push({
            '@type': 'Question',
            'name': `What are the key topics related to ${concept.name}?`,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': `Key topics related to ${concept.name} include: ${concept.tags.join(', ')}.`
            }
        })
    }

    // Question 5: What are alternative names for [concept]? (if has aliases)
    if (concept.aliases && concept.aliases.length > 0) {
        questions.push({
            '@type': 'Question',
            'name': `What are alternative names for ${concept.name}?`,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': `${concept.name} is also known as: ${concept.aliases.join(', ')}.`
            }
        })
    }

    return questions
}

/**
 * Generate Article JSON-LD schema for a concept
 */
function generateConceptSchema(concept: Concept): string {
    const conceptUrl = `${BASE_URL}/concept/${concept.id}`
    const today = new Date().toISOString().split('T')[0]

    // Truncate explanation for articleBody if too long (max ~500 chars for schema)
    const articleBody =
        concept.explanation.length > 500
            ? concept.explanation.substring(0, 497) + '...'
            : concept.explanation

    // Generate FAQ questions
    const faqQuestions = generateFaqQuestions(concept)

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                '@id': `${conceptUrl}#article`,
                'headline': concept.name,
                'description': concept.summary,
                'articleBody': articleBody,
                'url': conceptUrl,
                'datePublished': today,
                'dateModified': today,
                'author': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'keywords': concept.tags.join(', '),
                'about': {
                    '@type': 'Thing',
                    'name': concept.category
                },
                'inLanguage': 'en',
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'Concepts',
                    'url': BASE_URL
                },
                ...(concept.aliases &&
                    concept.aliases.length > 0 && {
                        alternativeHeadline: concept.aliases.join(', ')
                    })
            },
            {
                '@type': 'FAQPage',
                '@id': `${conceptUrl}#faq`,
                'mainEntity': faqQuestions
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${conceptUrl}#breadcrumb`,
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': BASE_URL
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': concept.category,
                        'item': `${BASE_URL}/?category=${encodeURIComponent(concept.category)}`
                    },
                    {
                        '@type': 'ListItem',
                        'position': 3,
                        'name': concept.name,
                        'item': conceptUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate CollectionPage JSON-LD schema for a tag page
 */
function generateTagSchema(tag: string, encodedTag: string): string {
    const tagUrl = `${BASE_URL}/tag/${encodedTag}`

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${tagUrl}#collection`,
                'name': `${tag} - Concepts`,
                'description': `Explore concepts tagged with "${tag}"`,
                'url': tagUrl,
                'creator': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'Concepts',
                    'url': BASE_URL
                },
                'about': {
                    '@type': 'Thing',
                    'name': tag
                },
                'inLanguage': 'en'
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${tagUrl}#breadcrumb`,
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': BASE_URL
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': tag,
                        'item': tagUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate noscript content for a tag page
 */
function generateTagNoscript(tag: string): string {
    const taggedConcepts = concepts.filter((c) => c.tags.includes(tag))

    return `
    <noscript>
        <article class="noscript-content" style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
            <h1>${escapeHtml(tag)} - Concepts</h1>
            <p>Explore concepts tagged with "${escapeHtml(tag)}"</p>
            <p><strong>Total concepts:</strong> ${taggedConcepts.length}</p>
            <h2>Concepts</h2>
            <ul>
${taggedConcepts
    .map(
        (c) =>
            `                <li><a href="/concept/${c.id}">${escapeHtml(c.name)}</a> - ${escapeHtml(c.summary)}</li>`
    )
    .join('\n')}
            </ul>
            <p><a href="/">← Back to all concepts</a></p>
        </article>
    </noscript>`
}

/**
 * Generate customized HTML for a tag page with appropriate meta tags
 */
function generateTagPageHtml(tag: string, encodedTag: string): string {
    const tagUrl = `${BASE_URL}/tag/${encodedTag}`
    const title = `${tag} - Concepts`
    const description = `Explore concepts tagged with "${tag}"`

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${tagUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${tagUrl}" />`
    )
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:url" content="${tagUrl}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    // Replace JSON-LD schema with CollectionPage schema
    const tagSchema = generateTagSchema(tag, encodedTag)
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${tagSchema}\n        </script>`
    )

    // Add noscript content before </body>
    const noscriptContent = generateTagNoscript(tag)
    html = html.replace('</body>', `${noscriptContent}\n    </body>`)

    return html
}

/**
 * Generate noscript content for a concept page
 */
function generateConceptNoscript(concept: Concept): string {
    const relatedConceptsList = concept.relatedConcepts
        ? concept.relatedConcepts
              .map((id) => {
                  const related = concepts.find((c) => c.id === id)
                  return related
                      ? `<li><a href="/concept/${id}">${escapeHtml(related.name)}</a></li>`
                      : null
              })
              .filter(Boolean)
              .join('\n                ')
        : ''

    return `
    <noscript>
        <article class="noscript-content" style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
            <h1>${escapeHtml(concept.name)}</h1>
            <p><em>${escapeHtml(concept.summary)}</em></p>
            ${concept.aliases && concept.aliases.length > 0 ? `<p><strong>Also known as:</strong> ${concept.aliases.map(escapeHtml).join(', ')}</p>` : ''}
            <p><strong>Category:</strong> ${escapeHtml(concept.category)}</p>
            <p><strong>Tags:</strong> ${concept.tags.map((t) => `<a href="/tag/${encodeURIComponent(t)}">${escapeHtml(t)}</a>`).join(', ')}</p>
            <h2>Explanation</h2>
            <div>${escapeHtml(concept.explanation).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</div>
            ${
                relatedConceptsList
                    ? `<h2>Related Concepts</h2>
            <ul>
                ${relatedConceptsList}
            </ul>`
                    : ''
            }
            <p><a href="/">← Back to all concepts</a></p>
        </article>
    </noscript>`
}

/**
 * Generate customized HTML for a concept page with appropriate meta tags
 */
function generateConceptPageHtml(concept: Concept): string {
    const conceptUrl = `${BASE_URL}/concept/${concept.id}`
    const title = `${concept.name} - Concepts`
    const description = concept.summary

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${conceptUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${conceptUrl}" />`
    )
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:url" content="${conceptUrl}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    // Replace JSON-LD schema with Article schema
    const conceptSchema = generateConceptSchema(concept)
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${conceptSchema}\n        </script>`
    )

    // Add noscript content before </body>
    const noscriptContent = generateConceptNoscript(concept)
    html = html.replace('</body>', `${noscriptContent}\n    </body>`)

    return html
}

// Create directories and generate customized HTML for each concept
console.log('Generating static pages for concepts...')
let conceptCount = 0
for (const concept of concepts) {
    const conceptDir = join(distDir, 'concept', concept.id)
    mkdirSync(conceptDir, { recursive: true })
    const conceptHtml = generateConceptPageHtml(concept)
    writeFileSync(join(conceptDir, 'index.html'), conceptHtml)
    conceptCount++
}
console.log(`  ✓ Created ${conceptCount} concept pages`)

// Create directories and generate customized HTML for each tag
console.log('Generating static pages for tags...')
let tagCount = 0
for (const tag of allTags) {
    // URL-encode the tag for the directory name
    const encodedTag = encodeURIComponent(tag)
    const tagDir = join(distDir, 'tag', encodedTag)
    mkdirSync(tagDir, { recursive: true })

    // Generate customized HTML with tag-specific meta tags
    const tagHtml = generateTagPageHtml(tag, encodedTag)
    writeFileSync(join(tagDir, 'index.html'), tagHtml)
    tagCount++
}
console.log(`  ✓ Created ${tagCount} tag pages`)

// Create 404.html for GitHub Pages fallback (copy of index.html)
writeFileSync(join(distDir, '404.html'), indexHtml)
console.log('  ✓ Created 404.html fallback')

console.log(`\n✓ Static pages generated: ${conceptCount + tagCount + 2} total`)
console.log(`  - Homepage: 1`)
console.log(`  - Concepts: ${conceptCount}`)
console.log(`  - Tags: ${tagCount}`)
console.log(`  - 404 fallback: 1`)
