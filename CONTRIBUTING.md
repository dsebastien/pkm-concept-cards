# Contributing

Thank you for your interest in contributing to PKM Concepts!

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) (v10 or later)
- [Git](https://git-scm.com/)

### Fork and Clone

1. Fork this repository by clicking the "Fork" button on GitHub
2. Clone your fork locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/pkm-concept-cards.git
    cd pkm-concept-cards
    ```
3. Add the upstream repository as a remote:
    ```bash
    git remote add upstream https://github.com/dsebastien/pkm-concept-cards.git
    ```

### Install Dependencies

```bash
npm install
```

## Development Workflow

### Create a Branch

Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:

- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation changes
- `refactor/` for code refactoring
- `content/` for adding new concepts

### Development

Start the development server:

```bash
npm run dev
```

This will start a local server at `http://localhost:5173` with hot module replacement.

### Code Quality

Before committing, ensure your code passes all checks:

```bash
npm run format      # Format code
npm run lint        # Check for lint errors
npm run tsc         # Type check
npm run build       # Verify production build works
```

### Commit Your Changes

Write clear, concise commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add new feature description"
```

Common prefixes:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `refactor:` code refactoring
- `content:` adding or updating concepts
- `chore:` maintenance tasks

You can also use the interactive commit helper:

```bash
npm run commit
```

### Keep Your Fork Updated

Before creating a pull request, sync your fork with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

Resolve any conflicts if necessary.

### Push Your Changes

```bash
git push origin feature/your-feature-name
```

## Creating a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Ensure the base repository and branch are correct
4. Fill in the PR template:
    - Provide a clear title
    - Describe what changes you made and why
    - Reference any related issues (e.g., "Fixes #123")
5. Submit the pull request

## Pull Request Guidelines

- Keep PRs focused on a single change
- Ensure all CI checks pass
- Update documentation if needed
- Be responsive to feedback and review comments

## Adding New Concepts

To contribute new PKM concepts:

1. Edit `/src/data/concepts.json`
2. Add a new concept object with all required fields (see AGENTS.md for structure)
3. Ensure the concept has:
    - A unique `id` (lowercase, hyphenated)
    - A clear, concise `summary`
    - A thorough `explanation`
    - Relevant `tags`
    - Appropriate `category`
    - Quality `references` (books, articles, etc.)
4. Run `npm run build` to verify the JSON is valid
5. Test locally with `npm run dev`

## Code Style

This project uses:

- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** with strict mode enabled

The CI pipeline enforces these standards. Run `npm run format` and `npm run lint` before committing.

## Questions?

If you have questions, feel free to open an issue for discussion.
