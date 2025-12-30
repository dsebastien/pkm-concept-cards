# Social, Sharing, and Gamification Features Plan

## Constraints & Philosophy

- **Consume only**: Users interact with existing concepts (no UGC)
- **Fully anonymous**: No user accounts, localStorage-based persistence
- **Static only**: No backend, all features client-side or build-time generated
- **Storage budget**: <2MB localStorage
- **Accessibility**: Critical - full screen reader, keyboard nav, ARIA, reduced motion support

---

## Feature Overview

### 1. Sharing Features (MVP Priority)

#### 1.1 Social Share Buttons

**Location**: Concept detail modal, progress page, collection views

**Platforms**:

- Twitter/X with pre-filled text
- LinkedIn share
- Copy link button
- Native Web Share API (mobile)

**Implementation**:

- Add `ShareButton` component with platform icons
- Use Web Share API where available, fallback to direct platform URLs
- Pre-fill share text with concept name + site URL

**Files to modify/create**:

- `src/components/ui/share-button.tsx` (new)
- `src/components/concepts/concept-detail-modal.tsx` (add share buttons)

#### 1.2 Canvas-Generated Share Images

**Content types**:

- Stats summary: "500 concepts explored, 15 achievements unlocked"
- Visual progress: Circular/bar visualization with percentage
- Concept highlight: Stylized card with name, category, summary

**Implementation**:

- Create `ShareImageGenerator` utility using Canvas API
- Generate downloadable PNG images
- Styled with site colors (#37404c background, #e5007d accent)

**Files to create**:

- `src/lib/share-image-generator.ts`
- `src/components/ui/share-image-modal.tsx`

#### 1.3 Text-Based Sharing

**Format**: Copyable text with emojis

```
🏆 I've explored 500/1100 concepts on ConceptCards!
🎯 15 achievements unlocked
📚 Check it out: https://concepts.dsebastien.net
```

**Files to modify**:

- `src/lib/share-text-generator.ts` (new)

---

### 2. Collections System

#### 2.1 Favorites (Simple Bookmarks)

**Behavior**: Single default "Favorites" collection

**Implementation**:

- Heart icon on concept cards and modal
- Toggle add/remove from favorites
- Dedicated `/favorites` page

#### 2.2 Multiple Named Lists

**Features**:

- Create named collections ("PKM Essentials", "To Review")
- Add concepts to multiple lists
- Rename/delete lists
- Reorder concepts within lists

**Data structure** (localStorage):

```typescript
interface Collection {
    id: string
    name: string
    conceptIds: string[]
    createdAt: string
    isLearningPath: boolean
    order?: number // for learning paths
}
```

#### 2.3 Learning Paths (Ordered Sequences)

**Features**:

- Progress tracking through ordered concepts
- Immersive path mode (only current concept visible)
- Next/previous navigation within path
- Resume from last position

**AI-Generated Paths**:

- Claude skill analyzes concepts and generates curated paths
- Saved as JSON in `src/data/learning-paths/`
- Dedicated pages generated at build time

**Files to create**:

- `src/data/learning-paths/*.json`
- `src/pages/learning-path.tsx`
- `src/components/collections/collection-manager.tsx`
- `src/components/collections/learning-path-view.tsx`
- `src/hooks/use-collections.ts`
- `.claude/skills/generate-learning-paths/SKILL.md`

#### 2.4 URL-Shareable Collections

**Format**: `/#/collection?ids=concept1,concept2,concept3&name=My+List`

**Implementation**:

- Encode concept IDs in URL query params
- "Share Collection" button generates shareable link
- Import button creates local copy from shared URL

---

### 3. Gamification System

#### 3.1 Achievement System

**Achievement Types**:

| Category                   | Examples                                                  |
| -------------------------- | --------------------------------------------------------- |
| **Exploration Milestones** | First 10, 100, 150, 200, 250, 300, then every 100         |
| **Category Mastery**       | "Methods Expert" - explore all Methods concepts           |
| **Hidden (Behavioral)**    | "Night Owl" - explore at midnight UTC                     |
| **Hidden (Easter Eggs)**   | "The Answer" - explore concept #42                        |
| **Hidden (Patterns)**      | "Alphabetizer" - explore A-Z first letters in order       |
| **Hidden (Combos)**        | "PKM Master" - explore Zettelkasten + Atomic Notes + PARA |
| **Collection**             | "Curator" - create 5 collections                          |
| **Quiz**                   | "Knowledge Seeker" - complete 10 quizzes                  |

**Hidden Achievements Target: 30+ at launch**

Example hidden achievements:

- **Behavioral**: "Night Owl" (midnight UTC), "Early Bird" (6AM UTC), "Weekend Warrior" (10+ on weekend), "Speed Reader" (10 concepts in 5 min)
- **Easter Eggs**: "The Answer" (concept #42), "Lucky Seven" (7th concept), "Century" (100th unique), "Full Circle" (revisit first explored)
- **Patterns**: "Alphabetizer" (A-Z first letters), "Category Hopper" (5 category switches in row), "Tag Hunter" (explore all with same tag), "Deep Diver" (5 related concepts chain)
- **Combos**: "GTD Expert" (all GTD-related), "Bias Hunter" (all cognitive biases), "Systems Thinker" (all systems concepts), "Meta Learner" (all learning-about-learning)

**Data structure**:

```typescript
interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    hidden: boolean
    unlockedAt?: string
    condition: AchievementCondition
}
```

**Files to create**:

- `src/data/achievements.json`
- `src/hooks/use-achievements.ts`
- `src/lib/achievement-checker.ts`
- `src/components/gamification/achievement-badge.tsx`
- `src/components/gamification/achievement-toast.tsx`

#### 3.2 Notifications

**Immediate Toast**:

- Slide-in notification on achievement unlock
- Shows badge icon, name, description
- Auto-dismiss after 5 seconds
- Accessible (role="status", aria-live)

**Confetti Celebration**:

- Major milestones (100, 500, all concepts)
- Category mastery
- Rare hidden achievements
- Respects prefers-reduced-motion

**Files to create**:

- `src/components/ui/toast.tsx`
- `src/components/ui/toast-container.tsx`

#### 3.3 Daily Concept

**Logic**: UTC date-based deterministic selection

```typescript
const getDailyConcept = (concepts: Concept[], date: Date): Concept => {
    const dayHash = date.toISOString().slice(0, 10) // YYYY-MM-DD
    const index = hashCode(dayHash) % concepts.length
    return concepts[index]
}
```

**UI**:

- "Daily Concept" card on homepage
- Special badge/styling
- Achievement: "Daily Explorer" - check daily concept 7 days in row

**Files to modify/create**:

- `src/lib/daily-concept.ts`
- `src/components/concepts/daily-concept-card.tsx`

#### 3.4 Random Walks

**Behavior**:

- "Surprise Me" button starts chain
- After exploring, suggests related concept
- Fallback: same category if no related concepts
- Chain continues until user stops

**UI**:

- Inline prompt in modal: "Continue exploring → [Related Concept]"
- Chain counter: "Walk step 5"
- Achievement triggers at walk lengths

**Files to create**:

- `src/hooks/use-random-walk.ts`
- `src/components/concepts/random-walk-prompt.tsx`

---

### 4. Quiz System

#### 4.1 Quiz Types (All Auto-Generated at Build Time)

**Multiple Choice**:

- "Which concept is related to Zettelkasten?"
- Generated from `relatedConcepts` field

**Matching Pairs**:

- Match concepts to categories
- Match concepts to tags

**Fill in Blank**:

- "The \_\_\_ method suggests breaking ideas into atomic units"
- Generated from concept names and summaries

**True/False**:

- "Zettelkasten is a type of productivity technique" (based on category)

#### 4.2 Build-Time Generation

**Script**: `scripts/generate-quizzes.ts`

- Analyzes all concepts
- Generates quiz bank JSON
- Writes to `src/data/quizzes.json`

**Question structure**:

```typescript
interface QuizQuestion {
    id: string
    type: 'multiple-choice' | 'matching' | 'fill-blank' | 'true-false'
    question: string
    options?: string[]
    correctAnswer: string | string[]
    conceptId: string
    difficulty: 'easy' | 'medium' | 'hard'
}
```

#### 4.3 Quiz UI

- `/quiz` page with random questions
- Category-specific quizzes
- Results screen with share option
- Achievement triggers (no detailed tracking)

**Files to create**:

- `scripts/generate-quizzes.ts`
- `src/data/quizzes.json` (generated)
- `src/pages/quiz.tsx`
- `src/components/quiz/quiz-question.tsx`
- `src/components/quiz/quiz-results.tsx`

---

### 5. Progress UI

#### 5.1 Dedicated Progress Page (`/progress`)

**Sections**:

- Overall stats (explored count, percentage)
- Category breakdown with progress bars
- Achievement showcase (earned + locked)
- Collections overview
- Learning path progress
- Export/Import buttons

#### 5.2 Toggleable Sidebar

**Desktop**: Right drawer, slides in from edge
**Mobile**: Bottom sheet (swipe up)

**Contents**:

- Current exploration count
- Recent achievements
- Active learning path progress
- Quick links to collections

**Trigger**: Button in header

**Files to create**:

- `src/pages/progress.tsx`
- `src/components/layout/progress-sidebar.tsx`
- `src/components/layout/mobile-bottom-sheet.tsx`

---

### 6. Data Sync

#### 6.1 JSON Export/Import

**Export**:

- Download button generates JSON file
- Includes: explored concepts, collections, achievements, preferences

**Import**:

- File picker or drag-and-drop
- Merge or replace options
- Validation before import

#### 6.2 QR Code Sync

**Method**: URL redirect approach

**Export**:

- Generate URL with hash-encoded state
- Display as QR code
- State compressed with base64 encoding

**Import**:

- Scan QR → opens URL
- Page detects sync params → prompts to import

**URL format**: `/#/sync?data=base64encodedstate`

**Files to create**:

- `src/lib/sync-manager.ts`
- `src/components/sync/export-modal.tsx`
- `src/components/sync/import-modal.tsx`
- `src/components/sync/qr-code.tsx`
- `src/pages/sync.tsx`

---

### 7. Learning Path Generation (Claude Skill)

#### 7.1 Skill Definition

**Location**: `.claude/skills/generate-learning-paths/SKILL.md`

**Behavior**:

- Analyzes all concepts
- Identifies logical progressions based on:
    - `relatedConcepts` graph
    - Category groupings
    - Tag relationships
    - Concept dependencies
- Generates curated paths like:
    - "PKM Fundamentals" (10 concepts)
    - "Productivity Systems" (15 concepts)
    - "Cognitive Enhancement" (12 concepts)

**Output**: JSON files in `src/data/learning-paths/`

```typescript
interface LearningPath {
    id: string
    name: string
    description: string
    conceptIds: string[] // ordered
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedMinutes: number
    icon: string
}
```

---

### 8. Accessibility Requirements

All features must include:

- **Keyboard navigation**: Tab order, Enter/Space activation
- **Screen reader support**: ARIA labels, roles, live regions
- **Focus management**: Focus trapping in modals, focus restoration
- **Reduced motion**: Respect `prefers-reduced-motion`
- **Color contrast**: WCAG 2.1 AA compliance
- **Touch targets**: Minimum 44x44px on mobile

---

## Implementation Phases

### Phase 1: Sharing (MVP)

1. Share button component with X, LinkedIn, copy, native share
2. Add share buttons to concept modal
3. Canvas-based image generator for concept cards
4. Text-based share generator

### Phase 2: Collections Foundation

1. Favorites hook and localStorage persistence
2. Favorites toggle on concept cards/modal
3. Collections manager component
4. `/favorites` page

### Phase 3: Gamification Core

1. Achievement definitions JSON
2. Achievement checker logic
3. Toast notification system
4. Progress page with stats

### Phase 4: Extended Collections

1. Multiple named lists
2. Learning paths (user-created)
3. URL-based collection sharing
4. Immersive path mode

### Phase 5: Discovery Features

1. Daily concept logic and UI
2. Random walk system
3. Discovery achievements

### Phase 6: Quiz System

1. Quiz generation script
2. Quiz page UI
3. Results and sharing

### Phase 7: Data Sync

1. JSON export/import
2. QR code generation
3. Sync page and URL handling

### Phase 8: AI Learning Paths

1. Claude skill for path generation
2. Pre-built paths JSON
3. Dedicated path pages

### Phase 9: Sidebar & Polish

1. Toggleable progress sidebar
2. Mobile bottom sheet
3. Hidden achievements (30+ at launch)
4. Accessibility audit

---

## Key Files Summary

### New Files

| Path                                              | Purpose                 |
| ------------------------------------------------- | ----------------------- |
| `src/components/ui/share-button.tsx`              | Social share buttons    |
| `src/components/ui/toast.tsx`                     | Toast notifications     |
| `src/components/ui/toast-container.tsx`           | Toast manager           |
| `src/lib/share-image-generator.ts`                | Canvas image generation |
| `src/lib/share-text-generator.ts`                 | Copyable share text     |
| `src/lib/daily-concept.ts`                        | Daily concept logic     |
| `src/lib/sync-manager.ts`                         | Export/import logic     |
| `src/lib/achievement-checker.ts`                  | Achievement detection   |
| `src/hooks/use-collections.ts`                    | Collections state       |
| `src/hooks/use-achievements.ts`                   | Achievements state      |
| `src/hooks/use-random-walk.ts`                    | Random walk state       |
| `src/data/achievements.json`                      | Achievement definitions |
| `src/data/quizzes.json`                           | Generated quiz bank     |
| `src/data/learning-paths/*.json`                  | Curated paths           |
| `src/pages/progress.tsx`                          | Progress dashboard      |
| `src/pages/quiz.tsx`                              | Quiz interface          |
| `src/pages/sync.tsx`                              | Sync handling           |
| `src/pages/learning-path.tsx`                     | Path viewer             |
| `src/components/gamification/*.tsx`               | Achievement UI          |
| `src/components/collections/*.tsx`                | Collection UI           |
| `src/components/quiz/*.tsx`                       | Quiz UI                 |
| `src/components/sync/*.tsx`                       | Sync UI                 |
| `src/components/layout/progress-sidebar.tsx`      | Sidebar                 |
| `src/components/layout/mobile-bottom-sheet.tsx`   | Mobile sheet            |
| `scripts/generate-quizzes.ts`                     | Quiz generation         |
| `.claude/skills/generate-learning-paths/SKILL.md` | Path generation         |

### Modified Files

| Path                                               | Changes                               |
| -------------------------------------------------- | ------------------------------------- |
| `src/components/concepts/concept-detail-modal.tsx` | Add share buttons, random walk prompt |
| `src/components/concepts/concept-card.tsx`         | Add favorites toggle                  |
| `src/components/layout/header.tsx`                 | Add sidebar toggle button             |
| `src/hooks/use-explored-concepts.ts`               | Extend for achievements               |
| `src/main.tsx`                                     | Add new routes                        |
| `src/data/index.ts`                                | Load achievements, quizzes, paths     |

---

## localStorage Schema

```typescript
interface AppState {
    exploredConcepts: string[] // existing
    collections: Collection[] // new
    achievements: {
        unlocked: string[]
        progress: Record<string, number>
    }
    preferences: {
        sidebarOpen: boolean
        viewMode: 'grid' | 'list'
    }
    dailyConceptHistory: string[] // for streak tracking
    randomWalkChain: string[] // current walk
}
```
