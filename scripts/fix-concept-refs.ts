#!/usr/bin/env tsx
/**
 * Fixes invalid relatedConcepts references by:
 * 1. Mapping to correct existing concepts (plural -> singular, typos, etc.)
 * 2. Removing references that don't exist and have no valid mapping
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

// Paths
const conceptsDir = join(__dirname, '../src/data/concepts')

// Load all concepts
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))
const allConceptIds = new Set<string>()

for (const file of conceptFiles) {
    allConceptIds.add(file.replace('.json', ''))
}

console.log(`Loaded ${allConceptIds.size} concepts\n`)

// Manual mappings for known corrections
const manualMappings: Record<string, string> = {
    // Plural -> Singular
    'burnouts': 'burnout',
    'anxieties': 'anxiety',
    'stresses': 'stress-response',
    'motivations': 'motivation',
    'feedbacks': 'feedback-loops',
    'routines': 'daily-routine',
    'philosophies': 'philosophy',
    'organizations': 'organizational-culture',
    'relationships': 'social-capital',
    'communications': 'communication',
    'competitions': 'competitive-advantage',

    // Typos / alternate names
    'large-language-model': 'large-language-models',
    'environmental-design': 'environment-design',
    'first-principles-thinking': 'first-principles',
    'gamblers-fallacy': 'gambler-fallacy',
    'parkinsons-law': 'parkinson-law',
    'knowledge-workers': 'knowledge-worker',
    'timeboxing': 'time-boxing',
    'regression-to-mean': 'regression-to-the-mean',
    'paying-it-forward': 'pay-it-forward',

    // Conceptual mappings
    'habits': 'habit-loop',
    'habit-formation': 'habit-loop',
    'behavior-change': 'behavioral-activation',
    'productivity': 'knowledge-work-productivity',
    'creativity': 'creative-thinking',
    'meditation': 'mindfulness-meditation',
    'reflection': 'reflective-thinking',
    'empathy': 'empathic-listening',
    'happiness': 'happiness-practices',
    'networking': 'networked-thought',
    'iteration': 'iterative-note-taking',
    'experimentation': 'experimental-mindset',
    'wisdom': 'wisdom-of-crowds',
    'procrastination': 'procrastination-equation',
    'sleep': 'sleep-architecture',
    'automation': 'automating-processes',
    'meaning': 'meaningful-pursuits',
    'learning': 'learning-curve',
    'decision-making': 'decision-matrix',

    // Remove these (no good mapping, too generic)
    'self-awareness': '',
    'well-being': '',
    'ethics': '',
    'collaboration': '',
    'cognitive-biases': '',
    'buddhism': '',
    'boundaries': '',
    'virtue': '',
    'acceptance': '',
    'willpower': '',
    'self-control': '',
    'trust': '',
    'presence': '',
    'planning': '',
    'momentum': '',
    'vulnerability': '',
    'recovery': '',
    'balance': '',
    'harmony': '',
    'integration': '',
    'enlightenment': '',
    'knowledge': '',
    'education': '',
    'incubation': '',
    'cue-routine-reward': '',
    'automaticity': '',
    'friction': '',
    'style': '',
    'professional-writing': '',
    'accountability': '',
    'fight-or-flight': '',
    'artificial-intelligence': '',
    'learning-analytics': '',
    'platform-thinking': '',
    'building-blocks': '',
    'emergence': '',
    'hypothesis-testing': '',
    'nihilism': '',
    'revolt': '',
    'sisyphus': '',
    'camus': '',
    'goal-specification': '',
    'unintended-consequences': '',
    'fact-checking': '',
    'ai-limitations': '',
    'verifications': '',
    'risk-management': '',
    'responsible-ai': '',
    'ai-governance': '',
    'randomness': '',
    'model-parameters': '',
    'output-control': '',
    'rational-irrationality': '',
    'innovation-mindset': '',
    'breakthrough-thinking': '',
    'ambitious-goals': '',
    'blind-spots': '',
    'tool-use': '',
    'workflow-automation': '',
    'generalization': '',
    'instruction-tuning': '',
    'cooperation': '',
    'value-creation': '',
    'desirable-difficulty': '',
    'negotiation': ''
}

// Try to find a valid mapping for an invalid concept ID
function findMapping(invalidId: string): string | null {
    // Check manual mappings first
    if (invalidId in manualMappings) {
        const mapped = manualMappings[invalidId]
        if (mapped === '') return null // Explicitly remove
        if (allConceptIds.has(mapped)) return mapped
    }

    // Try removing trailing 's' (plural -> singular)
    const singular = invalidId.replace(/s$/, '')
    if (allConceptIds.has(singular)) return singular

    // Try 'ies' -> 'y'
    const yForm = invalidId.replace(/ies$/, 'y')
    if (allConceptIds.has(yForm)) return yForm

    // Try adding 's' (singular -> plural)
    const plural = invalidId + 's'
    if (allConceptIds.has(plural)) return plural

    // Try with hyphens
    const hyphenated = invalidId.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    if (allConceptIds.has(hyphenated)) return hyphenated

    return null
}

let totalFixed = 0
let totalRemoved = 0
let filesModified = 0

for (const file of conceptFiles) {
    const filePath = join(conceptsDir, file)
    const concept: Concept = JSON.parse(readFileSync(filePath, 'utf-8'))

    if (!concept.relatedConcepts || concept.relatedConcepts.length === 0) continue

    let modified = false
    const newRelatedConcepts: string[] = []

    for (const relatedId of concept.relatedConcepts) {
        if (allConceptIds.has(relatedId)) {
            // Valid, keep it
            newRelatedConcepts.push(relatedId)
        } else {
            // Invalid, try to find mapping
            const mapped = findMapping(relatedId)
            if (mapped) {
                if (!newRelatedConcepts.includes(mapped)) {
                    newRelatedConcepts.push(mapped)
                    console.log(`  ${file}: ${relatedId} -> ${mapped}`)
                    totalFixed++
                }
                modified = true
            } else {
                // No mapping found, remove it
                console.log(`  ${file}: removed "${relatedId}"`)
                totalRemoved++
                modified = true
            }
        }
    }

    if (modified) {
        concept.relatedConcepts = newRelatedConcepts
        writeFileSync(filePath, JSON.stringify(concept, null, 4) + '\n')
        filesModified++
    }
}

console.log('\n' + '='.repeat(50))
console.log('Summary:')
console.log(`  Files modified: ${filesModified}`)
console.log(`  References fixed: ${totalFixed}`)
console.log(`  References removed: ${totalRemoved}`)
