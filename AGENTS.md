# AGENTS.md - Concepts Website Maintenance Guide

This document provides instructions for AI agents and developers on how to maintain and extend this concepts showcase website.

## Project Overview

This is a static website built with:

- **React 19** with TypeScript
- **Vite** for building and development
- **Tailwind CSS v4** for styling
- **React Router** for client-side routing (HashRouter for GitHub Pages compatibility)
- **React Icons** for iconography

The website showcases concepts, methods, and principles, with features like:

- Grid and list view modes
- Full-text search (across name, summary, explanation, tags, aliases)
- Category and tag filtering
- Command palette (press `/` or `Ctrl+K`)
- Detailed concept modals with references, articles, and tutorials
- Fully responsive design

## Project Structure

```
concept-cards/
   src/
      components/
         layout/          # Header, Footer, AppLayout
         concepts/        # Concept-specific components
            concept-card.tsx
            concept-detail-modal.tsx
            concepts-filter.tsx
            command-palette.tsx
            concept-icon.tsx
         ui/              # Reusable UI components
      data/
         concepts/        # Individual concept JSON files
            concept-id.json  # One file per concept (e.g., atomic-notes.json)
         categories.json  # Categories list
         index.ts         # Concept loader module
         resources.json   # Footer resources links
         socials.json     # Social media links
      types/
         concept.ts       # TypeScript types
      lib/
         utils.ts         # Utility functions
      pages/
         home.tsx         # Main homepage
      styles/
         index.css        # Tailwind imports and theme
      main.tsx            # React entry point
      index.html          # HTML template
   public/
      assets/
          images/         # Static images
              social-card-template.svg  # SVG template for social images
              social-cards/             # Generated social media sharing images (PNG)
                  concepts/             # One image per concept (concept-id.png)
                  tags/                 # One image per tag
                  categories/           # One image per category
                  pages/                # Main pages (home, statistics, etc.)
   scripts/
      generate-sitemap.ts        # Sitemap generator
      generate-social-images.ts  # Social images generator (SVG → PNG)
      split-concepts.ts          # Utility to split concepts.json into individual files
   .github/
      workflows/          # CI/CD workflows
   package.json
```

## Adding a New Concept

To add a new concept to the website, create a new JSON file in `/src/data/concepts/`:

1. Create a new file named `{concept-id}.json` (e.g., `my-new-concept.json`) with the following structure:

```json
{
    "id": "unique-concept-id",
    "name": "Concept Name",
    "summary": "A brief one-sentence summary of the concept",
    "explanation": "A detailed explanation of the concept. Can be multiple paragraphs. Explain what it is, how it works, and why it's useful.",
    "tags": ["tag1", "tag2", "tag3"],
    "category": "Methods",
    "icon": "FaBrain",
    "featured": false,
    "aliases": ["Alternative Name", "Another Name"],
    "relatedConcepts": ["other-concept-id", "another-concept-id"],
    "relatedNotes": ["https://link-to-related-note.com"],
    "articles": [
        {
            "title": "Article Title",
            "url": "https://article-url.com",
            "type": "website"
        }
    ],
    "books": [
        {
            "title": "Book Title by Author",
            "url": "https://amazon-affiliate-link.com"
        }
    ],
    "references": [
        {
            "title": "Paper or Website Title",
            "url": "https://reference-url.com",
            "type": "paper"
        }
    ],
    "tutorials": [
        {
            "title": "Tutorial Title",
            "url": "https://tutorial-url.com",
            "type": "video"
        }
    ],
    "datePublished": "2025-01-15",
    "dateModified": "2025-01-15"
}
```

### Required Fields:

- `id` - Unique identifier (lowercase, hyphenated)
- `name` - Display name of the concept
- `summary` - Brief one-sentence summary
- `explanation` - Detailed explanation (can be multi-paragraph)
- `tags` - Array of tags for filtering
- `category` - Must match one of the categories in the `categories` array
- `featured` - Boolean for featured highlighting
- `datePublished` - ISO 8601 date (YYYY-MM-DD) when the concept was first added
- `dateModified` - ISO 8601 date (YYYY-MM-DD) when the concept was last updated

### Optional Fields:

- `icon` - React-icon name or URL (see Icons section below)
- `aliases` - Alternative names for the concept
- `relatedConcepts` - Array of concept IDs for internal linking (clickable in the detail modal)
- `relatedNotes` - Array of URLs to related notes (external)
- `articles` - Array of article references
- `books` - Array of recommended books (dedicated section with amber styling)
- `references` - Array of paper/website references
- `tutorials` - Array of tutorial references

### Reference Object Structure:

Each reference in `articles`, `references`, or `tutorials` has:

- `title` - Display title
- `url` - Link URL
- `type` - One of: `paper`, `website`, `video`, `podcast`, `other` (note: books go in the dedicated `books` array)

### Book Object Structure:

Each book in `books` has:

- `title` - Display title (format: "Book Title by Author Name")
- `url` - Amazon affiliate link

**Note**: Books are stored separately from references for dedicated display with amber styling in the UI.

### Book References with Affiliate Links

**MANDATORY**: When adding book references, always use Amazon.com affiliate links with the affiliate tag `tag=dsebastien00-20`.

#### How to Add Book Links

1. **Search for the book on Amazon.com** (not regional Amazon sites)
2. **Get the Amazon ASIN/ISBN** from the product URL (e.g., `B07HSHBRXN` from `amazon.com/dp/B07HSHBRXN`)
3. **Construct the affiliate link** using this format:
    ```
    https://www.amazon.com/dp/[ASIN]?tag=dsebastien00-20
    ```

#### Examples

| Book Title              | Affiliate URL                                              |
| ----------------------- | ---------------------------------------------------------- |
| Atomic Habits           | `https://www.amazon.com/dp/0735211299?tag=dsebastien00-20` |
| How to Take Smart Notes | `https://www.amazon.com/dp/B09V5M8FR5?tag=dsebastien00-20` |
| Thinking, Fast and Slow | `https://www.amazon.com/dp/0374533555?tag=dsebastien00-20` |

#### Book Format

Books go in the dedicated `books` array (not `references`):

```json
{
    "title": "Book Title by Author Name",
    "url": "https://www.amazon.com/dp/ASIN?tag=dsebastien00-20"
}
```

#### Guidelines

- **Always include the affiliate tag** - Never add Amazon book links without `tag=dsebastien00-20`
- **Use amazon.com** - Always use the US Amazon site (amazon.com), not regional variants
- **Verify the link works** - Test that the ASIN is correct before adding
- **Include author in title** - Format as "Book Title by Author Name" for clarity
- **Add relevant books** - Only add books that are directly related to the concept
- **Check for existing books** - Avoid duplicate book references across concepts

### Tag Guidelines

**MANDATORY**: Tags must follow these rules to prevent duplicates and maintain consistency:

1. **Use hyphenated format** - Always use hyphens to separate words (e.g., `well-being`, `critical-thinking`, `systems-thinking`)

2. **Always use plural forms** - All tags MUST be pluralized:
    - `strategies` not `strategy`
    - `businesses` not `business`
    - `careers` not `career`
    - `innovations` not `innovation`
    - `risks` not `risk`

    **Exceptions** (keep singular):
    - Gerunds/activities: `brainstorming`, `teaching`, `investing`, `marketing`
    - Truly uncountable abstract nouns: `knowledge`, `wisdom`, `progress`, `entropy`
    - Fields of study: `psychology`, `sociology`, `epistemology`
    - Proper nouns: `toyota`, `bourdieu`

3. **Check existing tags first** - Before creating a new tag, list existing tags to avoid duplicates:

    ```bash
    # List all unique tags currently in use
    grep -h '"tags"' /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | sed 's/.*\[/[/' | tr ',' '\n' | tr -d '[]"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -v '^$' | sort -u
    ```

4. **Never introduce variations** - If a tag exists, use the exact existing form:
    - `well-being` (not `wellbeing`)
    - `cognitive-biases` (not `cognitive-bias` or `biases`)
    - `frameworks` (not `framework`)
    - `processes` (not `process`)

| Correct Tag        | Incorrect Variants                    |
| ------------------ | ------------------------------------- |
| `well-being`       | `wellbeing`                           |
| `cognitive-biases` | `cognitive-bias`, `biases`            |
| `strategies`       | `strategy`                            |
| `businesses`       | `business`                            |
| `innovations`      | `innovation`                          |
| `systems-thinking` | `systemsthinking`, `systems thinking` |

### Date Fields (datePublished / dateModified)

**MANDATORY**: All concepts must include `datePublished` and `dateModified` fields for SEO and content freshness tracking.

#### Date Format

- Use **ISO 8601 date format**: `YYYY-MM-DD` (e.g., `2025-01-15`)
- Do NOT include time or timezone information
- Always use the full 4-digit year

#### When Adding New Concepts

For **new concepts**, set both fields to today's date:

```json
{
    "datePublished": "2025-12-28",
    "dateModified": "2025-12-28"
}
```

#### When Updating Existing Concepts

When making **substantive changes** to a concept, update the `dateModified` field to today's date. Changes that warrant updating `dateModified`:

- Updating or expanding the explanation
- Adding new references, articles, or tutorials
- Modifying tags or categories
- Fixing factual errors
- Adding or updating related concepts

Changes that do **NOT** require updating `dateModified`:

- Fixing typos or minor grammatical errors
- Formatting changes (whitespace, JSON structure)
- Adding missing Wikipedia references (bulk operations)

**NEVER** modify `datePublished` - this represents the original creation date.

#### Bulk Operations Script

For bulk additions of dates to existing concepts (using git history), use:

```bash
# Run the script to populate dates from git history
npx tsx scripts/populate-concept-dates.ts
```

#### Verification

Before committing, verify date fields are present:

```bash
# Check for concepts missing datePublished or dateModified
for f in /home/dsebastien/wks/concept-cards/src/data/concepts/*.json; do
  if ! grep -q '"datePublished"' "$f" || ! grep -q '"dateModified"' "$f"; then
    echo "Missing date fields: $(basename "$f")"
  fi
done
```

2. If the concept uses a new category, add it to `/src/data/categories.json`:

```json
["All", "Methods", "Systems", "Principles", "Techniques", "Tools", "Frameworks", "New Category"]
```

**Important:** The filename (without `.json`) must match the `id` field in the concept. This ID is used for:

- URL routing (e.g., `/#/concept/my-new-concept`)
- Related concepts linking (via `relatedConcepts` field)

### Social Images for Concepts

**IMPORTANT**: After adding, renaming, or removing concepts, you **MUST** regenerate social images.

Social images are PNG files (1200x630px) used for Open Graph and Twitter Card previews when sharing links. They are automatically generated from a template and stored in `/public/assets/images/social-cards/`.

#### When to Regenerate Social Images

**MANDATORY regeneration** in these scenarios:

1. **Adding a new concept** - Creates a new social image with the concept name
2. **Renaming a concept** - Creates new image with updated name, removes old image
3. **Removing a concept** - Deletes the associated social image
4. **Renaming concept ID** - Removes old social image file, creates new one

#### How to Regenerate Social Images

Run the social image generation script:

```bash
npm run generate-social-images
```

This will:

- Generate PNG social images for **all concepts** (not just new ones)
- Generate images for all tags and categories
- Convert SVG template to PNG format (required for social media compatibility)
- Output to `/public/assets/images/social-cards/` with subdirectories:
    - `concepts/` - One PNG per concept (filename = concept ID)
    - `tags/` - One PNG per tag
    - `categories/` - One PNG per category
    - `pages/` - Main pages (home, statistics, etc.)

#### Manual Cleanup for Renamed/Removed Concepts

If you renamed or removed concepts:

1. **After renaming a concept ID**: Delete the old social image manually:

    ```bash
    rm /home/dsebastien/wks/concept-cards/public/assets/images/social-cards/concepts/old-concept-id.png
    ```

2. **After removing a concept**: Delete its social image:

    ```bash
    rm /home/dsebastien/wks/concept-cards/public/assets/images/social-cards/concepts/removed-concept-id.png
    ```

3. **Bulk cleanup** (removes orphaned images for deleted concepts):
    ```bash
    # This script compares concept JSON files with social images and removes orphans
    # TODO: Create automated cleanup script
    ```

#### Verification

After regenerating, verify:

```bash
# Check that new concept has a social image
ls /home/dsebastien/wks/concept-cards/public/assets/images/social-cards/concepts/my-new-concept.png

# Check file size (should be ~20-30KB)
ls -lh /home/dsebastien/wks/concept-cards/public/assets/images/social-cards/concepts/my-new-concept.png
```

**Note**: Social images are automatically regenerated during the build process (`npm run build`), but you should regenerate them explicitly when adding/modifying concepts to ensure they're up-to-date before committing.

## Categories

The available categories for concepts:

| Category                     | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `Methods`                    | Note-taking and knowledge management methods           |
| `Systems`                    | Complete PKM systems and frameworks                    |
| `Tools`                      | Tool-related concepts (not the tools themselves)       |
| `Principles`                 | Fundamental principles and best practices              |
| `Techniques`                 | Specific techniques for knowledge work                 |
| `Frameworks`                 | Organizational and thinking frameworks                 |
| `Cognitive Biases`           | Systematic errors in thinking and judgment             |
| `Psychology & Mental Models` | Psychological concepts and mental frameworks           |
| `Philosophy & Wisdom`        | Philosophical concepts and wisdom traditions           |
| `Well-Being & Happiness`     | Mental health, happiness, and well-being practices     |
| `Decision Science`           | Decision-making frameworks and problem-solving         |
| `Business & Economics`       | Business concepts, marketing, and economics            |
| `Leadership & Management`    | Leadership, management, and organizational concepts    |
| `Learning & Education`       | Learning strategies, memory, and education             |
| `Writing & Content Creation` | Writing techniques and content creation                |
| `Attention & Focus`          | Attention management and focus strategies              |
| `Communication`              | Communication skills and practices                     |
| `Thinking`                   | Cognitive approaches and thinking strategies           |
| `Software Development`       | Software engineering concepts                          |
| `Productivity`               | Productivity and efficiency concepts                   |
| `AI`                         | Artificial intelligence concepts                       |
| `Journaling`                 | Journaling practices and techniques                    |
| `Concepts`                   | General concepts that don't fit specialized categories |

### Category Assignment Guidelines

When adding new concepts, use these criteria to determine the category:

1. **Check specialized categories first** - If concept matches a specialized category (Psychology, Philosophy, etc.), use it instead of generic categories
2. **Primary focus determines category** - If concept has multiple themes, choose category based on primary focus
3. **Prefer specialized over generic** - Use Concepts category only if no specialized category fits
4. **Tag alignment** - Category should align with the concept's tags

**Decision tree:**

- Is it a cognitive bias? → Cognitive Biases
- Is it primarily psychological? → Psychology & Mental Models
- Is it philosophical/wisdom? → Philosophy & Wisdom
- Is it about well-being/happiness? → Well-Being & Happiness
- Is it about business/economics? → Business & Economics
- Is it about decision-making? → Decision Science
- Is it about leadership/management? → Leadership & Management
- Is it about learning/education? → Learning & Education
- Is it about writing/content? → Writing & Content Creation
- Is it about attention/focus? → Attention & Focus
- Is it about communication? → Communication
- Is it a systematic approach with steps? → Methods
- Is it a complete system/framework? → Systems or Frameworks
- Is it a fundamental principle/law? → Principles
- Is it a specific actionable technique? → Techniques
- Is it tool-related? → Tools
- Otherwise → Concepts (minimize this)

## Icons

Concepts can have custom icons specified via the `icon` field. The icon can be:

1. **React-icon name** - A component name from `react-icons` library (e.g., `"FaBrain"`, `"FaLink"`)
2. **URL** - An absolute URL or path to an image (e.g., `"https://example.com/icon.svg"`)

### Available React Icons

The following icons are pre-imported in `/src/components/concepts/concept-icon.tsx`:

**Concept icons:**

- `FaLightbulb` - Ideas/Insights
- `FaBrain` - Knowledge/Thinking
- `FaBook` - Books/Reading
- `FaBookOpen` - Learning
- `FaSitemap` - Structure/Hierarchy
- `FaProjectDiagram` - Connections/Diagrams
- `FaLink` - Linking/Connections
- `FaCubes` - Building blocks
- `FaLayerGroup` - Layers/Organization
- `FaNetworkWired` - Networks
- `FaAtom` - Atomic concepts
- `FaPuzzlePiece` - Components
- `FaCogs` - Systems/Processes
- `FaCompass` - Navigation/Direction
- `FaDatabase` - Storage/Repository
- `FaStream` - Flow/Process
- `FaTags` - Tagging/Classification

**Social/utility icons:**

- `FaGithub`, `FaYoutube`, `FaLinkedin`, `FaXTwitter`, `FaThreads`
- `FaUser`, `FaEnvelope`, `FaGraduationCap`, `FaStickyNote`
- `SiObsidian`, `SiSubstack`, `SiBluesky`

To add more icons, import them in `/src/components/concepts/concept-icon.tsx` and add them to the `iconMap` object.

### Fallback Behavior

If no `icon` is specified or the icon name is not found, the component falls back to category-based emojis:

- Methods: 📝
- Systems: 🔄
- Principles: 💡
- Techniques: 🛠️
- Tools: 🔧
- Frameworks: 🏗️

## Modifying Categories

Categories are defined in `/src/data/categories.json`. The first category should always be "All" which shows all concepts.

To add a new category:

1. Add it to the `categories.json` array
2. Assign concepts to it by setting their `category` field in their respective concept file
3. Add a fallback emoji in `/src/components/concepts/concept-icon.tsx` (in the `categoryFallbacks` object)

## Styling

The website uses Tailwind CSS v4 with custom theme variables defined in `/src/styles/index.css`:

```css
@theme {
    --color-primary: #ffffff; /* Main text color */
    --color-secondary: #e5007d; /* Accent color (pink) */
    --color-secondary-text: #ff1493; /* Hover text color */
    --color-background: #37404c; /* Background color */
}
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run tsc
```

## Deployment

The website is automatically deployed to GitHub Pages when a new tag is pushed:

```bash
# Create and push a new release tag
npm run release
# Follow the prompts to enter a tag name (e.g., v1.0.0)
```

The deployment workflow is defined in `.github/workflows/deploy.yml`.

## Key Components

### ConceptCard (`/src/components/concepts/concept-card.tsx`)

Displays individual concept cards in both grid and list view modes. Shows:

- Concept name and icon
- Category badge
- Summary (2-line clamp)
- Tags (up to 3 visible)
- Aliases (if present)
- Reference/article/tutorial counts

### ConceptsFilter (`/src/components/concepts/concepts-filter.tsx`)

Contains the search box, category tabs, and tag filter options.

### CommandPalette (`/src/components/concepts/command-palette.tsx`)

Global search/command palette accessible via `/` or `Ctrl+K`. Allows quick navigation to concepts and category filtering.

### ConceptDetailModal (`/src/components/concepts/concept-detail-modal.tsx`)

Modal showing detailed concept information when a card is clicked:

- Full explanation
- All tags
- Aliases
- Related concepts (clickable)
- Related notes
- Books (dedicated section with amber styling)
- References (papers, websites)
- Articles
- Tutorials

### ConceptIcon (`/src/components/concepts/concept-icon.tsx`)

Renders icons for concepts, supporting both React-icons and image URLs with category-based fallbacks.

## URL Structure

The website uses hash-based routing for GitHub Pages compatibility:

- Homepage: `https://concepts.dsebastien.net/`
- Concept detail: `https://concepts.dsebastien.net/#/concept/{concept-id}`
- With filters: `https://concepts.dsebastien.net/?category=Methods&tags=note-taking`

Query parameters are preserved when opening/closing concept modals.

## Accessibility Features

- Full keyboard navigation support
- ARIA labels on interactive elements
- Focus management in modals
- Command palette with keyboard shortcuts
- Semantic HTML structure

## Claude Code Skills

Skills are reusable instructions stored in `.claude/skills/` that help Claude perform specific tasks correctly and consistently.

### Mandatory Skill Usage

**IMPORTANT**: When a skill exists that is relevant to the current task, it **MUST** be used. Available skills in this project:

| Skill                | Location                             | Use When                                       |
| -------------------- | ------------------------------------ | ---------------------------------------------- |
| `fetch-public-notes` | `.claude/skills/fetch-public-notes/` | Extracting content from `notes.dsebastien.net` |

### Creating New Skills

When you identify a repeatable process or workflow that could benefit from standardized instructions, **create a new skill** to make future work easier. Consider creating a skill when:

- A task requires specific steps that are easy to forget or get wrong
- A workaround or non-obvious approach is needed (e.g., API endpoints, URL encoding)
- The same process will be repeated multiple times
- Documentation would help future agents or developers

**Skill structure:**

```
.claude/skills/skill-name/
├── SKILL.md          # Required - Contains frontmatter and instructions
└── supporting-files/ # Optional - Additional references
```

**SKILL.md format:**

```yaml
---
name: skill-name
description: Brief description of what this skill does and when to use it.
allowed-tools: Tool1, Tool2 # Optional - restricts available tools
---
# Skill Title

Instructions and documentation here...
```

## Best Practices for Contributions

1. **Always verify with database first** - Before adding a new concept, MUST run verification script (see Concept Duplicate Prevention with Database section below)
2. **Keep summaries concise** - One sentence that captures the essence
3. **Write clear explanations** - Explain what, how, and why
4. **Use consistent tags** - Check existing tags before creating new ones
5. **Add quality references** - Include authoritative sources
6. **Include aliases** - Help users find concepts by alternative names
7. **Test locally** - Run `npm run build` before committing
8. **Follow commit conventions** - Use conventional commits (feat, fix, docs, etc.)

## Concept Duplicate Prevention with Database

**MANDATORY**: Before adding ANY new concept, you MUST verify it doesn't already exist using the concepts database.

### Database Location

`/home/dsebastien/wks/concept-cards/concepts.db` - SQLite database containing all concepts with metadata for duplicate detection.

### Required Workflow for Adding Concepts

1. **ALWAYS run verification first**:

    ```bash
    npx tsx scripts/verify-concept.ts --name "Concept Name" --summary "Brief summary" --aliases "Alias 1,Alias 2"
    ```

2. **Interpret confidence score**:
    - **≥90% confidence**: Concept likely exists - STOP and review suggested duplicates
    - **70-89% confidence**: Manual review required - compare with suggested matches
    - **<70% confidence**: Proceed with adding concept

3. **Only proceed if confidence <90%** OR you've manually confirmed it's unique

4. **After creating concept JSON, sync database**:
    ```bash
    npx tsx scripts/sync-concepts-db.ts
    ```

### Claude Code Skill

**USE THE SKILL**: When working with concepts, ALWAYS use the `manage-concepts-db` skill:

```bash
# In Claude Code
/manage-concepts-db
```

This skill provides complete workflows for:

- Verifying concepts before adding
- Syncing database after changes
- Merging duplicates
- Database maintenance

### Duplicate Detection Methods

The verification script checks:

- **Exact name match** (95% confidence)
- **Alias cross-check** (90% confidence) - checks if name matches existing aliases
- **Fuzzy name similarity** (80-90% confidence) - Levenshtein distance
- **Summary similarity** (70-85% confidence) - TF-IDF cosine similarity
- **Explanation similarity** (60-80% confidence) - content overlap
- **Related notes URL overlap** (95% confidence) - same URL = strong duplicate signal
- **Reference overlap** (50-70% confidence) - shared books/articles

### Scripts Available

| Script                | Purpose                                    | When to Use                      |
| --------------------- | ------------------------------------------ | -------------------------------- |
| `init-concepts-db.ts` | Initialize and populate database           | First time setup or rebuild      |
| `verify-concept.ts`   | Check if concept exists before adding      | BEFORE creating any new concept  |
| `sync-concepts-db.ts` | Sync database with JSON files              | AFTER adding/editing any concept |
| `merge-duplicates.ts` | Merge duplicate concepts                   | When duplicates confirmed        |
| `find-duplicates.ts`  | Scan all concepts for potential duplicates | Periodic cleanup / data quality  |

### Example: Adding Concept from MoC

```bash
# 1. Verify concept doesn't exist
npx tsx scripts/verify-concept.ts --name "Parkinson's Law" --summary "Work expands to fill time available"

# Output: Confidence: 15% - No strong matches found. Safe to add.

# 2. Create concept JSON file
# ... (create /home/dsebastien/wks/concept-cards/src/data/concepts/parkinsons-law.json)

# 3. Sync database
npx tsx scripts/sync-concepts-db.ts

# Output: ✓ Added parkinsons-law to database
```

### Merging Duplicates

If verification finds a duplicate (≥90% confidence):

```bash
# Review both concepts
cat /home/dsebastien/wks/concept-cards/src/data/concepts/{source-id}.json
cat /home/dsebastien/wks/concept-cards/src/data/concepts/{target-id}.json

# Merge duplicates
npx tsx scripts/merge-duplicates.ts --source {source-id} --target {target-id} --strategy merge-fields

# Sync database
npx tsx scripts/sync-concepts-db.ts
```

This will:

- Combine tags, aliases, references (union)
- Keep target's core content
- Update cross-references
- Delete source file
- Update database

### What Counts as a Duplicate

- **Same concept, different name**: e.g., "SMART Goals" and "SMART Framework" are the same concept
- **Minor variations**: e.g., "Rule of 3" vs "Rule of Three" - use aliases instead
- **Similar frameworks**: Be careful with similar acronym-based frameworks (e.g., CODE vs C.O.D.E.C are different)

### When Concepts Are Similar But Not Duplicates

If two concepts are related but distinct:

1. Create separate concept files for each
2. Link them via `relatedConcepts`
3. Explain the differences in each concept's `explanation` field

### Example: CODE vs C.O.D.E.C

- **CODE Method**: Capture, Organize, Distill, Express (Tiago Forte's BASB)
- **C.O.D.E.C**: Capture, Organise, Deconstruct, Emerge, Create (different framework)

These are distinct concepts with different steps and philosophies, so both should exist with cross-references.

## Adding Concepts from MoCs (Maps of Content)

When tasked with reviewing MoCs to add new concepts, use sub-agents to parallelize the work for efficiency.

### Workflow for Bulk Concept Addition

1. **Read MoC files** from the notes repository (`/home/dsebastien/notesSeb/30 Areas/34 Maps/34.01 MoCs/`)
2. **Identify potential concepts** from the notes listed in each MoC
3. **Verify with database** that concepts don't exist (see Concept Duplicate Prevention with Database section)
4. **For each new concept to add**, spawn a sub-agent to:
    - Read the source note from the notes repository
    - Verify the note has sufficient content for a concept card
    - Create the concept JSON file with proper structure
    - Verify the related notes URL path exists

### Sub-Agent Usage Pattern

When adding multiple concepts, use parallel sub-agents:

```
For each concept to add:
  - Spawn sub-agent with subagent_type="general-purpose"
  - Task: "Research and create concept JSON for [concept-name]:
    1. Read note at [path]
    2. Create concept JSON at /home/dsebastien/wks/concept-cards/src/data/concepts/[id].json
    3. Follow the schema in AGENTS.md
    4. Verify relatedNotes URL path exists"
```

### Handling Light Source Content

**IMPORTANT**: When a source note has minimal content (e.g., just a sentence or two), **do NOT skip the concept**. Instead, generate appropriate content:

1. **Use the source note as a starting point** - Extract the core idea even if brief
2. **Generate a comprehensive explanation** - Use your knowledge to expand on the concept:
    - What is it?
    - How does it work?
    - Why is it useful?
    - When should it be applied?
3. **Research the concept** - If the concept is well-known (e.g., "Quality Circle", "Leitner System"), use your training knowledge to provide accurate, detailed information
4. **Add relevant references** - Include Wikipedia links, authoritative sources, or seminal books/papers when applicable
5. **Still link the source note** - Even if thin, include it in `relatedNotes` as the original reference

**Example**: A source note might only say:

> "A quality circle is a group of workers who meet to solve problems."

The generated concept should expand this to include: composition (3-5 members), leadership structure, historical context (1980s), goals (improve performance, quality, motivation), and relationship to Kaizen.

**When to truly skip a concept**:

- The note is just a quote with no actionable concept
- It's a duplicate of an existing concept
- It's a person's name or book title without conceptual content
- It's an article reference rather than a concept

### Post-Processing After Sub-Agents Complete

After all sub-agents finish:

1. Add any new icons to `concept-icon.tsx` if needed
2. Update existing concepts with cross-references to new concepts
3. Run `npm run build` to verify all changes work

## Visual Debugging with Playwright MCP

**IMPORTANT**: When debugging visual issues, layout problems, or UI behavior, **always use the Playwright MCP server** instead of manual inspection or headless screenshots.

### Setup

The Playwright MCP server should already be configured. To verify or add it:

```bash
# Check if Playwright MCP is configured
claude mcp list

# Add Playwright MCP if not present
claude mcp add playwright --transport stdio -- npx -y @playwright/mcp@latest
```

### Using Playwright for Debugging

When you need to inspect the UI:

1. **Start the dev server** (if not running):

    ```bash
    npm run dev
    ```

2. **Use Playwright tools** to interact with the page:
    - `browser_navigate` - Navigate to URLs (e.g., `http://localhost:5173/unexplored`)
    - `browser_screenshot` - Take screenshots of the current page
    - `browser_snapshot` - Get accessibility tree snapshots
    - `browser_click` - Click on elements
    - `browser_type` - Type text into inputs

### Example Workflow

```
1. Navigate to the page: browser_navigate to http://localhost:5173/unexplored
2. Take a screenshot: browser_screenshot to see the current state
3. Interact if needed: browser_click on elements, browser_type in inputs
4. Verify changes: browser_screenshot again after making code changes
```

### When to Use Playwright

- Debugging layout issues (grid columns, spacing, alignment)
- Testing responsive design at different viewport sizes
- Verifying visual changes after code modifications
- Inspecting hover states, animations, or interactive elements
- Testing navigation flows and modal behavior

### Benefits Over Headless Chrome

- Interactive debugging with real browser context
- Ability to click, type, and interact with elements
- Accessibility tree snapshots for understanding page structure
- Consistent viewport and rendering

## Troubleshooting

### Build fails with type errors

Run `npm run tsc` to see detailed TypeScript errors.

### Styles not updating

Tailwind CSS v4 uses JIT compilation. Try restarting the dev server.

### New concept not appearing

Verify the JSON file is valid and the concept has all required fields. Ensure the filename matches the `id` field. Check browser console for errors.

### Command palette not opening

Ensure you're not focused on an input field when pressing `/`.

### Icons not displaying

Check that the icon name is correctly spelled and added to the `iconMap` in `concept-icon.tsx`.

## Related Notes URLs

The `relatedNotes` field links concepts to the public notes website at `https://notes.dsebastien.net/`. **URLs must be verified against the actual file locations in the notes repository.**

### Notes Repository Location

The source notes are located at: `/home/dsebastien/notesSeb/`

### URL Construction Rules

1. **Base URL**: `https://notes.dsebastien.net/`
2. **Path mapping**: The file path from the notes repository maps to the URL with:
    - Spaces replaced with `+`
    - The `.md` extension removed
    - The path starting from `30 Areas/...`

### Common Note Locations

Notes can be in different folders depending on their type:

| Folder                                         | Description                | Example Path                                               |
| ---------------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| `32 Literature notes/32.02 Content/`           | Literature/reference notes | `32+Literature+notes/32.02+Content/Note+Name`              |
| `32 Literature notes/32.04 Expressions/`       | Expressions and sayings    | `32+Literature+notes/32.04+Expressions/Expression+Name`    |
| `32 Literature notes/32.05 Quotes/`            | Quotes                     | `32+Literature+notes/32.05+Quotes/Quote+Name`              |
| `33 Permanent notes/33.02 Content/`            | Permanent/evergreen notes  | `33+Permanent+notes/33.02+Content/Note+Name`               |
| `33 Permanent notes/33.04 Creations/Articles/` | Published articles         | `33+Permanent+notes/33.04+Creations/Articles/Article+Name` |

### Verification Process

**IMPORTANT**: Always verify the actual file path before adding a `relatedNotes` URL:

```bash
# Find a note by name
find /home/dsebastien/notesSeb/30\ Areas -type f -name "*Note Name*" 2>/dev/null | grep -v ".smart-env"

# Example: Finding "Billboard principle"
find /home/dsebastien/notesSeb/30\ Areas -type f -name "*Billboard*" 2>/dev/null | grep -v ".smart-env"
# Output: /home/dsebastien/notesSeb/30 Areas/32 Literature notes/32.02 Content/Billboard principle.md
# URL: https://notes.dsebastien.net/30+Areas/32+Literature+notes/32.02+Content/Billboard+principle
```

### When Note Doesn't Exist

If a note cannot be found in the repository:

- Set `relatedNotes` to an empty array: `"relatedNotes": []`
- Do NOT guess or assume the path

### Example Conversion

File path:

```
/home/dsebastien/notesSeb/30 Areas/32 Literature notes/32.04 Expressions/Nemo propheta in patria.md
```

Becomes URL:

```
https://notes.dsebastien.net/30+Areas/32+Literature+notes/32.04+Expressions/Nemo+propheta+in+patria
```

## Fetching Content from Public Notes Website

**IMPORTANT**: When extracting information from the public notes website (`https://notes.dsebastien.net/`), you **MUST** use the `fetch-public-notes` skill located at `.claude/skills/fetch-public-notes/SKILL.md`.

### Why This Skill is Required

The notes website is an **Obsidian Publish** site that loads content dynamically via JavaScript. Direct WebFetch requests to page URLs will fail and return only HTML boilerplate. The skill documents the correct approach using the Obsidian Publish API.

### Key Points

- **Never use direct page URLs** like `https://notes.dsebastien.net/30+Areas/...` for fetching content
- **Always use the Obsidian Publish API** at `https://publish-01.obsidian.md/access/91ab140857992a6480c9352ca75acb70/[path].md`
- The skill provides URL encoding rules, examples, and alternative local file access methods

### When to Use This Skill

- Fetching MoC (Map of Content) files to identify concepts
- Reading note content to create concept cards
- Extracting information from any note on the public website
- Verifying note content before adding `relatedNotes` URLs

Refer to the skill documentation for complete instructions and examples.
