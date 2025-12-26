/**
 * Concept data loader module.
 *
 * Uses Vite's import.meta.glob to efficiently load all concept files.
 * Each concept is stored in its own file under src/data/concepts/{concept-id}.json
 * Categories are stored separately in src/data/categories.json
 */

import type { Concept, ConceptsData } from '@/types/concept'
import categories from './categories.json'

// Use Vite's glob import to load all concept files eagerly
// This creates a single bundle with all concepts loaded at build time
const conceptModules = import.meta.glob<Concept>('./concepts/*.json', {
    eager: true,
    import: 'default'
})

// Extract concepts from the modules and sort by name
const concepts: Concept[] = Object.values(conceptModules).sort((a, b) =>
    a.name.localeCompare(b.name)
)

// Export the combined data structure matching ConceptsData interface
export const conceptsData: ConceptsData = {
    concepts,
    categories: categories as string[]
}

// Export individual parts for flexibility
export { concepts, categories }

// Default export for backwards compatibility
export default conceptsData
