# Plan: SQLite Concept Duplicate Detection System

## Overview

Implement a SQLite database-based system to prevent concept duplicates and enforce data quality checks before adding new concepts to the knowledge base.

## Goals

1. **Prevent duplicates**: Ensure 90%+ confidence that a concept doesn't already exist before adding
2. **Automated verification**: Scripts to check for duplicates using multiple similarity metrics
3. **Enforce consistency**: Update AGENTS.md to mandate database checks
4. **Claude Code Skill**: Create reusable skill for efficient database operations
5. **Clean existing data**: Merge 2 confirmed duplicates identified in exploration

## Database Schema

### Location

`/home/dsebastien/wks/concept-cards/concepts.db` (root of repository)

### Tables

#### 1. `concepts` (main table)

```sql
CREATE TABLE concepts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  explanation TEXT NOT NULL,
  category TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  date_published TEXT NOT NULL,
  date_modified TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_name ON concepts(name);
CREATE INDEX idx_category ON concepts(category);
CREATE INDEX idx_content_hash ON concepts(content_hash);
```

#### 2. `concept_aliases` (normalized aliases)

```sql
CREATE TABLE concept_aliases (
  concept_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (concept_id, alias)
);

CREATE INDEX idx_alias ON concept_aliases(alias);
```

#### 3. `concept_tags` (normalized tags)

```sql
CREATE TABLE concept_tags (
  concept_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (concept_id, tag)
);

CREATE INDEX idx_tag ON concept_tags(tag);
```

#### 4. `concept_related_notes` (normalized related notes URLs)

```sql
CREATE TABLE concept_related_notes (
  concept_id TEXT NOT NULL,
  url TEXT NOT NULL,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (concept_id, url)
);

CREATE INDEX idx_related_url ON concept_related_notes(url);
```

#### 5. `concept_references` (all references: articles, books, tutorials, references)

```sql
CREATE TABLE concept_references (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id TEXT NOT NULL,
  ref_type TEXT NOT NULL CHECK(ref_type IN ('article', 'book', 'reference', 'tutorial')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content_type TEXT CHECK(content_type IN ('paper', 'website', 'video', 'podcast', 'other')),
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

CREATE INDEX idx_ref_concept ON concept_references(concept_id);
CREATE INDEX idx_ref_url ON concept_references(url);
```

#### 6. `duplicate_checks` (audit log of duplicate checks)

```sql
CREATE TABLE duplicate_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  concept_name TEXT NOT NULL,
  concept_summary TEXT NOT NULL,
  found_duplicates INTEGER NOT NULL,
  similarity_scores TEXT, -- JSON array of {concept_id, score, reason}
  action_taken TEXT -- 'added', 'rejected', 'merged', 'manual_review'
);
```

## Similarity Detection Algorithm

### Multi-Factor Duplicate Detection

1. **Exact ID Match** (100% confidence)
    - Check if `id` exists in database

2. **Exact Name Match** (95% confidence)
    - Normalize names (lowercase, trim, remove special chars)
    - Check if name exists in `concepts.name`

3. **Alias Cross-Check** (90% confidence)
    - Check if proposed name appears in any existing concept's aliases
    - Check if proposed aliases match any existing concept's name

4. **Fuzzy Name Similarity** (80-90% confidence based on score)
    - Use Levenshtein distance or Jaro-Winkler similarity
    - Flag if similarity > 0.85

5. **Summary Similarity** (70-85% confidence based on score)
    - TF-IDF cosine similarity on summary text
    - Flag if similarity > 0.75

6. **Explanation Similarity** (60-80% confidence based on score)
    - TF-IDF cosine similarity on first 500 chars of explanation
    - Flag if similarity > 0.70

7. **Related Notes URL Overlap** (95% confidence)
    - Check if any `relatedNotes` URLs already exist in database
    - Same URL = very strong duplicate signal

8. **Combined Reference Overlap** (50-70% confidence)
    - Check overlap of books/articles/references
    - High overlap suggests related or duplicate content

### Confidence Scoring System

```
Final Confidence Score = weighted average of:
- Exact name match: 95%
- Alias match: 90%
- Name similarity (>0.85): 80-90% (proportional)
- Summary similarity (>0.75): 70-85% (proportional)
- Explanation similarity (>0.70): 60-80% (proportional)
- Related notes overlap: 95% per matching URL
- Reference overlap: 50-70% (proportional)
```

**Decision Thresholds:**

- **≥90% confidence**: REJECT (very likely duplicate)
- **70-89% confidence**: FLAG for manual review
- **<70% confidence**: ALLOW but log for future review

## Implementation Scripts

### 1. `scripts/init-concepts-db.ts`

**Purpose**: Initialize database and populate from existing concept JSON files

**Steps**:

1. Create SQLite database at root if not exists
2. Create all tables with indices
3. Read all JSON files from `src/data/concepts/*.json`
4. For each concept:
    - Calculate content hash (MD5 of JSON stringified)
    - Insert into `concepts` table
    - Insert aliases into `concept_aliases`
    - Insert tags into `concept_tags`
    - Insert related notes into `concept_related_notes`
    - Insert references into `concept_references`
5. Generate summary report:
    - Total concepts loaded
    - Any validation errors
    - Database size

**Usage**: `npx tsx scripts/init-concepts-db.ts`

### 2. `scripts/verify-concept.ts`

**Purpose**: Check if a concept already exists before adding

**Input**:

- Concept name (required)
- Summary (optional, improves accuracy)
- Aliases (optional)
- Related notes URLs (optional)

**Output**:

- Confidence score (0-100%)
- List of potential duplicates with similarity scores
- Recommendation: ALLOW / FLAG / REJECT

**Steps**:

1. Connect to database
2. Run all similarity checks in parallel:
    - Exact name match
    - Alias cross-check
    - Fuzzy name matching
    - Summary similarity (if provided)
    - Related notes overlap (if provided)
3. Calculate weighted confidence score
4. Log check to `duplicate_checks` table
5. Return results with detailed reasoning

**Usage**:

```bash
npx tsx scripts/verify-concept.ts --name "New Concept" --summary "Brief summary" --aliases "Alias 1,Alias 2"
```

### 3. `scripts/merge-duplicates.ts`

**Purpose**: Merge duplicate concepts into a single canonical version

**Input**:

- Source concept ID (to be merged/deleted)
- Target concept ID (canonical version to keep)
- Merge strategy: 'keep-target' | 'merge-fields' | 'interactive'

**Steps**:

1. Load both concepts from database and JSON files
2. If strategy = 'merge-fields':
    - Merge arrays (tags, aliases, references) - union
    - Keep target's core fields (name, summary, explanation)
    - Use latest dateModified
    - Combine relatedConcepts (unique)
3. Update any `relatedConcepts` references in other concepts
4. Delete source JSON file
5. Update target JSON file with merged data
6. Delete source from database
7. Update target in database
8. Log merge operation

**Usage**:

```bash
npx tsx scripts/merge-duplicates.ts --source gratitude --target gratitude-practice --strategy merge-fields
```

### 4. `scripts/sync-concepts-db.ts`

**Purpose**: Keep database in sync with JSON files (run after manual edits)

**Steps**:

1. Read all JSON files
2. For each file:
    - Calculate content hash
    - Compare with database hash
    - If different: update database record
    - If not in database: insert
3. Find database records with no matching file: mark as deleted or warn
4. Report sync results

**Usage**: `npx tsx scripts/sync-concepts-db.ts`

### 5. `scripts/find-duplicates.ts`

**Purpose**: Scan all existing concepts for potential duplicates

**Steps**:

1. Load all concepts from database
2. For each pair of concepts:
    - Run similarity checks
    - Calculate confidence score
3. Group by confidence level (HIGH ≥90%, MEDIUM 70-89%, LOW 50-69%)
4. Output report with:
    - Duplicate pairs sorted by confidence
    - Similarity reasons
    - Suggested merge actions

**Usage**: `npx tsx scripts/find-duplicates.ts [--threshold 70]`

## Claude Code Skill: `manage-concepts-db`

### Location

`.claude/skills/manage-concepts-db/SKILL.md`

### Skill Content

````markdown
---
name: manage-concepts-db
description: Manage the concepts database - verify, add, update, and check for duplicates before modifying concepts
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# Manage Concepts Database

This skill provides instructions for working with the concepts SQLite database to prevent duplicates and maintain data quality.

## MANDATORY RULES

1. **ALWAYS verify before adding a new concept**
    - Run `npx tsx scripts/verify-concept.ts` BEFORE creating any new concept JSON file
    - Minimum 90% confidence that concept doesn't exist
    - If confidence ≥70%, manually review potential duplicates

2. **ALWAYS update database after concept changes**
    - After adding/editing concept JSON: run `npx tsx scripts/sync-concepts-db.ts`
    - Database must stay in sync with JSON files

3. **NEVER skip duplicate checks**
    - Even if you think it's unique, run verification
    - Log all checks for audit trail

## Workflow: Adding a New Concept

### Step 1: Verify Concept Doesn't Exist

```bash
npx tsx scripts/verify-concept.ts \
  --name "Concept Name" \
  --summary "Brief summary" \
  --aliases "Alias 1,Alias 2" \
  --related-notes "https://notes.dsebastien.net/..."
```
````

**Interpret Results:**

- **Confidence ≥90%**: STOP - concept likely exists. Review suggested duplicates.
- **Confidence 70-89%**: REVIEW manually. Check suggested duplicates. Decide if truly different.
- **Confidence <70%**: PROCEED with caution. Log decision reasoning.

### Step 2: If Approved, Create Concept JSON

Only proceed if confidence <90% OR you've manually verified it's unique.

Create `/home/dsebastien/wks/concept-cards/src/data/concepts/{id}.json` following schema in AGENTS.md.

### Step 3: Sync Database

```bash
npx tsx scripts/sync-concepts-db.ts
```

Verify concept was added to database successfully.

## Workflow: Updating an Existing Concept

### Step 1: Edit Concept JSON

Make changes to `/home/dsebastien/wks/concept-cards/src/data/concepts/{id}.json`

### Step 2: Sync Database

```bash
npx tsx scripts/sync-concepts-db.ts
```

Database will automatically update based on content hash change.

## Workflow: Merging Duplicates

### Step 1: Identify Duplicates

```bash
# Scan all concepts for duplicates
npx tsx scripts/find-duplicates.ts --threshold 80
```

### Step 2: Review and Decide

- Compare concepts side-by-side
- Decide which to keep (target) and which to merge (source)
- Choose merge strategy

### Step 3: Execute Merge

```bash
npx tsx scripts/merge-duplicates.ts \
  --source {source-id} \
  --target {target-id} \
  --strategy merge-fields
```

This will:

- Combine data from both concepts
- Update cross-references
- Delete source JSON file
- Update database

### Step 4: Verify

```bash
# Check target concept exists
cat /home/dsebastien/wks/concept-cards/src/data/concepts/{target-id}.json

# Check source concept deleted
ls /home/dsebastien/wks/concept-cards/src/data/concepts/{source-id}.json  # should error
```

## Common Scenarios

### Scenario 1: User Asks to Add Concepts from MoC

1. For EACH concept to add:
    - Run `verify-concept.ts` with name and summary
    - If confidence <90%, proceed with creation
    - If confidence ≥90%, inform user of existing concept and ask if they want to update it instead
    - After creating concept, run `sync-concepts-db.ts`

2. Run final sync after all concepts added:
    ```bash
    npx tsx scripts/sync-concepts-db.ts
    ```

### Scenario 2: Bulk Import from Multiple MoCs

1. Create a temporary script that:
    - Reads each MoC note
    - For each potential concept, calls `verify-concept.ts`
    - Logs all HIGH confidence duplicates
    - Only creates LOW/MEDIUM confidence concepts
    - Outputs report of skipped duplicates

2. Review report with user
3. Manually handle high-confidence duplicates
4. Run final sync

### Scenario 3: User Reports Duplicate Concepts

1. Run similarity check:

    ```bash
    npx tsx scripts/verify-concept.ts --name "Concept Name" --summary "..."
    ```

2. If duplicates confirmed, merge:
    ```bash
    npx tsx scripts/merge-duplicates.ts --source {id1} --target {id2} --strategy merge-fields
    ```

## Database Maintenance

### Check Database Health

```bash
# View database stats
sqlite3 /home/dsebastien/wks/concept-cards/concepts.db "
  SELECT
    (SELECT COUNT(*) FROM concepts) as total_concepts,
    (SELECT COUNT(*) FROM concept_aliases) as total_aliases,
    (SELECT COUNT(*) FROM concept_tags) as total_tags,
    (SELECT COUNT(*) FROM duplicate_checks) as total_checks;
"
```

### Rebuild Database from JSON

If database gets corrupted or out of sync:

```bash
# Delete database
rm /home/dsebastien/wks/concept-cards/concepts.db

# Reinitialize
npx tsx scripts/init-concepts-db.ts
```

## Troubleshooting

**Issue**: verify-concept.ts shows false positives

**Solution**: Adjust similarity thresholds in script. Review and tune weights.

**Issue**: Database out of sync with JSON files

**Solution**: Run `npx tsx scripts/sync-concepts-db.ts`

**Issue**: Need to force-add concept despite high confidence match

**Solution**: Add `--force` flag to skip duplicate check (use sparingly, document why)

````

## AGENTS.md Updates

Add new sections to enforce database usage:

### Section: "Concept Duplicate Prevention with Database"

```markdown
## Concept Duplicate Prevention with Database

**MANDATORY**: Before adding ANY new concept, you MUST verify it doesn't already exist using the concepts database.

### Database Location

`/home/dsebastien/wks/concept-cards/concepts.db` - SQLite database containing all concepts with metadata for duplicate detection.

### Required Workflow for Adding Concepts

1. **ALWAYS run verification first**:
   ```bash
   npx tsx scripts/verify-concept.ts --name "Concept Name" --summary "Brief summary" --aliases "Alias 1,Alias 2"
````

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
```

This will:

- Combine tags, aliases, references (union)
- Keep target's core content
- Update cross-references
- Delete source file
- Update database

````

## Initial Database Population

### Step 1: Install Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "better-sqlite3": "^11.8.1",
    "natural": "^8.0.1"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/natural": "^5.1.5"
  }
}
````

### Step 2: Run Initialization

```bash
npm install
npx tsx scripts/init-concepts-db.ts
```

Expected output:

```
Initializing concepts database...
✓ Created database at /home/dsebastien/wks/concept-cards/concepts.db
✓ Created tables and indices
✓ Loading concepts from JSON files...
  - Loaded 1726 concepts
  - Inserted 1726 concept records
  - Inserted 3421 aliases
  - Inserted 8281 tags
  - Inserted 1053 related notes
  - Inserted 4892 references
✓ Database initialized successfully
Database size: 8.4 MB
```

## Clean Existing Duplicates

### Confirmed Duplicates to Merge

Based on exploration, merge these duplicates immediately after initialization:

#### 1. Gratitude Practice Duplicate

```bash
npx tsx scripts/merge-duplicates.ts \
  --source gratitude \
  --target gratitude-practice \
  --strategy merge-fields
```

**Reasoning**:

- `gratitude-practice.json` is more comprehensive with research references
- `gratitude.json` uses invalid "Practices" category
- Both have same name "Gratitude Practice"

#### 2. Ben Franklin Effect Duplicate

```bash
npx tsx scripts/merge-duplicates.ts \
  --source ben-franklin-effect \
  --target benjamin-franklin-effect \
  --strategy merge-fields
```

Add "Ben Franklin Effect" as alias to `benjamin-franklin-effect.json`.

**Reasoning**:

- Both describe identical concept
- Full name "Benjamin Franklin Effect" is more formal/canonical

### Fix Invalid Category

Update these concepts to use valid categories:

1. `celebrate-wins.json` - Change category from "Practices" to "Techniques"
2. After merging gratitude, this issue resolves automatically

### Resolve Naming Collision

Two different concepts currently share the name "1-1-1 Method":

1. `1-1-1-method.json` - Sahil Bloom's method: 1 win, 1 challenge, 1 gratitude (Category: Techniques)
2. `one-one-one-method.json` - Gratitude practice: 1 person, 1 thing, 1 event (Category: Journaling)

**Action**: Rename `one-one-one-method.json` to clarify the distinction:

- Rename file to `one-one-one-gratitude-method.json`
- Update `id` field to `one-one-one-gratitude-method`
- Update `name` field to `1-1-1 Gratitude Method`
- Add alias `"1-1-1 Method"` to preserve searchability
- Keep original `1-1-1-method.json` unchanged (Sahil Bloom's version)

## Verification & Testing

### Step 1: Verify Database Populated

```bash
sqlite3 /home/dsebastien/wks/concept-cards/concepts.db "SELECT COUNT(*) FROM concepts;"
# Expected: 1726
```

### Step 2: Test Duplicate Detection

```bash
# Should find 95%+ confidence match
npx tsx scripts/verify-concept.ts --name "Zettelkasten Method" --summary "Note-taking system with atomic notes"

# Should find no match
npx tsx scripts/verify-concept.ts --name "Ultra Unique Concept XYZ" --summary "Completely new idea"
```

### Step 3: Test Merge

```bash
# Merge gratitude duplicate
npx tsx scripts/merge-duplicates.ts --source gratitude --target gratitude-practice --strategy merge-fields

# Verify only target exists
ls src/data/concepts/gratitude.json  # should error: No such file
ls src/data/concepts/gratitude-practice.json  # should exist
```

### Step 4: Run Duplicate Scan

```bash
npx tsx scripts/find-duplicates.ts --threshold 70
```

Should output clean report with minimal high-confidence duplicates after merges complete.

## Documentation Updates

### 1. Update AGENTS.md

Add sections:

- "Concept Duplicate Prevention with Database" (full section above)
- Update "Adding a New Concept" section to reference database verification
- Update "Best Practices" to include "Always verify with database first"

### 2. Create Database Documentation

Create `documentation/plans/concepts-database.md` with:

- Database schema documentation
- Similarity algorithm explanation
- Script usage guide
- Maintenance procedures
- Troubleshooting guide

**Note**: This plan document itself should also be copied to `documentation/plans/sqlite-duplicate-detection-plan.md` for permanent reference.

### 3. Update README (if needed)

Add section on database maintenance for contributors.

## Git Ignore

Add to `.gitignore`:

```
# Concepts database (generated from JSON files)
/concepts.db
/concepts.db-journal
/concepts.db-wal
/concepts.db-shm
```

Rationale: Database is generated from JSON source files, so it's build artifact not source.

## Future Enhancements (Optional)

1. **Semantic Embeddings**: Use actual embeddings (OpenAI, Sentence-BERT) for better semantic similarity
2. **Web UI**: Simple web interface to review duplicates and approve merges
3. **GitHub Action**: Auto-run verification on PR creation for new concepts
4. **Similarity Tuning**: Machine learning to tune similarity weights based on human feedback
5. **Cross-reference Validation**: Verify all `relatedConcepts` IDs exist in database

## Summary of Critical Files

### New Files to Create

1. `/home/dsebastien/wks/concept-cards/concepts.db` - SQLite database (generated)
2. `/home/dsebastien/wks/concept-cards/scripts/init-concepts-db.ts` - Initialize database
3. `/home/dsebastien/wks/concept-cards/scripts/verify-concept.ts` - Verify before adding
4. `/home/dsebastien/wks/concept-cards/scripts/sync-concepts-db.ts` - Sync JSON to DB
5. `/home/dsebastien/wks/concept-cards/scripts/merge-duplicates.ts` - Merge duplicates
6. `/home/dsebastien/wks/concept-cards/scripts/find-duplicates.ts` - Scan for duplicates
7. `/home/dsebastien/wks/concept-cards/.claude/skills/manage-concepts-db/SKILL.md` - Claude Code skill
8. `/home/dsebastien/wks/concept-cards/documentation/plans/sqlite-duplicate-detection-plan.md` - This plan document
9. `/home/dsebastien/wks/concept-cards/documentation/plans/concepts-database.md` - Database reference docs

### Files to Update

1. `/home/dsebastien/wks/concept-cards/AGENTS.md` - Add database verification requirements
2. `/home/dsebastien/wks/concept-cards/package.json` - Add dependencies
3. `/home/dsebastien/wks/concept-cards/.gitignore` - Ignore database files

### Files to Delete

1. `/home/dsebastien/wks/concept-cards/src/data/concepts/gratitude.json` - Duplicate (after merge)
2. `/home/dsebastien/wks/concept-cards/src/data/concepts/ben-franklin-effect.json` - Duplicate (after merge)
3. `/home/dsebastien/wks/concept-cards/src/data/concepts/one-one-one-method.json` - Renamed to resolve naming collision

### Files to Rename/Create for Naming Collision

1. `/home/dsebastien/wks/concept-cards/src/data/concepts/one-one-one-gratitude-method.json` - New name for one-one-one-method.json

## Implementation Order

1. ✅ Create plan document (this file)
2. Copy plan to `documentation/plans/sqlite-duplicate-detection-plan.md`
3. Add dependencies to package.json
4. Create database initialization script
5. Run initialization
6. Create verification script
7. Create sync script
8. Create merge script
9. Create find-duplicates script
10. Merge confirmed duplicates (gratitude, benjamin-franklin-effect)
11. Fix invalid category (celebrate-wins.json)
12. Resolve naming collision (rename one-one-one-method.json)
13. Run sync to update database after all changes
14. Create Claude Code skill
15. Update AGENTS.md
16. Create database documentation in `documentation/plans/concepts-database.md`
17. Test all scripts thoroughly
18. Update .gitignore
19. Commit all changes

## Success Criteria

- ✅ Database contains all 1,724 concepts with complete metadata (1,726 minus 2 duplicates merged)
- ✅ Verification script accurately detects duplicates (≥90% confidence)
- ✅ 2 confirmed duplicates merged successfully (gratitude, benjamin-franklin-effect)
- ✅ Invalid category fixed (celebrate-wins.json uses valid category)
- ✅ Naming collision resolved (1-1-1 Method concepts clearly distinguished)
- ✅ Claude Code skill enables easy database operations
- ✅ AGENTS.md enforces mandatory verification workflow
- ✅ All scripts tested and working
- ✅ Zero false negatives (no duplicates missed with <90% confidence)
- ✅ Low false positives (<5% of verifications flag non-duplicates as high confidence)
