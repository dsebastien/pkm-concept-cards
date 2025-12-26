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
pkm-concept-cards/
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
   scripts/
      generate-sitemap.ts # Sitemap generator
      split-concepts.ts   # Utility to split concepts.json into individual files
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
    "references": [
        {
            "title": "Book Title",
            "url": "https://book-url.com",
            "type": "book"
        }
    ],
    "tutorials": [
        {
            "title": "Tutorial Title",
            "url": "https://tutorial-url.com",
            "type": "video"
        }
    ]
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

### Optional Fields:

- `icon` - React-icon name or URL (see Icons section below)
- `aliases` - Alternative names for the concept
- `relatedConcepts` - Array of concept IDs for internal linking (clickable in the detail modal)
- `relatedNotes` - Array of URLs to related notes (external)
- `articles` - Array of article references
- `references` - Array of book/paper references
- `tutorials` - Array of tutorial references

### Reference Object Structure:

Each reference in `articles`, `references`, or `tutorials` has:

- `title` - Display title
- `url` - Link URL
- `type` - One of: `book`, `paper`, `website`, `video`, `podcast`, `other`

2. If the concept uses a new category, add it to `/src/data/categories.json`:

```json
["All", "Methods", "Systems", "Principles", "Techniques", "Tools", "Frameworks", "New Category"]
```

**Important:** The filename (without `.json`) must match the `id` field in the concept. This ID is used for:

- URL routing (e.g., `/#/concept/my-new-concept`)
- Related concepts linking (via `relatedConcepts` field)

## Categories

The available categories for concepts:

| Category     | Description                                      |
| ------------ | ------------------------------------------------ |
| `Methods`    | Note-taking and knowledge management methods     |
| `Systems`    | Complete PKM systems and frameworks              |
| `Principles` | Fundamental principles and best practices        |
| `Techniques` | Specific techniques for knowledge work           |
| `Tools`      | Tool-related concepts (not the tools themselves) |
| `Frameworks` | Organizational and thinking frameworks           |

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
- Related notes
- References (books, papers)
- Articles
- Tutorials

### ConceptIcon (`/src/components/concepts/concept-icon.tsx`)

Renders icons for concepts, supporting both React-icons and image URLs with category-based fallbacks.

## URL Structure

The website uses hash-based routing for GitHub Pages compatibility:

- Homepage: `https://pkm-concepts.dsebastien.net/`
- Concept detail: `https://pkm-concepts.dsebastien.net/#/concept/{concept-id}`
- With filters: `https://pkm-concepts.dsebastien.net/?category=Methods&tags=note-taking`

Query parameters are preserved when opening/closing concept modals.

## Accessibility Features

- Full keyboard navigation support
- ARIA labels on interactive elements
- Focus management in modals
- Command palette with keyboard shortcuts
- Semantic HTML structure

## Best Practices for Contributions

1. **Keep summaries concise** - One sentence that captures the essence
2. **Write clear explanations** - Explain what, how, and why
3. **Use consistent tags** - Check existing tags before creating new ones
4. **Add quality references** - Include authoritative sources
5. **Include aliases** - Help users find concepts by alternative names
6. **Test locally** - Run `npm run build` before committing
7. **Follow commit conventions** - Use conventional commits (feat, fix, docs, etc.)

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
