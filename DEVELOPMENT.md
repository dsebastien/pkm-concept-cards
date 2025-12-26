# Development Guide

This guide explains how to build, run, and test the PKM Concepts website locally.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) (v10 or later)
- [Git](https://git-scm.com/)

## Setup

### Clone the Repository

```bash
git clone https://github.com/dsebastien/pkm-concept-cards.git
cd pkm-concept-cards
```

### Install Dependencies

```bash
npm install
```

## Development Workflow

### Start Development Server

Run the development server with hot module replacement:

```bash
npm run dev
```

This will:

- Start a local server at `http://localhost:5173`
- Enable hot module replacement for instant updates
- Watch for file changes and rebuild automatically

### Type Checking

Run TypeScript type checking:

```bash
npm run tsc
```

For continuous type checking during development, run the build in watch mode or use your IDE's TypeScript integration.

### Linting and Formatting

```bash
npm run lint        # Check for lint errors
npm run lint:fix    # Auto-fix lint errors
npm run format      # Format code with Prettier
npm run format:check # Check formatting without changes
```

## Building for Production

```bash
npm run build
```

This creates optimized production files in the `dist/` directory:

- `index.html` - Entry HTML file
- `assets/index-*.css` - Compiled and minified styles
- `assets/index-*.js` - Bundled and minified JavaScript
- `sitemap.xml` - Generated sitemap for SEO

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This serves the `dist/` directory at `http://localhost:4173`.

## Project Structure

```
pkm-concept-cards/
├── src/
│   ├── components/
│   │   ├── layout/         # Header, Footer, AppLayout
│   │   ├── concepts/       # Concept-specific components
│   │   └── ui/             # Reusable UI components
│   ├── data/
│   │   ├── concepts/       # Individual concept JSON files
│   │   │   └── *.json      # One file per concept (e.g., atomic-notes.json)
│   │   ├── categories.json # Categories list
│   │   ├── index.ts        # Concept loader module
│   │   ├── resources.json  # Footer resource links
│   │   └── socials.json    # Social media links
│   ├── types/
│   │   └── concept.ts      # TypeScript type definitions
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   ├── pages/
│   │   └── home.tsx        # Main homepage component
│   ├── styles/
│   │   └── index.css       # Tailwind CSS imports and theme
│   ├── main.tsx            # React entry point
│   └── index.html          # HTML template
├── public/
│   └── assets/             # Static assets (images, icons)
├── scripts/
│   ├── generate-sitemap.ts # Sitemap generation script
│   └── split-concepts.ts   # Utility to split concepts into files
├── dist/                   # Production build output
└── .github/
    └── workflows/          # CI/CD workflows
```

## Adding Content

### Adding a New Concept

1. Create a new file in `/src/data/concepts/` named `{concept-id}.json`
2. Add the concept object:

```json
{
    "id": "concept-id",
    "name": "Concept Name",
    "summary": "Brief one-sentence summary",
    "explanation": "Detailed explanation...",
    "tags": ["tag1", "tag2"],
    "category": "Methods",
    "featured": false,
    "icon": "FaBrain",
    "aliases": ["Alternative Name"],
    "relatedConcepts": ["other-concept-id"],
    "references": [
        {
            "title": "Reference Title",
            "url": "https://example.com",
            "type": "book"
        }
    ]
}
```

**Important:** The filename (without `.json`) must match the `id` field.

3. Run `npm run build` to verify the JSON is valid
4. Test with `npm run dev`

### Adding a New Category

1. Add the category to `/src/data/categories.json`
2. Add a fallback emoji in `/src/components/concepts/concept-icon.tsx` (in `categoryFallbacks`)

### Adding New Icons

1. Import the icon in `/src/components/concepts/concept-icon.tsx`
2. Add it to the `iconMap` object
3. Optionally add a color in `iconColors`

## Available Scripts

| Script             | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start development server with HMR  |
| `npm run build`    | Production build with type check   |
| `npm run preview`  | Preview production build locally   |
| `npm run tsc`      | Type check without emitting        |
| `npm run lint`     | Run ESLint                         |
| `npm run lint:fix` | Fix ESLint errors automatically    |
| `npm run format`   | Format code with Prettier          |
| `npm run commit`   | Interactive commit with Commitizen |
| `npm run release`  | Create and push a release tag      |

## Deployment

The website is automatically deployed to GitHub Pages when a new tag is pushed.

### Manual Release

```bash
npm run release
```

Follow the prompts to enter a tag name (e.g., `v1.0.0`). This will:

1. Create a git tag
2. Push the tag to origin
3. Trigger the GitHub Actions deployment workflow

### Deployment Workflow

The deployment process (defined in `.github/workflows/deploy.yml`):

1. Checks out the code
2. Sets up Node.js 20
3. Installs dependencies with `npm ci`
4. Builds the project with `npm run build`
5. Deploys to GitHub Pages

## Troubleshooting

### Build Errors

- Run `npm run tsc` for detailed TypeScript errors
- Run `npm run lint` for linting issues
- Ensure all concept JSON files are valid JSON

### Styles Not Updating

Tailwind CSS v4 uses JIT compilation. Try:

- Restarting the dev server
- Clearing your browser cache

### New Concept Not Appearing

- Verify the JSON syntax is valid
- Check that all required fields are present
- Look for errors in the browser console

### Development Server Issues

- Ensure port 5173 is not in use
- Try `npm run dev -- --port 3000` for a different port
- Delete `node_modules` and run `npm install` again

### Command Palette Not Opening

- Ensure you're not focused on an input field when pressing `/`
- Try `Ctrl+K` or `Cmd+K` as an alternative

## Browser Support

The website targets modern browsers:

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## Environment Variables

No environment variables are required for local development. The build automatically configures paths for GitHub Pages deployment.
