# AGENTS.md — AI Coding Agent Context & Directives

> **This file is the single source of truth for any Generative AI Coding Agent
> operating on this repository.** Every instruction in this document is
> **mandatory**. Agents MUST read and internalise this file in its entirety
> before making any change — no matter how small.

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Application Architecture](#2-application-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Data Pipeline](#4-data-pipeline)
5. [Feature Inventory](#5-feature-inventory)
6. [File Map & Ownership](#6-file-map--ownership)
7. [Type System Contract](#7-type-system-contract)
8. [State Management Contract](#8-state-management-contract)
9. [Service Layer Contract](#9-service-layer-contract)
10. [UI Component Contract](#10-ui-component-contract)
11. [Styling & Theming Contract](#11-styling--theming-contract)
12. [3D Dice Engine Contract](#12-3d-dice-engine-contract)
13. [Build & Tooling](#13-build--tooling)
14. [Agent Behavioral Directives (MANDATORY)](#14-agent-behavioral-directives-mandatory)
15. [Dependency Policy](#15-dependency-policy)
16. [Testing Requirements](#16-testing-requirements)
17. [Remaining / Planned Features](#17-remaining--planned-features)

---

## 1. Project Vision

### What This Is

**DnDCharacterCreator** is a feature-complete, browser-based Dungeons & Dragons
5th Edition character creation and management application. It is a faithful
digital reimplementation of the
[MPMB Character Sheet PDF](https://flapkan.com/mpmb/charsheet) (v13.2.3+241220)
— a 7-page PDF containing 1,518 form fields and 3,631 JavaScript event handlers.

### Core Goals

1. **Full MPMB feature parity.** Every field, calculation, automation, and data
   entry that exists in the original PDF must work in this web app. The
   reference implementation lives in the `SRD/` and `ExpandedScripts/`
   directories as raw JavaScript modules from the original sheet.

2. **D&D fantasy immersion.** The UI uses a parchment-and-gold aesthetic with
   Cinzel/EB Garamond typography, ornamental dividers, and a dark-fantasy colour
   palette. This is not a spreadsheet — it is a digital character sheet that
   feels like it belongs on a game table.

3. **Offline-first, zero-backend.** All data is shipped as static JSON. All
   persistence uses `localStorage`. There is no server, no login, no network
   dependency. The `CharacterRepository` interface is designed for future
   backend swap-in, but the current runtime is 100% client-side.

4. **Physics-accurate 3D dice.** A full Three.js + Rapier3D physics-based dice
   roller with correct polyhedra geometry, face-normal value mapping, collision
   detection (CCD), tray containment, and expression parsing (e.g., `2d6+5`,
   `4d6kh3`, `d20-2`).

5. **Content breadth.** The dataset includes content from 28+ official and
   Unearthed Arcana source books, totalling:
   - 22 classes, 313 subclasses
   - 1,000 spells, 226 races, 127 race variants
   - 132 backgrounds, 164 background features, 45 background variants
   - 307 feats, 106 weapons, 15 armor types, 144 gear items
   - 887 magic items, 61 warlock invocations
   - 359 creatures, 11 companions, 231 psionic disciplines
   - 138 source book entries

### What This Is NOT

- This is **not** a VTT (virtual tabletop). There is no map, no tokens, no
  multiplayer.
- This is **not** a rules engine for running combat encounters.
- This is **not** a homebrew editor. Content comes from the MPMB data files.

---

## 2. Application Architecture

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                             │
│                                                                  │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────────────┐   │
│  │ HomePage  │   │ BuilderPage  │   │     SheetPage         │   │
│  │ (roster)  │   │ (8-step wiz) │   │ (live character mgmt) │   │
│  └────┬─────┘   └──────┬───────┘   └──────────┬────────────┘   │
│       │                │                       │                 │
│       │    ┌───────────┴───────────┐   ┌──────┴───────────┐    │
│       │    │   Zustand Stores      │   │ CharacterEngine  │    │
│       │    │  (character + ui)     │   │ (MPMB mirror)    │    │
│       │    └───────────┬───────────┘   └──────┬───────────┘    │
│       │                │                       │                 │
│       │    ┌───────────┴───────────────────────┴───────────┐    │
│       │    │             Service Layer                      │    │
│       │    │  DataService · Calculator · Repository         │    │
│       │    │  FeatureProcessor · CalcChanges · PrereqEval   │    │
│       │    └───────────────────────┬───────────────────────┘    │
│       │                            │                             │
│       │    ┌───────────────────────┴───────────────────────┐    │
│       │    │            Static JSON Data                    │    │
│       │    │         /public/data/*.json                    │    │
│       │    └───────────────────────────────────────────────┘    │
│       │                                                          │
│  ┌────┴────────────────────────────────────────────────────┐    │
│  │            localStorage (character persistence)          │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Routing (React Router v7)

| Route        | Page            | Purpose                                 |
| ------------ | --------------- | --------------------------------------- |
| `/`          | `HomePage`      | Character roster, import/export, search |
| `/builder`   | `BuilderPage`   | 8-step creation wizard                  |
| `/sheet/:id` | `SheetPage`     | Live character sheet + management       |
| `*`          | Redirect to `/` | Catch-all                               |

### Component Hierarchy

```
App (BrowserRouter)
├── "/" → HomePage
│     └── Character roster grid (list / delete / duplicate / import / export)
├── "/builder" → BuilderPage
│     └── AppShell → BuilderWizard
│           ├── Step navigation tabs (1-8)
│           └── Step1_Race → Step2_Class → Step3_Background →
│               Step4_AbilityScores → Step5_Equipment → Step6_Spells →
│               Step7_Details → Step8_Review
└── "/sheet/:id" → SheetPage
      └── AppShell → CharacterSheet
            ├── Header bar (name, race, class, level, HP, AC, speed, conditions)
            ├── Tab panels:
            │   ├── StatsPanel      (ability scores, saves, skills, passives)
            │   ├── AttacksPanel    (weapon attacks, auto-calc to-hit/damage)
            │   ├── SpellsPanel     (spell slots, concentration, preparation)
            │   ├── EquipmentPanel  (inventory, armor, currency, magic items)
            │   ├── FeaturesPanel   (class/race/bg features, resource tracking)
            │   └── NotesPanel      (personality, backstory, languages, tools)
            ├── DicePanel           (3D physics dice roller modal)
            └── LevelUpWizard       (modal: HP, ASI/feat, subclass, spells)
```

---

## 3. Technology Stack

### Runtime Dependencies

| Package                     | Version | Purpose                                      |
| --------------------------- | ------- | -------------------------------------------- |
| `react`                     | 19.2    | UI framework                                 |
| `react-dom`                 | 19.2    | DOM renderer                                 |
| `react-router-dom`          | 7.13    | Client-side routing                          |
| `zustand`                   | 5.0     | State management (character + UI stores)     |
| `immer`                     | 11.1    | Immutable state updates (Zustand middleware) |
| `three`                     | 0.183   | 3D rendering for dice roller                 |
| `@dimforge/rapier3d-compat` | 0.19    | WASM physics engine for dice simulation      |
| `@types/three`              | 0.183   | Three.js type definitions                    |

### Dev Dependencies

| Package                       | Version | Purpose                     |
| ----------------------------- | ------- | --------------------------- |
| `vite`                        | 7.3     | Build tool & dev server     |
| `@vitejs/plugin-react`        | 5.1     | React JSX transform + HMR   |
| `typescript`                  | 5.9     | Type checking               |
| `tailwindcss`                 | 3.4     | Utility-first CSS framework |
| `postcss`                     | 8.5     | CSS processing pipeline     |
| `autoprefixer`                | 10.4    | Browser prefix injection    |
| `eslint`                      | 9.39    | Code linting                |
| `typescript-eslint`           | 8.48    | TypeScript ESLint rules     |
| `eslint-plugin-react-hooks`   | 7.0     | React Hooks lint rules      |
| `eslint-plugin-react-refresh` | 0.4     | React Refresh lint rules    |

### Key Technical Decisions

- **No CSS-in-JS.** All styling is via Tailwind utility classes + a small
  `globals.css` with custom `@layer` extensions.
- **No Redux.** Zustand + Immer provides simpler, lighter state management.
- **No backend.** Pure SPA with static JSON data served from `/public/data/`.
- **No test framework yet.** Testing is done via build verification
  (`tsc -b && vite build`) and ad-hoc Playwright smoke tests. A proper test
  suite is a planned addition.
- **Module system:** ES modules (`"type": "module"` in package.json). TypeScript
  targets ES2022 with `react-jsx` transform.

---

## 4. Data Pipeline

### Source → JSON Conversion

```
MPMB PDF JavaScript Files         Node.js Converter         Static JSON
─────────────────────────    →    ─────────────────    →    ───────────
SRD/Lists*.js                     convert.js                json_data/*.json
All_WizOfTheCoast+UnearthedArc.js   (vm sandbox)            app/public/data/*.json
Player_Handbook.js                  validate.js
DungeonMasterGuide.js               (integrity checks)
Xans_Guide_To_Everything.js
MonsterManual.js
Exp_Guide_To_Wildemount.js
Van_Richten_Guide2Ravenloft.js
Wild_Beyond_the_Witch.js
ExpandedScripts/*.js
```

#### `convert.js` (1,307 lines)

The converter runs all MPMB JavaScript source files in a Node.js `vm` sandbox
that stubs every PDF API call (field access, UI dialogs, print functions). It
then serialises every populated MPMB data list (`ClassList`, `SpellsList`,
`RaceList`, etc.) into clean JSON files using these serialisation rules:

- `RegExp` → `{ _type: "RegExp", source, flags }`
- `Function` → `{ _type: "function", body }` (stored as string, never called
  during conversion)
- Circular references → `"[Circular]"`
- `NaN` / `±Infinity` → `null`

#### `validate.js` (105 lines)

Post-conversion integrity checker. Verifies entry counts, spot-checks known
entries (e.g., Fireball exists, Barbarian has correct fields), and prints a
summary report.

#### `_manifest.json` (367 lines)

Generated alongside the JSON files. Contains:

- Conversion timestamp and version
- Source file processing status (all should be `"ok"`)
- Duplicate/merge report (new entries vs SRD-updated entries)
- Entry counts per data type (22 categories)
- Complete field reference documentation for every JSON schema

### Data Loading at Runtime

`DataService` (`data.service.ts`) lazily fetches JSON files from `/data/*.json`
via `fetch()`, caches them in memory, and provides typed accessor methods:

```typescript
DataService.getClasses()             → DndClass[]
DataService.getSubclasses()          → DndSubclass[]
DataService.getSubclassesForClass(k) → DndSubclass[]
DataService.getRaces()               → DndRace[]
DataService.getRaceVariants()        → DndRaceVariant[]
DataService.getBackgrounds()         → DndBackground[]
DataService.getBackgroundFeatures()  → DndBackgroundFeature[]
DataService.getSpells()              → DndSpell[]
DataService.getSpellsForClass(k)     → DndSpell[]
DataService.getFeats()               → DndFeat[]
DataService.getWeapons()             → DndWeapon[]
DataService.getArmor()               → DndArmor[]
DataService.getGear()                → DndGear[]
DataService.getPacks()               → DndPack[]
DataService.getMagicItems()          → DndMagicItem[]
DataService.getWarlockInvocations()  → DndWarlockInvocation[]
DataService.getSources()             → DndSource[]
DataService.isSpellcaster(classKey)  → boolean
DataService.getEngineDataBundle()    → EngineDataBundle
```

### JSON Data Categories (22 files)

| File                       | Entries | TypeScript Type         |
| -------------------------- | ------- | ----------------------- |
| `classes.json`             | 22      | `DndClass`              |
| `subclasses.json`          | 313     | `DndSubclass`           |
| `spells.json`              | 1,000   | `DndSpell`              |
| `races.json`               | 226     | `DndRace`               |
| `race_variants.json`       | 127     | `DndRaceVariant`        |
| `backgrounds.json`         | 132     | `DndBackground`         |
| `background_features.json` | 164     | `DndBackgroundFeature`  |
| `background_variants.json` | 45      | (untyped — raw objects) |
| `feats.json`               | 307     | `DndFeat`               |
| `weapons.json`             | 106     | `DndWeapon`             |
| `armor.json`               | 15      | `DndArmor`              |
| `ammo.json`                | 28      | (typed as `unknown[]`)  |
| `tools.json`               | 44      | (typed as `unknown[]`)  |
| `gear.json`                | 144     | `DndGear`               |
| `packs.json`               | 8       | `DndPack`               |
| `magic_items.json`         | 887     | `DndMagicItem`          |
| `creatures.json`           | 359     | (typed as `unknown[]`)  |
| `companions.json`          | 11      | (typed as `unknown[]`)  |
| `warlock_invocations.json` | 61      | `DndWarlockInvocation`  |
| `psionics.json`            | 231     | (typed as `unknown[]`)  |
| `sources.json`             | 138     | `DndSource`             |

> **Note:** `ammo`, `tools`, `psionics`, `companions`, and `creatures` are
> loaded as `unknown[]` — they have schema documentation in `_manifest.json` but
> lack TypeScript interface definitions. Adding proper types for these is a
> planned improvement.

---

## 5. Feature Inventory

The full feature-by-feature audit lives in `IMPLEMENTATION_PLAN.md`. Summary:

### Completed (~125 features)

**Character Builder (8-step wizard):**

- Race selection with 226 races, 127 variants, fixed + flexible ASI, traits,
  languages, tool/weapon/armor proficiencies
- Class selection with 22 classes, 313 subclasses, starting level 1-20, fighting
  styles, multiclass prerequisites
- Background selection with 132 backgrounds, 45 variants, skill/tool/language
  proficiencies, equipment, gold, personality traits
- Ability scores via Standard Array, Point Buy (27-point), or Manual entry;
  racial + background + level ASI stacking; score cap at 20
- Equipment with pack selection, starting gold alternative, class weapon
  choices, custom items
- Spells with cantrip/spell count scaling, warlock invocations, prepared vs
  known caster labels, non-caster skip
- Details with name, alignment, physical description, personality/ideals/bonds/
  flaws from background tables, backstory
- Review with full character summary, HP calculation, all proficiencies merged,
  currency initialised, create + save

**Character Sheet:**

- Core stats panel: 6 ability scores + modifiers, proficiency bonus, all 18
  skills with proficiency/expertise dots, 6 saving throws, 3 passive scores,
  Jack of All Trades, Remarkable Athlete, Reliable Talent
- Combat header: HP/temp HP click-to-edit, AC (all armor types + Unarmored
  Defense), initiative, speed, hit dice tracker, death saves (3/3), XP progress
  bar, inspiration toggle
- Conditions tracker (14 D&D conditions with mechanical effects)
- Exhaustion tracker (levels 1-6 with speed/HP/check penalties)
- Attacks panel: full weapon attack management with auto-calculated to-hit and
  damage, magic weapon bonuses, fighting style bonuses, sneak attack, two-weapon
- Spells panel: spell slot tracker, concentration toggle + banner, prepared
  spell toggling, Warlock Pact Magic, multiclass combined slots, ritual/school
  badges, cantrip damage scaling
- Equipment panel: inventory list, armor equip picker, shield toggle, magic item
  browser (887 items), currency tracker (cp/sp/ep/gp/pp), carrying capacity,
  attunement slots (max 3)
- Features panel: class/subclass/race/background/feat features, resource tracker
  dots (usage + recovery), short/long rest labels
- Notes panel: personality traits, backstory, allies, treasure, languages, tool
  proficiencies

**Level-Up Wizard:**

- Class level-up + multiclass add with prerequisite enforcement
- HP allocation (average/max/roll), ASI/feat selection, subclass unlock
- New spells for casters, eldritch invocations for warlocks
- Fighting style, expertise, language/tool proficiency steps
- Ranger Favored Enemy/Terrain, Paladin smite tracking

**Short Rest / Long Rest:** Hit dice expenditure, resource recovery, slot
recovery, Pact Magic recharge, exhaustion decrement.

**Import/Export:** JSON export/import, character duplicate, roster
search/filter.

**3D Dice Roller:** Physics-based rolling with d4, d6, d8, d10, d12, d20, d100
(d10+d10); expression parser (`2d6+5`); quick-roll buttons; tray containment.

**Derived Stats Calculator:** All MPMB formulas faithfully implemented — ability
modifiers, proficiency bonus, saving throws, skill bonuses, passives, max HP, AC
(all variants), spell slots (standard + Warlock + multiclass), spell save DC,
spell attack bonus, attacks per action, cantrip die scaling, carrying capacity,
condition/exhaustion effects.

### Remaining (~5 features, optional/low-priority)

| Feature                                                              | Priority |
| -------------------------------------------------------------------- | -------- |
| Print / shareable character view                                     | Future   |
| Spell point variant rule                                             | Optional |
| 78 magic items with non-standard rarity (cosmetic fix)               | Low      |
| Proper TypeScript types for ammo/tools/psionics/companions/creatures | Low      |
| Source filter pills fully wired to UI store                          | Low      |

---

## 6. File Map & Ownership

### Repository Root (`/home/andre/DnDCharacterCreator/`)

```
├── AGENTS.md                          ← THIS FILE (AI agent directives)
├── IMPLEMENTATION_PLAN.md             ← Feature audit & parity tracker
├── LICENSE                            ← MIT License
├── convert.js                         ← MPMB JS → JSON converter (1,307 lines)
├── validate.js                        ← Post-conversion data validator (105 lines)
├── SRD/                               ← Original MPMB SRD JavaScript modules
│   └── Lists*.js                         (10 files — base game data)
├── ExpandedScripts/                   ← Additional source book scripts
│   └── *.js                              (10 files — expansions/UA)
├── *.js (root)                        ← WotC + supplement MPMB scripts
│   └── Player_Handbook.js, DungeonMasterGuide.js, etc. (7 files)
├── json_data/                         ← Converted JSON data (source of truth)
│   ├── _manifest.json                    (conversion metadata + field reference)
│   └── *.json                            (22 data files)
└── app/                               ← React web application
    ├── package.json                      (dependencies & scripts)
    ├── vite.config.ts                    (Vite build config)
    ├── tsconfig.json                     (TypeScript project references)
    ├── tsconfig.app.json                 (App TypeScript config — strict mode)
    ├── tsconfig.node.json                (Node-side TypeScript config)
    ├── tailwind.config.js                (D&D fantasy theme)
    ├── postcss.config.js                 (PostCSS + Tailwind + Autoprefixer)
    ├── eslint.config.js                  (Flat ESLint config)
    ├── index.html                        (SPA entry point)
    ├── public/
    │   └── data/                         (Copied JSON data for runtime fetch)
    │       └── *.json                    (22 files — mirrors json_data/)
    └── src/                              (Application source — ~55 files, ~9,700+ lines)
        ├── App.tsx                       (Router root)
        ├── main.tsx                      (React DOM entry)
        ├── types/                        (TypeScript type definitions)
        │   ├── character.ts              (Character, BuilderDraft, LevelUpDraft, DerivedStats)
        │   ├── data.ts                   (DndClass, DndSpell, DndRace, etc. — 22+ interfaces)
        │   └── engine.ts                 (Engine interfaces, calc hooks, proficiency tracker)
        ├── store/                        (Zustand state stores)
        │   ├── character.store.ts        (Builder draft + level-up draft + actions)
        │   └── ui.store.ts               (Source filters, search, modal, sheet tab)
        ├── services/                     (Business logic — no UI)
        │   ├── data.service.ts           (Lazy JSON loader with cache)
        │   ├── character.calculator.ts   (Pure math: mods, prof, slots, AC, HP)
        │   ├── character.engine.ts       (Full MPMB-mirror engine — feature processing)
        │   ├── character.repository.ts   (localStorage CRUD + JSON import/export)
        │   ├── feature.processor.ts      (Feature attribute → proficiency/action/resource)
        │   ├── calcChanges.evaluator.ts  (MPMB calcChanges hook execution)
        │   ├── prereq.evaluator.ts       (Prerequisite evaluation for feats/invocations)
        │   ├── skill.parser.ts           (MPMB skillstxt / scorestxt parsing)
        │   └── useCharacterEngine.ts     (React hook wrapping engine + memoisation)
        ├── components/
        │   ├── ui/                        (8 reusable UI primitives)
        │   │   ├── Badge.tsx, Button.tsx, Card.tsx, Divider.tsx
        │   │   ├── Input.tsx, Modal.tsx, Spinner.tsx, Tooltip.tsx
        │   │   └── index.ts              (Barrel export)
        │   ├── layout/
        │   │   ├── AppShell.tsx           (Page wrapper with Header)
        │   │   └── Header.tsx            (Gold-themed nav bar)
        │   ├── builder/
        │   │   ├── BuilderWizard.tsx      (8-step wizard shell)
        │   │   ├── shared/               (Reusable builder components)
        │   │   │   ├── EntityBrowser.tsx, EntityCard.tsx, FilterBar.tsx
        │   │   │   ├── SpellBrowser.tsx, TraitBlock.tsx
        │   │   └── steps/                (One component per wizard step)
        │   │       └── Step1_Race.tsx … Step8_Review.tsx
        │   ├── sheet/
        │   │   ├── CharacterSheet.tsx     (Main sheet: header, tabs, HP, conditions)
        │   │   ├── LevelUpWizard.tsx      (Multi-step level-up modal)
        │   │   └── panels/               (One component per sheet tab)
        │   │       ├── StatsPanel.tsx, AttacksPanel.tsx, SpellsPanel.tsx
        │   │       ├── EquipmentPanel.tsx, FeaturesPanel.tsx, NotesPanel.tsx
        │   └── dice/
        │       ├── DiceRoller.tsx         (3D physics dice engine — Three.js + Rapier)
        │       ├── DicePanel.tsx          (Modal wrapper + quick-roll buttons)
        │       └── index.ts              (Barrel export)
        ├── pages/
        │   ├── HomePage.tsx              (Character roster + import/export)
        │   ├── BuilderPage.tsx           (AppShell + BuilderWizard)
        │   └── SheetPage.tsx             (Load character by ID → CharacterSheet)
        └── styles/
            └── globals.css               (Google Fonts, Tailwind layers, D&D components)
```

---

## 7. Type System Contract

### Core Types (character.ts)

**`Character`** — The saved model. All fields are defined. Key shape:

```typescript
interface Character {
  id: string;
  name: string;
  race: string; // Race key
  raceVariant?: string; // Race variant key
  background: string; // Background key
  classes: CharacterClass[]; // Multiclass support
  abilityScores: [n, n, n, n, n, n]; // [Str, Dex, Con, Int, Wis, Cha]
  skills: Skill[];
  expertise: Skill[];
  chosenCantrips: string[];
  chosenSpells: string[];
  equipment: EquipmentItem[];
  currency: { cp; sp; ep; gp; pp };
  currentHp: number;
  tempHp: number;
  hitDiceUsed: Record<string, number>;
  slotsUsed: number[];
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  conditions: string[];
  exhaustion: number;
  attacks: Attack[];
  concentratingOn: string | null;
  inspiration: boolean;
  preparedSpells: string[];
  feats: string[];
  attuned: string[];
  // ... personality, backstory, notes fields
}
```

**`BuilderDraft`** — In-progress character during the 8-step wizard. Contains
`currentStep`, `visitedSteps: Set<number>`, and all partial selections that
eventually compile into a `Character` at Step 8.

**`LevelUpDraft`** — Tracks choices during the level-up flow: class to level, HP
method, ASI allocations, feat choice, new spells, etc.

**`DerivedStats`** — Computed display-only values. Never persisted. Always
recalculated from `Character` + `EngineDataBundle`.

### Data Types (data.ts)

22+ interfaces mirroring the JSON schemas documented in `_manifest.json`. These
use `SerializedRegExp` (`{ _type: "RegExp", source, flags }`) and
`SerializedFunction` (`{ _type: "function", body }`) for MPMB-originated
patterns and code.

### Engine Types (engine.ts)

Rich type system for the character engine: `CalcChangesRegistry`,
`ProficiencyTracker` (14 Maps), `TrackedResource`, `TrackedAction`,
`ActiveFeature`, `SpellcastingEntry`, `AttackCalcContext`, etc.

### Rules for Agents

- **NEVER change the `Character` interface shape without updating ALL
  consumers** — this includes `character.store.ts`, `character.repository.ts`,
  `character.calculator.ts`, `character.engine.ts`, `useCharacterEngine.ts`,
  `CharacterSheet.tsx`, `LevelUpWizard.tsx`, `Step8_Review.tsx`, and every panel
  component.
- **NEVER change data type interfaces without verifying consistency with the
  actual JSON data files** in `json_data/` and `app/public/data/`.
- TypeScript strict mode is ON. Zero type errors is the baseline. A build that
  produces type errors is a broken build.

---

## 8. State Management Contract

### Zustand + Immer Pattern

The app uses two Zustand stores:

**`useCharacterStore`** (character.store.ts):

- Uses `immer` middleware with `enableMapSet()` for `Set`/`Map` support
- Holds `draft: BuilderDraft` (wizard state) and
  `levelUpDraft: LevelUpDraft | null`
- 30+ actions for wizard step mutations
- Exported pure functions: `resolveFinalScores()`, `stepIsComplete()`

**`useUiStore`** (ui.store.ts):

- Plain Zustand (no immer)
- Holds `activeSourceFilters`, `searchText`, `modal`, `sheetTab`, `previewKey`

### Rules for Agents

- **NEVER introduce a new state management library.** Zustand + Immer is the
  pattern. Period.
- State mutations in `useCharacterStore` MUST go through Immer's
  `set(state =>
  { ... })` pattern. Direct mutation of state objects outside of
  Immer producers will cause bugs.
- The `Character` object stored in localStorage is the ground truth. Derived
  values are computed via `computeDerivedStats()` and the `CharacterEngine` —
  they are NEVER stored.
- If a new piece of state is needed, determine whether it belongs in
  `useCharacterStore` (character data), `useUiStore` (UI-only ephemeral state),
  or as local component state.

---

## 9. Service Layer Contract

The service layer (`app/src/services/`) contains ALL business logic. Components
are presentation-only — they call services, they do not implement game rules.

### Service Responsibilities

| Service                    | Responsibility                                                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data.service.ts`          | Load, cache, and query JSON data files. Format source references.                                                                                                      |
| `character.calculator.ts`  | Pure math: ability modifiers, proficiency bonus, spell slots, AC, HP, cantrip die, carrying capacity. NO side effects.                                                 |
| `character.engine.ts`      | Full MPMB-mirror engine. Resolves all class/race/background features into proficiencies, resources, actions, calcChanges hooks. This is the heart of rules processing. |
| `feature.processor.ts`     | Processes individual feature attribute blocks into proficiency/action/resource entries. Called by the engine.                                                          |
| `calcChanges.evaluator.ts` | Evaluates MPMB `calcChanges` hooks (atkCalc, spellCalc, hp) using a sandboxed context that mimics MPMB's global state.                                                 |
| `prereq.evaluator.ts`      | Evaluates `prereqeval` functions for feats and invocations by building a mock MPMB global context (`CurrentStats`, `classes.known`, etc.).                             |
| `skill.parser.ts`          | Parses MPMB's `skillstxt` and `scorestxt` formatted strings into structured data.                                                                                      |
| `character.repository.ts`  | CRUD operations over `localStorage`. JSON import/export. Character ID generation.                                                                                      |
| `useCharacterEngine.ts`    | React hook that instantiates + memoises the `CharacterEngine` for a given character and data bundle. Exposes computed results to components.                           |

### Rules for Agents

- **Game rule logic belongs in services, NOT in components.** If you find
  yourself writing D&D math inside a `.tsx` file, you are in the wrong layer.
- `character.calculator.ts` is for pure computation functions (no state, no side
  effects). The engine (`character.engine.ts`) is for stateful resolution that
  processes the full character.
- `DataService` uses lazy-loading with an in-memory cache. Data is fetched once
  on first access. Do not modify this pattern.
- When adding new calculators, follow the existing function signature patterns:
  pure inputs → pure outputs, no closures over mutable state.

---

## 10. UI Component Contract

### Shared UI Primitives (`components/ui/`)

8 reusable components with consistent API:

| Component | Purpose                                             |
| --------- | --------------------------------------------------- |
| `Badge`   | Coloured label pill (gold/crimson/stone/green/blue) |
| `Button`  | 4 variants × 3 sizes + disabled/loading states      |
| `Card`    | Parchment-textured card with header/footer slots    |
| `Divider` | Gold ornamental divider with optional label         |
| `Input`   | Input + Textarea with parchment styling             |
| `Modal`   | Escapable overlay modal with 5 sizes (sm → full)    |
| `Spinner` | Gold SVG spinner for loading states                 |
| `Tooltip` | Hover tooltip (top/bottom/left/right positioning)   |

All are barrel-exported from `components/ui/index.ts`.

### Rules for Agents

- **Use existing UI primitives.** Do not create new button/modal/card components
  when `Button`, `Modal`, `Card` already exist.
- **Maintain the D&D fantasy aesthetic.** All new UI must use the established
  colour palette (parchment, gold, crimson, stone, leather, dark-ink) and
  typography (Cinzel for headings, EB Garamond for body).
- **Components are presentation-only.** They receive data via props and call
  callbacks. They do not fetch data or compute game rules.
- New reusable primitives go in `components/ui/`. Page-specific components go in
  their relevant directory (`builder/`, `sheet/`, `dice/`, etc.).
- Import UI primitives from `../ui` (the barrel export), not from individual
  files.

---

## 11. Styling & Theming Contract

### Tailwind Configuration

The theme is defined in `tailwind.config.js` with D&D fantasy extensions:

**Colours:**

- `parchment` (warm cream), `aged-paper` (darker parchment), `page-bg` (deep
  brown)
- `dark-ink` (near-black text), `gold` (accent + interactive)
- `crimson` (danger/important), `stone` (neutral/muted), `leather` (warm brown)
- `shadow` (overlay/depth)

**Typography:**

- `font-display`: Cinzel (serif display font — headings, labels)
- `font-body`: EB Garamond (serif body font — descriptions, text)

**Shadows:** `parchment`, `card`, `card-hover`, `inset-gold`

**Background images:** `parchment-texture`, `page-texture` (CSS gradients)

**Animations:** `fade-in`, `slide-in`, `shimmer`

### Custom CSS Layers (`globals.css`)

- `@layer base`: Body/heading defaults, custom scrollbar
- `@layer components`: `.divider-gold`, `.surface-parchment`, `.ability-box`,
  `.prof-dot`, `.step-tab`, `.school-pill`, `.badge-ritual`, `.badge-conc`
- `@layer utilities`: `.text-shadow`, `.glow-gold`, `.glow-crimson`,
  `.border-ornate`, `.no-scrollbar`

### Rules for Agents

- **Do not introduce new colour values outside the theme.** Use Tailwind theme
  colours (`text-gold`, `bg-parchment`, `border-crimson`, etc.). If a new shade
  is genuinely needed, add it to `tailwind.config.js`.
- **Do not add new fonts.** The typography is Cinzel + EB Garamond. These were
  chosen for their D&D aesthetic and are loaded via Google Fonts.
- **Tailwind utility classes are the primary styling mechanism.** Inline styles
  should only be used for dynamic values (e.g., `style={{ width:`${pct}%`}}`).
  Custom CSS goes in `globals.css` only when Tailwind cannot express it.

---

## 12. 3D Dice Engine Contract

### Architecture

`DiceRoller.tsx` (1,117 lines) is a self-contained Three.js + Rapier3D physics
engine exposed as a React component via `forwardRef`.

**Key constants:**

- `TRAY_SIZE = 100` (cm), `TRAY_WALL_HEIGHT = 32`,
  `TRAY_CONTAINMENT_HEIGHT = 90`
- `SETTLE_FRAMES_REQUIRED = 60` (physics steps at 240 Hz)
- `MAX_ROLL_TIME_MS = 15,000` (timeout fallback)
- Gravity: `981 cm/s²`, physics timestep: `1/240`

**Geometry:**

- d4: Tetrahedron (vertex-style reading — top vertex determines value)
- d6: Box geometry (cube)
- d8: Octahedron
- d10: Pentagonal trapezohedron (custom geometry)
- d12: Dodecahedron
- d20: Icosahedron

All polyhedra use `detail = 0` to preserve exact face normals for value
determination.

**Face reading:** `extractFaceNormals()` + `buildFaceLayout()` compute the
canonical normal-to-value mapping from actual geometry. The upward-facing normal
after settling determines the rolled value.

**Expression parser:** Tokenised parser supporting `NdX`, `NdX+M`, `NdX-M`,
`d100`, signed dice, and modifier terms.

**Integration:**

- `DicePanel.tsx` wraps `DiceRoller` in a `Modal` with quick-roll buttons and an
  expression input.
- `CharacterSheet.tsx` toggles `DicePanel` visibility via local state.
- `DiceRoller` exposes `roll(expression)` via `useImperativeHandle`.
- Readiness is communicated via `onReadyChange(ready: boolean)` callback.

### Rules for Agents

- **Do not change polyhedra geometry without verifying face-normal value maps
  still produce correct results.** A die that reads wrong values is worse than
  no die.
- **Do not change physics constants without testing.** The throw feel (spawn
  height, horizontal/vertical velocity ranges, torque ranges) was tuned to
  provide satisfying rolls that settle within the tray.
- Three.js and Rapier3D-compat are the graphics/physics stack. Do not swap these
  for alternatives.

---

## 13. Build & Tooling

### NPM Scripts

```bash
npm run dev      # Vite dev server (HMR)
npm run build    # TypeScript check + Vite production build (tsc -b && vite build)
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Build Validation

A passing build (`npm run build`) means:

1. TypeScript compilation passes with zero errors (`tsc -b`)
2. Vite bundles all modules successfully
3. No unused imports/variables (enforced by `noUnusedLocals`,
   `noUnusedParameters`)

### Rules for Agents

- **Every change MUST pass `npm run build` before being considered complete.**
  This is non-negotiable.
- The working directory for all `npm` commands is `app/` (not the repo root).
- `tsc -b` must produce zero errors. Zero warnings is preferred but not
  blocking.
- If a build fails, the agent MUST fix the failure before proceeding to any
  other task. Never leave the codebase in a broken build state.

---

## 14. Agent Behavioral Directives (MANDATORY)

> **These directives are non-optional. Any AI Coding Agent operating on this
> codebase MUST follow every directive below. Violations of these rules
> constitute a failed task regardless of other output.**

### 14.1 — Full Context Consumption

**Before making ANY change — no matter how trivial — the agent MUST:**

1. Read this `AGENTS.md` file in its entirety.
2. Read `IMPLEMENTATION_PLAN.md` to understand feature parity status.
3. Understand the full stack: types → stores → services → components → styles.
4. Identify ALL files that will be affected by the change.
5. Read the current content of every file that will be modified.
6. Verify that the proposed change is consistent with the existing architecture,
   type system, styling, and state management patterns documented above.

**The agent MUST NOT make changes based on assumptions about file contents it
has not read.** "I assume this file probably looks like..." is unacceptable.
Read the file. Every time.

### 14.2 — Absolute Task Completion (NEVER SKIP, NEVER SHORTCUT)

**The agent MUST NOT skip any uncompleted task.** This directive is absolute and
overrides any time pressure, context length concern, or other consideration.

Specifically:

- **NEVER move to the next todo item until the current one is completely
  implemented end-to-end and tested.** "Partially done" is not done. "Mostly
  works" is not working. "Should be fine" is not verified.

- **NEVER mark a task as complete until:**
  1. The implementation is fully written (all code changes applied).
  2. The build passes (`npm run build` exits with code 0).
  3. Any UI changes have been verified to render correctly.
  4. Edge cases have been considered and handled.
  5. The change is consistent with the full type system (no `any` escape
     hatches, no type assertions that paper over real problems).

- **NEVER leave TODO comments as a substitute for implementation.** A TODO
  comment means the work is not done. If you write `// TODO: handle edge case`,
  you must then immediately handle that edge case.

- **NEVER say "I'll leave this for later" or "this can be done as a follow-up"
  for work that was part of the current task.** If it was requested, it must be
  delivered. In full. Now.

- **NEVER produce partial implementations.** If a feature requires changes to
  types, services, stores, and components, ALL of those layers must be updated
  in the same task. A type definition without a consumer, or a service without a
  caller, is incomplete.

- **If a task is too large to complete in one pass, break it into subtasks and
  complete each subtask fully before moving to the next.** Use the todo list
  tool to track this. But every subtask must be individually complete and
  verified before advancing.

### 14.3 — Rigorous Testing

Every change must be tested. The minimum testing bar is:

1. **Build verification:** `npm run build` passes (zero TS errors, Vite
   bundles).
2. **Lint check:** No new ESLint errors introduced.
3. **Manual inspection:** For UI changes, verify the component renders correctly
   by reading the rendered output or running a dev server.
4. **Edge case validation:** For calculation/logic changes, trace through at
   least 2-3 representative inputs including boundary cases.
5. **Regression check:** Verify that related features still work — e.g., if you
   change `character.calculator.ts`, verify that `StatsPanel`, `AttacksPanel`,
   `SpellsPanel`, and `CharacterSheet` still receive correct values.

For significant features, the agent SHOULD run an automated browser smoke test
(Playwright or equivalent) to validate the full integration path.

### 14.4 — Architectural Consistency

The agent MUST maintain the existing architectural patterns:

- **Type safety first.** TypeScript strict mode. No `any` unless interfacing
  with genuinely untyped external APIs (and even then, add a proper wrapper).
- **Services compute, components display.** Game rules and D&D math belong in
  `services/`. UI rendering belongs in `components/`. This separation is
  absolute.
- **Zustand + Immer for state.** No introducing new state management patterns.
- **Tailwind for styling.** No CSS-in-JS, no styled-components, no emotion.
  Custom CSS goes in `globals.css` only when Tailwind cannot express it.
- **Existing UI primitives.** Use `Badge`, `Button`, `Card`, `Divider`, `Input`,
  `Modal`, `Spinner`, `Tooltip` from `components/ui/`. Don't reinvent them.
- **Data flows down, events flow up.** Props for data, callbacks for events. No
  prop drilling deeper than 2 levels — if a deeply nested component needs data,
  use the store or a context.

### 14.5 — MPMB Fidelity

This app mirrors the MPMB Character Sheet. When implementing features:

- **Consult the original MPMB source files** (`SRD/`, `ExpandedScripts/`, root
  `.js` files) for reference on how specific calculations or automations work.
- **Match the MPMB formulas exactly.** `floor((score - 10) / 2)` for ability
  modifiers. The multiclass spell slot table. The proficiency bonus list. The AC
  formulas. These are not approximations — they are the D&D 5e rules.
- **Preserve data fidelity.** The JSON data was carefully extracted from MPMB
  source files. Do not hand-edit JSON data files. If data corrections are
  needed, fix them in `convert.js` and re-run the pipeline.

### 14.6 — No Destructive Actions Without Explicit Instruction

- **NEVER delete files** unless explicitly asked or the file was created as a
  temporary artifact in the current session.
- **NEVER remove existing features** unless explicitly asked. Adding a feature
  must not break or remove an existing one.
- **NEVER modify `convert.js`, `validate.js`, or files in `json_data/`** unless
  the task specifically involves the data pipeline.
- **NEVER modify files in `SRD/` or `ExpandedScripts/`** — these are reference
  source files from the MPMB project.

### 14.7 — Communication Standards

- When proposing changes, describe WHAT will be changed and WHY.
- When a change touches multiple files, list all affected files upfront.
- When encountering ambiguity in requirements, choose the interpretation that is
  most consistent with D&D 5e rules and the existing codebase patterns.
- If a requested change would break existing functionality, flag the conflict
  and propose an alternative approach.
- Do not report completion until the work is actually complete and verified.

---

## 15. Dependency Policy

**The AI Coding Agent is fully authorised to install any npm dependencies
necessary to complete requested features, fixes, or additions.** This includes
both runtime and dev dependencies.

### Guidelines

- **Prefer well-maintained, widely-used packages.** Check that the package has
  recent releases and a healthy number of weekly downloads.
- **Runtime dependencies** (`dependencies` in package.json) must be justified —
  they affect bundle size. Only add what is genuinely needed.
- **Dev dependencies** (`devDependencies`) for testing, linting, building, or
  code generation are freely acceptable.
- **After installing a new dependency**, verify the build still passes and that
  the dependency is correctly resolved.
- **Document why a new dependency was added** in the commit message or PR
  description — what does it provide that wasn't available before?
- **Do not install packages that duplicate existing functionality.** For
  example, do not install Lodash when the needed utility is a one-liner.
- **Permitted package managers:** `npm` (the project uses npm — do not switch to
  yarn, pnpm, or bun without explicit instruction).

### Currently Installed (Reference)

See Section 3 (Technology Stack) for the complete list. Key points:

- React/React-DOM 19.2 (do not downgrade)
- Three.js 0.183 + Rapier3D 0.19 (do not swap for alternatives)
- Zustand 5 + Immer 11 (do not add Redux/MobX/Jotai/Recoil)
- Tailwind 3.4 (do not add styled-components/emotion/CSS modules)

---

## 16. Testing Requirements

### Current State

The project does not yet have a formal test suite (no Jest, Vitest, or
Playwright test runner configured). Testing is currently performed via:

1. **Build verification:** `tsc -b && vite build` (catches type errors and
   import/export issues)
2. **Ad-hoc smoke tests:** Playwright-based browser tests for critical flows
   (dice roller, character creation) run on demand

### Testing Bar for All Changes

At minimum, every change must:

1. Pass `npm run build` with zero errors.
2. Not introduce new ESLint violations.
3. Be manually verified for correctness (trace the logic, check the math).

### When to Run Automated Smoke Tests

Automated browser smoke tests (using Playwright) SHOULD be run when:

- Modifying the 3D dice engine (`DiceRoller.tsx`, `DicePanel.tsx`)
- Modifying the character creation wizard flow (builder steps → save)
- Modifying the character sheet interactive features (HP tracking, conditions,
  spell slots, level-up)
- Modifying the data loading pipeline (`data.service.ts`)
- Making changes that could affect multiple components simultaneously

### Future Test Infrastructure (Planned)

- **Vitest** for unit tests on services (`character.calculator.ts`,
  `character.engine.ts`, `skill.parser.ts`, etc.)
- **Playwright** for E2E tests on critical user flows
- **Component tests** for UI primitives and complex panels
- When this infrastructure is added, all new features should include tests.

---

## 17. Remaining / Planned Features

These items are not yet implemented and represent the known backlog:

### Near-term

| Feature                         | Description                                                                                   | Affected Files                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Print / shareable view          | Generate a printable character sheet layout                                                   | New component, possibly `components/sheet/PrintView.tsx` |
| Source filter wiring            | Connect FilterBar source pills to `useUiStore.activeSourceFilters` and filter entity browsers | `FilterBar.tsx`, `EntityBrowser.tsx`, `useUiStore`       |
| Proper types for remaining data | Add TypeScript interfaces for `ammo`, `tools`, `psionics`, `companions`, `creatures`          | `types/data.ts`, `data.service.ts`                       |

### Optional / Low Priority

| Feature                         | Description                                                |
| ------------------------------- | ---------------------------------------------------------- |
| Spell point variant             | Alternative to spell slots (DMG variant rule)              |
| Magic item rarity normalisation | Fix 78 items with non-standard rarity strings              |
| Formal test suite               | Vitest unit tests + Playwright E2E tests                   |
| PWA / offline support           | Service worker for full offline capability                 |
| Character sharing               | URL-based character sharing (encode to URL or hosted JSON) |

### Aspirational (Not Committed)

| Feature                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| Companion / familiar sheet | Use `companions.json` + `creatures.json` data  |
| Encounter builder          | Use `creatures.json` for DM encounter planning |
| PDF export                 | Generate a filled MPMB-compatible PDF          |
| Campaign notes             | Long-form session notes tied to a character    |

---

## Appendix A: Quick Reference — File to Edit for Common Tasks

| Task                      | Primary File(s)                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Change a D&D calculation  | `services/character.calculator.ts`                                                                                                  |
| Add a new derived stat    | `types/character.ts` (DerivedStats) → `services/character.calculator.ts` → consuming panel                                          |
| Add a new character field | `types/character.ts` (Character) → `store/character.store.ts` → `services/character.repository.ts` → consuming components           |
| Add a new builder step    | `types/character.ts` (BuilderDraft) → `store/character.store.ts` → new `components/builder/steps/StepN_*.tsx` → `BuilderWizard.tsx` |
| Add a new sheet panel tab | New `components/sheet/panels/*.tsx` → `CharacterSheet.tsx` (tab list + render)                                                      |
| Add a new UI primitive    | `components/ui/*.tsx` → `components/ui/index.ts` (barrel export)                                                                    |
| Fix a data issue          | `convert.js` → re-run → copy to `app/public/data/`                                                                                  |
| Add a new data type       | `types/data.ts` → `services/data.service.ts` → consuming service/component                                                          |
| Modify the dice roller    | `components/dice/DiceRoller.tsx` (physics/geometry) or `DicePanel.tsx` (UI wrapper)                                                 |
| Change the colour theme   | `tailwind.config.js` → `styles/globals.css` if needed                                                                               |
| Add feature processing    | `services/feature.processor.ts` → `services/character.engine.ts` → consuming panel                                                  |

## Appendix B: D&D 5e Rules Quick Reference

Key formulas that MUST be consistent across the codebase:

```
Ability Modifier    = floor((score - 10) / 2)
Proficiency Bonus   = ceil(level / 4) + 1       (or lookup table: [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6])
Skill Bonus         = ability_mod + (proficient ? prof_bonus : 0) + (expertise ? prof_bonus : 0)
Passive Score       = 10 + skill_bonus + (advantage ? 5 : 0) - (disadvantage ? 5 : 0)
Spell Save DC       = 8 + prof_bonus + spellcasting_ability_mod
Spell Attack Bonus  = prof_bonus + spellcasting_ability_mod
AC (unarmored)      = 10 + DEX_mod
AC (light armor)    = armor_base + DEX_mod
AC (medium armor)   = armor_base + min(DEX_mod, 2)
AC (heavy armor)    = armor_base (no DEX)
AC (shield)         = +2
Barbarian Unarmored = 10 + DEX_mod + CON_mod
Monk Unarmored      = 10 + DEX_mod + WIS_mod
Carrying Capacity   = STR_score × 15
HP at Level 1       = hit_die_max + CON_mod
HP at Level N       = HP_prev + (hit_die_avg_or_roll) + CON_mod
Cantrip Die         = [1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4] (by total level, index 0-19)
Multiclass Slots    = standard table lookup by combined caster level (full=1, half=0.5, third=0.33)
Warlock Pact Slots  = separate table, short-rest recovery
```

---

_Last updated: 2026-02-26_ _This file is authoritative for all AI Coding Agents
operating on this repository._
