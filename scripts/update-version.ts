/**
 * Updates the version in package.json to the specified version.
 * Usage: npx tsx scripts/update-version.ts <version>
 * Version can optionally have a 'v' prefix which will be stripped.
 */

import { readFileSync, writeFileSync } from 'fs'

const VERSION_REGEX = /^v?(\d+\.\d+\.\d+)$/

export function parseVersion(input: string): string {
    const match = input.match(VERSION_REGEX)
    if (!match?.[1]) {
        throw new Error(`Invalid version format: "${input}". Expected format: x.y.z or vx.y.z`)
    }
    return match[1]
}

export function updatePackageVersion(version: string): void {
    const packagePath = 'package.json'
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
    packageJson.version = version
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 4) + '\n')
    console.log(`Updated package.json version to ${version}`)
}

// Only run if executed directly
const isMain = process.argv[1]?.endsWith('update-version.ts')
if (isMain) {
    const version = process.argv[2]
    if (!version) {
        console.error('Usage: npx tsx scripts/update-version.ts <version>')
        console.error('Example: npx tsx scripts/update-version.ts 1.2.3')
        console.error('Example: npx tsx scripts/update-version.ts v1.2.3')
        process.exit(1)
    }

    const parsedVersion = parseVersion(version)
    updatePackageVersion(parsedVersion)
}
