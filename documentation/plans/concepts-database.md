# Concepts Database Reference

This document provides technical reference for the concepts SQLite database used for duplicate detection and data quality management.

## Overview

The concepts database (`concepts.db`) is a SQLite database that maintains a normalized, indexed copy of all concept data to enable fast similarity searches and duplicate detection.

## Database Schema

### Tables

#### 1. `concepts` (main table)

Stores core concept metadata.

| Column         | Type    | Description                                   |
| -------------- | ------- | --------------------------------------------- |
| id             | TEXT    | Primary key, matches JSON filename            |
| name           | TEXT    | Concept name                                  |
| summary        | TEXT    | Brief summary                                 |
| explanation    | TEXT    | Full explanation                              |
| category       | TEXT    | Category classification                       |
| featured       | INTEGER | Boolean: is featured (0/1)                    |
| icon           | TEXT    | Icon name or URL                              |
| date_published | TEXT    | ISO 8601 date first published                 |
| date_modified  | TEXT    | ISO 8601 date last modified                   |
| file_path      | TEXT    | Absolute path to JSON file                    |
| content_hash   | TEXT    | MD5 hash of JSON content for change detection |
| created_at     | TEXT    | Database record creation timestamp            |
| updated_at     | TEXT    | Database record update timestamp              |

**Indices**: `idx_name`, `idx_category`, `idx_content_hash`

#### 2. `concept_aliases`

Normalized storage of concept aliases.

| Column     | Type | Description                |
| ---------- | ---- | -------------------------- |
| concept_id | TEXT | Foreign key to concepts.id |
| alias      | TEXT | Alternative name           |

**Primary Key**: (`concept_id`, `alias`)
**Index**: `idx_alias`

#### 3. `concept_tags`

Normalized storage of tags.

| Column     | Type | Description                |
| ---------- | ---- | -------------------------- |
| concept_id | TEXT | Foreign key to concepts.id |
| tag        | TEXT | Tag name                   |

**Primary Key**: (`concept_id`, `tag`)
**Index**: `idx_tag`

#### 4. `concept_related_notes`

Related notes URLs.

| Column     | Type | Description                |
| ---------- | ---- | -------------------------- |
| concept_id | TEXT | Foreign key to concepts.id |
| url        | TEXT | Related note URL           |

**Primary Key**: (`concept_id`, `url`)
**Index**: `idx_related_url`

#### 5. `concept_references`

All references (articles, books, references, tutorials).

| Column       | Type    | Description                                             |
| ------------ | ------- | ------------------------------------------------------- |
| id           | INTEGER | Auto-increment primary key                              |
| concept_id   | TEXT    | Foreign key to concepts.id                              |
| ref_type     | TEXT    | Type: 'article', 'book', 'reference', 'tutorial'        |
| title        | TEXT    | Reference title                                         |
| url          | TEXT    | Reference URL                                           |
| content_type | TEXT    | Content type (for non-books): paper, website, video etc |

**Indices**: `idx_ref_concept`, `idx_ref_url`

#### 6. `duplicate_checks`

Audit log of all duplicate verification checks.

| Column            | Type    | Description                                                       |
| ----------------- | ------- | ----------------------------------------------------------------- |
| id                | INTEGER | Auto-increment primary key                                        |
| checked_at        | TEXT    | Timestamp of check                                                |
| concept_name      | TEXT    | Name of concept being checked                                     |
| concept_summary   | TEXT    | Summary of concept being checked                                  |
| found_duplicates  | INTEGER | Number of potential duplicates found                              |
| similarity_scores | TEXT    | JSON array of match details                                       |
| action_taken      | TEXT    | Action: 'added', 'rejected', 'merged', 'manual_review', 'pending' |

## Similarity Detection Algorithm

The duplicate detection uses multiple weighted factors:

| Method                    | Confidence Range | Weight | Threshold |
| ------------------------- | ---------------- | ------ | --------- |
| Exact ID match            | 100%             | N/A    | Exact     |
| Exact name match          | 95%              | High   | Exact     |
| Alias cross-check         | 90%              | High   | Exact     |
| Fuzzy name similarity     | 80-90%           | Medium | >0.85     |
| Summary TF-IDF similarity | 70-85%           | Medium | >0.75     |
| Explanation similarity    | 60-80%           | Low    | >0.70     |
| Related notes URL overlap | 95%              | High   | Exact     |
| Reference overlap         | 50-70%           | Low    | Variable  |

### Decision Thresholds

- **≥90% confidence**: REJECT - Very likely duplicate
- **70-89% confidence**: FLAG - Manual review required
- **<70% confidence**: ALLOW - Low confidence, proceed with caution

## Scripts

### `init-concepts-db.ts`

Initializes database and populates from JSON files.

**Usage**: `npx tsx scripts/init-concepts-db.ts`

**When**: First-time setup or full rebuild

**Actions**:

- Deletes existing database
- Creates tables and indices
- Loads all concept JSON files
- Calculates content hashes
- Inserts all data
- Reports statistics

### `verify-concept.ts`

Checks if a concept exists before adding.

**Usage**:

```bash
npx tsx scripts/verify-concept.ts \
  --name "Concept Name" \
  --summary "Brief summary" \
  --aliases "Alias 1,Alias 2" \
  --related-notes "URL1,URL2"
```

**Arguments**:

- `--name` (required): Concept name
- `--summary` (optional): Improves accuracy
- `--aliases` (optional): Comma-separated aliases
- `--related-notes` (optional): Comma-separated URLs

**Output**:

- Confidence score (0-100%)
- List of potential duplicates
- Recommendation (ALLOW/FLAG/REJECT)

**Exit codes**:

- `0`: Allow (confidence <90%)
- `1`: Reject (confidence ≥90%)

### `sync-concepts-db.ts`

Synchronizes database with JSON files.

**Usage**: `npx tsx scripts/sync-concepts-db.ts`

**When**: After adding/editing any concept

**Actions**:

- Compares JSON files with database
- Adds new concepts
- Updates changed concepts (by content hash)
- Reports orphaned database entries
- Shows sync statistics

### `merge-duplicates.ts`

Merges duplicate concepts.

**Usage**:

```bash
npx tsx scripts/merge-duplicates.ts \
  --source concept-id-1 \
  --target concept-id-2 \
  --strategy merge-fields
```

**Arguments**:

- `--source` (required): Source concept ID (will be deleted)
- `--target` (required): Target concept ID (will be kept)
- `--strategy` (optional): `keep-target` or `merge-fields` (default)

**Strategy**:

- `keep-target`: Keep target as-is
- `merge-fields`: Merge arrays (tags, aliases, references), keep target's core fields

**Actions**:

- Loads both concepts
- Merges according to strategy
- Updates cross-references in other concepts
- Deletes source JSON file
- Updates target JSON file
- Updates database

**Note**: Must run `sync-concepts-db.ts` after merging

### `find-duplicates.ts`

Scans all concepts for duplicates.

**Usage**: `npx tsx scripts/find-duplicates.ts --threshold 70`

**Arguments**:

- `--threshold` (optional): Minimum confidence to report (default: 70)

**Output**:

- HIGH confidence pairs (≥90%)
- MEDIUM confidence pairs (70-89%)
- LOW confidence pairs (<threshold)
- Suggested merge commands

## Maintenance

### Rebuilding Database

If database becomes corrupted:

```bash
rm /home/dsebastien/wks/concept-cards/concepts.db
npx tsx scripts/init-concepts-db.ts
```

### Checking Database Health

```bash
sqlite3 /home/dsebastien/wks/concept-cards/concepts.db "
  SELECT
    (SELECT COUNT(*) FROM concepts) as total_concepts,
    (SELECT COUNT(*) FROM concept_aliases) as total_aliases,
    (SELECT COUNT(*) FROM concept_tags) as total_tags,
    (SELECT COUNT(*) FROM duplicate_checks) as total_checks;
"
```

### Viewing Duplicate Check History

```bash
sqlite3 /home/dsebastien/wks/concept-cards/concepts.db \
  "SELECT checked_at, concept_name, found_duplicates, action_taken
   FROM duplicate_checks
   ORDER BY checked_at DESC
   LIMIT 20;"
```

## File Locations

- **Database**: `/home/dsebastien/wks/concept-cards/concepts.db`
- **Scripts**: `/home/dsebastien/wks/concept-cards/scripts/`
- **Concepts**: `/home/dsebastien/wks/concept-cards/src/data/concepts/`
- **Skill**: `/home/dsebastien/wks/concept-cards/.claude/skills/manage-concepts-db/SKILL.md`
- **Plan**: `/home/dsebastien/wks/concept-cards/documentation/plans/sqlite-duplicate-detection-plan.md`

## Best Practices

1. **Always verify before adding** - Run `verify-concept.ts` before creating new concepts
2. **Always sync after changes** - Run `sync-concepts-db.ts` after editing concepts
3. **Review high confidence matches** - Don't auto-reject 90%+ matches without review
4. **Log all checks** - All verification runs are logged for audit
5. **Keep database in sync** - Run sync periodically if manual edits are made
6. **Use the Claude Code skill** - `/manage-concepts-db` provides guided workflows

## Troubleshooting

**Issue**: False positives in duplicate detection

**Solution**: Adjust similarity thresholds in `verify-concept.ts`. Current thresholds are conservative.

**Issue**: Database out of sync

**Solution**: Run `sync-concepts-db.ts` or rebuild with `init-concepts-db.ts`

**Issue**: Orphaned database entries

**Solution**: Normal after merges/renames. Entries don't affect functionality.

**Issue**: Need to bypass duplicate check

**Solution**: No bypass implemented. If truly unique despite high match, review similarity reasons and adjust concept name/summary to differentiate.

## Technical Notes

- Database uses MD5 content hashing for change detection
- Foreign keys enabled with CASCADE delete
- All text comparisons are case-insensitive after normalization
- TF-IDF uses the `natural` library's implementation
- Levenshtein and Jaro-Winkler distance from `natural` library
- Database is excluded from git (`.gitignore`)
- Database regenerates from JSON source files (JSON is source of truth)
