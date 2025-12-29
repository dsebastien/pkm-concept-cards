/**
 * Generates or updates CHANGELOG.md using conventional-changelog.
 * Usage: npx tsx scripts/generate-changelog.ts
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'

export function generateChangelog(): string {
    // Generate changelog and capture output
    const result = execSync(
        'npx conventional-changelog -p conventionalcommits -i CHANGELOG.md -s -r 0',
        { encoding: 'utf-8' }
    )
    return result
}

export function getLatestChangelogEntry(): string {
    const changelogPath = 'CHANGELOG.md'
    if (!existsSync(changelogPath)) {
        return ''
    }

    const content = readFileSync(changelogPath, 'utf-8')
    // Extract the latest version section (between first and second ## headers)
    const sections = content.split(/^## /m)
    if (sections.length < 2) {
        return content
    }
    // Return the first version section (sections[0] is content before first ##)
    return '## ' + (sections[1] ?? '')
}

// Only run if executed directly
const isMain = process.argv[1]?.endsWith('generate-changelog.ts')
if (isMain) {
    console.log('Generating changelog...')
    generateChangelog()
    console.log('Changelog updated successfully.')

    const latestEntry = getLatestChangelogEntry()
    console.log('\n--- Latest changelog entry ---')
    console.log(latestEntry)
}
