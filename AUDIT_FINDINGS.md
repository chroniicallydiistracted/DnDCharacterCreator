# Codebase Audit Findings — Full Deep Analysis

> **Generated:** 2026-02-26 **Scope:** Every source file in `app/src/`, all
> config files, styles, and entry points. **Total Issues Found:** 76

Legend: ✅ = Fixed | ⬜ = Not yet fixed

---

## CRITICAL — D&D Rules Violations (Incorrect Game Logic)

### ✅ 1. Third-caster spell slots never computed

**File:** `services/character.calculator.ts` **Description:** `CASTER_TIERS`
maps `'eldritch knight'` and `'arcane trickster'` as keys, but these are
**subclass** names, not class keys. In `computeSpellSlots()`, the loop iterates
`cc.classKey` (e.g., `'fighter'`, `'rogue'`), which never matches these entries.
Third-caster spell slots are always zero. **Fix:** Check `cc.subclassKey`
against `CASTER_TIERS` when `cc.classKey` doesn't match, or add proper
class-level mappings that account for subclass spellcasting.

### ✅ 2. Half/third-caster spell level access is wrong in builder

**File:** `builder/steps/Step6_Spells.tsx` (L74), `sheet/LevelUpWizard.tsx`
(L273) **Description:** Formula `Math.ceil(startingLevel / 2)` is for full
casters only. A level-5 Ranger gets offered level-3 spells (should be level-2
max). Same issue in LevelUpWizard. **Fix:** Use a proper max-spell-level
function that respects caster tier (full/half/third) and the multiclass spell
slot table.

### ✅ 3. Temp HP doesn't absorb damage

**File:** `sheet/CharacterSheet.tsx` (L160) **Description:** `adjustHp()`
applies damage directly to `currentHp`. Per D&D 5e PHB p.198, temp HP should
absorb damage first before real HP is reduced. **Fix:** In `adjustHp()`, when
`delta < 0`, subtract from `tempHp` first, then carry remainder to `currentHp`.

### ✅ 4. Feats not saved during level-up

**File:** `sheet/LevelUpWizard.tsx` (L252) **Description:** When
`asiMode === 'feat'`, the chosen feat key is never appended to `char.feats[]`.
The feat's mechanical benefits are permanently lost. **Fix:** Add
`feats: [...(char.feats ?? []), chosenFeatKey]` to the updated character in
`handleConfirm`.

### ✅ 5. Short Rest conflates Warlock pact slots with standard slots

**File:** `sheet/CharacterSheet.tsx` (L269) **Description:** Pact Magic slots
and standard multiclass slots share the same `slotsUsed[]` array. A short rest
zeroes `slotsUsed[pactLevel]`, which also restores standard slots at that
level—giving free spell slots. **Fix:** Track pact slot usage separately (e.g.,
`pactSlotsUsed: number`) or add pact slot count to the offset so only pact slots
are restored.

### ✅ 6. Fighter Additional Fighting Style at level 10 blocked

**File:** `sheet/LevelUpWizard.tsx` (L151) **Description:** Condition
`!existingEntry?.fightingStyle` skips the fighting style step if one already
exists, blocking Fighter 10's additional style. **Fix:** Check if the class
gains a fighting style at this specific level (e.g., Fighter L10), not just
whether one exists.

### ✅ 7. Archery fighting style bonus applied to spell attacks

**File:** `sheet/panels/AttacksPanel.tsx` (L43) **Description:** When
`abilityUsed === 'spellcasting'`, `archeryBonus` is still added. Archery only
applies to ranged **weapon** attacks (PHB p.72). **Fix:** Guard `archeryBonus`
with `&& abilityUsed !== 'spellcasting'`.

### ✅ 8. Passive scores don't include advantage/disadvantage modifier

**File:** `services/character.calculator.ts` **Description:**
`passivePerception/Investigation/Insight` are `10 + skillBonus`, but D&D 5e adds
+5 for advantage and −5 for disadvantage (PHB p.175). **Fix:** Accept
advantage/disadvantage state for passives. At minimum, pass advantage flags from
the engine's `advantages` tracker.

---

## HIGH — Functional Bugs

### ✅ 9. `useStartingGold` flag completely ignored

**Files:** `builder/steps/Step5_Equipment.tsx`, `builder/steps/Step8_Review.tsx`
**Description:** Users can tick "use starting gold" but Step8's
`handleBeginAdventure` always includes pack equipment regardless. **Fix:** In
Step8, check `draft.useStartingGold` and skip pack/class equipment when true,
using only the gold amount.

### ✅ 10. Background variant proficiencies not applied to character

**File:** `builder/steps/Step3_Background.tsx` **Description:**
`setBackgroundVariant()` stores only the key. The variant's `toolProfs`,
`skillReplace`, and feature overrides are displayed but never propagated to the
final character. **Fix:** In Step8's character assembly, merge variant overrides
onto the base background's proficiencies.

### ✅ 11. Feat prerequisites not enforced in builder

**File:** `builder/steps/Step4_AbilityScores.tsx` (L421) **Description:**
`LevelFeatPanel` displays `feat.prereqs` text but doesn't call
`evaluatePrereq()`. Users can select feats they don't qualify for. **Fix:**
Import `evaluatePrereq` and disable/grey-out feats whose prerequisites aren't
met.

### ✅ 12. `computeDerivedStats` called without armor/class data on HomePage

**File:** `pages/HomePage.tsx` (L165) **Description:** Called in a render loop
for each roster card with `allArmor` and `allClasses` as `undefined`, producing
incorrect HP and AC. **Fix:** Load classes/armor data in the HomePage's initial
fetch and pass them to `computeDerivedStats`.

### ✅ 13. StatsPanel save proficiency detection is heuristic, not data-driven

**File:** `sheet/panels/StatsPanel.tsx` (L57) **Description:**
`hasProf = (derived.savingThrows[abbr] ?? mods[i]) > mods[i]` infers proficiency
by comparing bonus vs raw modifier. Fails with conditions, magic items, or edge
cases. **Fix:** Add a `saveProficiencies: string[]` field to `DerivedStats`
computed from `CLASS_SAVES`, and use that directly.

### ✅ 14. StatsPanel save key casing mismatch

**File:** `sheet/panels/StatsPanel.tsx` **Description:** `SAVE_ABBR` uses
`'Str'`, `'Dex'` but `computeDerivedStats` may use uppercase `'STR'`. Lookup
returns `undefined`, falling back to raw modifiers. **Fix:** Normalize casing —
use consistent keys (e.g., lowercase `'str'`) throughout.

### ✅ 15. Standard Array assignment stale state when switching methods

**File:** `builder/steps/Step4_AbilityScores.tsx` (L26) **Description:**
`useState` initializer runs only on mount. Switching from Point Buy → Standard
Array doesn't reset local `assignments` state until remount. **Fix:** Add a
`useEffect` that resets local state when `draft.abilityScoreMethod` changes.

### ✅ 16. Background feature lookup uses fuzzy matching

**File:** `builder/steps/Step3_Background.tsx` (L128) **Description:**
`f._key.toLowerCase().includes(bg.feature?.toLowerCase().split(' ')[0])` could
match wrong features sharing the same first word. **Fix:** Use exact match first
(`===`), and only fall back to fuzzy match if exact fails. Add a warning when
fuzzy match is used.

### ✅ 17. `hitDiceUsed` initialized as `[0]` for all characters

**File:** `builder/steps/Step8_Review.tsx` (L125) **Description:**
Single-element array doesn't scale to multiclass. The sheet's hit dice tracker
indexes by class. **Fix:** Initialize as `char.classes.map(() => 0)` to match
class count.

### ✅ 18. Engine is instantiated but mostly suppressed in CharacterSheet

**File:** `sheet/CharacterSheet.tsx` (L116) **Description:** Engine results
(`activeFeatures`, `resources`, `actions`, etc.) are silenced with `void`. The
sheet uses legacy `computeDerivedStats()` for all values, meaning engine
features provide no benefit. **Fix:** This is an architecture issue. Gradually
migrate panels to use engine results. At minimum, surface engine warnings.

### ✅ 19. Modal lacks focus trap, portal, and ARIA

**File:** `components/ui/Modal.tsx` **Description:** Missing `role="dialog"`,
`aria-modal="true"`, focus trapping, body scroll lock, and
`ReactDOM.createPortal`. Focus can tab behind the modal. **Fix:** Add
`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, body scroll lock, and
portal rendering.

---

## MEDIUM — Logic Issues & Inconsistencies

### ✅ 20. Multiclass source class prerequisites not checked

**File:** `sheet/LevelUpWizard.tsx` **Description:** D&D 5e requires meeting
prerequisites for both current and target class when multiclassing. Only the
target is checked. **Fix:** Also call `meetsMulticlassPrereq` for every existing
class before allowing multiclass.

### ✅ 21. Fighting style not cleared when level drops below threshold

**File:** `builder/steps/Step2_Class.tsx` (L349) **Description:** If user picks
level 2 for Fighter (selecting a style), then drops to level 1, the style
remains in the draft. **Fix:** Add a `useEffect` or guard that clears
`chosenFightingStyle` when level drops below `FIGHTING_STYLE_LEVEL`.

### ✅ 22. `Textarea` not exported from UI barrel

**File:** `components/ui/index.ts` **Description:** `Textarea` defined in
`Input.tsx` but not re-exported from the barrel. **Fix:** Add
`export { Textarea } from './Input';` to index.ts.

### ✅ 23. Finesse weapon ability calculation incomplete in AttacksPanel

**File:** `sheet/panels/AttacksPanel.tsx` (L100) **Description:** Finesse
weapons should use the higher of STR/DEX. The panel hard-codes `'STR'` for all
melee. **Fix:** Detect finesse property from weapon data and pick
`Math.max(strMod, dexMod)`.

### ✅ 24. Prepared spell limit not enforced

**File:** `sheet/panels/SpellsPanel.tsx` **Description:** Shows
`Prepared Spells (N/M)` but allows unlimited preparation. Wizards should cap at
`INT mod + wizard level`. **Fix:** Calculate max prepared count from class rules
and disable preparation toggle when at cap.

### ✅ 25. `@types/three` in runtime dependencies

**File:** `package.json` **Description:** Type packages are dev-only and should
not ship in production bundles. **Fix:** Move to `devDependencies`.

### ✅ 26. ESLint `ecmaVersion: 2020` mismatches TypeScript `ES2022`

**File:** `eslint.config.js` **Description:** ESLint parser won't understand
ES2022 syntax. **Fix:** Change `ecmaVersion` to `2022` or `'latest'`.

### ✅ 27. `Character.gold` and `Character.currency` coexist

**File:** `types/character.ts` **Description:** Both fields track currency,
creating confusion. **Fix:** Remove `gold` field if unused, keeping only
`currency`.

### ✅ 28. Card component clickable without keyboard support

**File:** `components/ui/Card.tsx` **Description:** Interactive cards (with
`onClick`) have no `role="button"`, `tabIndex`, or keyboard handler. WCAG
violation. **Fix:** When `onClick` is provided, add `role="button"`,
`tabIndex={0}`, and `onKeyDown` for Enter/Space.

### ✅ 29. Input/Textarea label association broken

**File:** `components/ui/Input.tsx` **Description:** `<label>` has no `htmlFor`
and `<input>` has no `id`. Screen readers can't associate them. **Fix:**
Generate a unique `id` (via `useId()`) and set `htmlFor`/`id` accordingly.

### ✅ 30. Tooltip only responds to mouse, not keyboard/focus

**File:** `components/ui/Tooltip.tsx` **Description:** No `onFocus`/`onBlur`
handlers, no `role="tooltip"`, no `aria-describedby`. **Fix:** Add focus/blur
handlers, `role="tooltip"`, and `aria-describedby` linking.

### ✅ 31. DiceRoller full scene teardown on resize

**File:** `components/dice/DiceRoller.tsx` (L596) **Description:** `useEffect`
depends on `[width, height]`, destroying/recreating the entire Three.js scene on
every resize. **Fix:** Separate the resize logic into its own `useEffect` that
only updates camera aspect and renderer size.

### ✅ 32. DicePanel stale closure in auto-roll useEffect

**File:** `components/dice/DicePanel.tsx` (L79) **Description:** `doRoll` is
called but not in the dependency array. Works by accident. **Fix:** Store
`doRoll` in a ref, or restructure the effect to inline the roll logic with
proper deps.

### ✅ 33. Google Fonts loaded via render-blocking CSS @import

**File:** `styles/globals.css` (L1) **Description:** Redundant with the `<link>`
tags in `index.html`. CSS `@import` is render-blocking. **Fix:** Remove the
`@import` from `globals.css` since fonts are already loaded via HTML `<link>`.

### ✅ 34. No top-level error boundary

**File:** `App.tsx` **Description:** Any unhandled error crashes the entire app
to a white screen. **Fix:** Add a React error boundary component around
`<Routes>`.

### ✅ 35. `sheetTab` type in ui.store missing 'stats' and 'attacks'

**File:** `store/ui.store.ts` **Description:** Type is
`'features' | 'spells' | 'equipment' | 'notes'` — missing tabs used in
CharacterSheet. **Fix:** Add `'stats' | 'attacks'` to union type, or verify
CharacterSheet manages tab state locally.

### ✅ 36. `importCharacterJson` does minimal validation

**File:** `services/character.repository.ts` **Description:** Only checks `name`
exists. Could import corrupted or incompatible character data. **Fix:** Add
schema validation for required fields (`classes`, `abilityScores`, `totalLevel`,
etc.).

### ✅ 37. `computeDerivedStats` repeated on every render for roster cards

**File:** `pages/HomePage.tsx` (L163) **Description:** No memoization. Typing in
search recalculates for all visible characters. **Fix:** Memoize with `useMemo`
keyed on character data, or pre-compute on initial load.

### ✅ 38. Spell labels always say "Prepared Spells" for known casters

**File:** `builder/steps/Step8_Review.tsx` (L302) **Description:** Warlocks,
Sorcerers, and Bards should see "Known Spells". **Fix:** Check
`spellcastingKnown.prepared` and label accordingly.

### ✅ 39. Save failure on character creation shows no user feedback

**File:** `builder/steps/Step8_Review.tsx` (L138) **Description:** `catch` only
does `console.error`; no UI error message. **Fix:** Add error state and display
an error banner/toast on failure.

### ✅ 40. `HIT_DICE` table in Step8_Review is hardcoded and incomplete

**File:** `builder/steps/Step8_Review.tsx` (L16) **Description:** Missing
classes default to d8 which could be wrong. Should read from class data.
**Fix:** Read `classData.die` from the loaded class data instead of a hardcoded
table.

### ✅ 41. EntityBrowser `onSelect` fires on collapse (not just select)

**File:** `builder/shared/EntityBrowser.tsx` (L72) **Description:** Clicking an
already-active card to collapse the detail panel re-fires `onSelect`. **Fix:**
Only call `onSelect` when the key changes (not when collapsing).

### ✅ 42. `getName` prop is dead code in EntityBrowser

**File:** `builder/shared/EntityBrowser.tsx` (L13) **Description:** Declared in
props, passed by all callers, but never used. **Fix:** Remove from interface and
all call sites.

### ✅ 43. `SkillPicker` doesn't exclude background skills for unrestricted classes

**File:** `builder/steps/Step4_AbilityScores.tsx` (L586) **Description:** When
class offers all skills, background skill exclusion filter is empty. **Fix:**
Always exclude background-granted skills regardless of class skill restrictions.

---

## LOW — Minor Issues, Edge Cases & Polish

### ✅ 44. `cantripDie` naming confusion

**File:** `services/character.calculator.ts` **Description:**
`cantripDieByLevel` returns die **size** (6/8/10/12) not die count. Name could
imply count. **Fix:** Rename to `cantripDieSizeByLevel` or add JSDoc
clarification.

### ✅ 45. 5 data types remain `unknown[]`

**File:** `services/data.service.ts` **Description:** `ammo`, `tools`,
`psionics`, `companions`, `creatures` lack TypeScript interfaces. **Fix:** Add
proper interfaces to `types/data.ts` from `_manifest.json` field reference.

### ✅ 46. `parseBackgroundAsi` fallback always returns +2/+1 and +1/+1/+1

**File:** `services/skill.parser.ts` **Description:** When no pattern matches,
returns default options that may not match actual background. **Fix:** Return
empty array or a more context-aware default.

### ✅ 47. `resolveUsages` returns null for string-based usages

**File:** `services/feature.processor.ts` **Description:** Features with "Wisdom
modifier" usages resolve to `null`, hiding resource tracker dots. **Fix:**
Evaluate ability-modifier-based strings using the character's ability scores.

### ✅ 48. No race condition guard in async data loads

**Files:** Multiple builder steps, `pages/SheetPage.tsx` **Description:** No
cleanup function on `useEffect` async fetches. **Fix:** Add
`let cancelled = false;` cleanup pattern or `AbortController`.

### ✅ 49. `Button` component missing `forwardRef`

**File:** `components/ui/Button.tsx` **Description:** Consumers can't attach
refs for focus management. **Fix:** Wrap component in `React.forwardRef`.

### ✅ 50. Spinner SVG inconsistent between Button and Spinner components

**Files:** `components/ui/Button.tsx`, `components/ui/Spinner.tsx`
**Description:** Different SVG paths for the same loading indicator. **Fix:**
Use `<Spinner size="sm" />` inside Button, or unify SVG paths.

### ✅ 51. Default Vite favicon instead of D&D icon

**File:** `index.html` **Description:** Shows Vite logo, not D&D themed.
**Fix:** Replace with a D&D-themed SVG icon.

### ✅ 52. No `<meta name="theme-color">` for mobile browsers

**File:** `index.html` **Description:** Mobile browser address bar doesn't match
app theme. **Fix:** Add `<meta name="theme-color" content="#2A1F14">`.

### ✅ 53. `prof-dot` relies on color alone for proficiency states

**File:** `styles/globals.css` (L72) **Description:** Color-blind users can't
distinguish proficiency/expertise/none. **Fix:** Add shape or pattern
differentiator (filled circle, double circle, empty circle).

### ✅ 54. Attunement tracking by item name (not unique ID)

**File:** `sheet/panels/EquipmentPanel.tsx` (L104) **Description:** Two
identical items can't be attuned independently. **Fix:** Use a unique identifier
(equipment array index or generated ID) instead of name.

### ✅ 55. Magic item `attunement` requirement flag lost on add

**File:** `sheet/panels/EquipmentPanel.tsx` (L99) **Description:** Attunement
toggle shows for ALL items, not just those requiring it. **Fix:** Preserve the
`attunement` field from `DndMagicItem` data when creating the equipment entry.

### ✅ 56. Wild Shape uses hardcoded as 2/short rest

**File:** `sheet/panels/FeaturesPanel.tsx` (L190) **Description:** Wrong for
Circle of the Moon Druid at level 20 (unlimited). **Fix:** Read usage count from
feature data rather than hardcoding.

### ✅ 57. Warlock Pact Magic not differentiated visually in SpellsPanel

**File:** `sheet/panels/SpellsPanel.tsx` **Description:** No visual indicator
for pact slots (short-rest recovery). **Fix:** Add a visual badge or label
distinguishing pact slots from standard slots.

### ✅ 58. Concentration tracking uses spell name instead of key

**File:** `sheet/panels/SpellsPanel.tsx` (L61) **Description:** Breaks if two
spells have the same display name. **Fix:** Use `spell._key` for comparison and
store key in `concentratingOn`.

### ✅ 59. No error handling on HomePage initial data fetch

**File:** `pages/HomePage.tsx` (L27) **Description:** If any fetch rejects,
loading spinner persists forever. **Fix:** Add `.catch()` handler that sets an
error state and displays a message.

### ✅ 60. `handleDuplicate` shallow-copies nested objects

**File:** `pages/HomePage.tsx` (L54) **Description:** Shared references between
original and copy for `classes[]`, `equipment[]`. **Fix:** Use
`structuredClone(char)` or `JSON.parse(JSON.stringify(char))`.

### ✅ 61. `package-lock.json` may be missing

**File:** `app/` **Description:** Not visible in workspace listing. Builds would
be non-deterministic. **Fix:** Verify existence; run `npm install` if missing.

### ✅ 62. Source filter pills non-functional

**File:** `builder/shared/FilterBar.tsx` (L42) **Description:** Buttons render
but have no `onClick` handler. **Fix:** Wire up to
`useUiStore.activeSourceFilters` toggle action.

### ✅ 63. SubclassPicker loads all 313 subclasses instead of using targeted API

**File:** `builder/steps/Step2_Class.tsx` (L174) **Description:**
`DataService.getSubclassesForClass(classKey)` exists but isn't used. **Fix:**
Replace `getSubclasses().then(filter)` with `getSubclassesForClass(classKey)`.

### ✅ 64. `rollHitDie` display shows 0 HP for negative CON modifier

**File:** `sheet/LevelUpWizard.tsx` (L244) **Description:** Shows raw rolled
value including negative CON mod. Commit clamps to 1, but display shows 0.
**Fix:** Clamp display value to `Math.max(1, roll + conMod)`.

### ✅ 65. `Ranger_2014` class key mismatch in LevelUpWizard

**File:** `sheet/LevelUpWizard.tsx` (L199) **Description:** Checks `ranger_2014`
but actual data key is `'ranger'`. Favored enemy/terrain is dead code. **Fix:**
Change check to `'ranger'` or match actual data key.

### ✅ 66. `hitDiceUsed` typed as `Record<string, number>` but used as `number[]`

**File:** `sheet/CharacterSheet.tsx` (L237) **Description:** Type mismatch
between Character definition and runtime usage. **Fix:** Align usage with the
type definition, or change the type to `number[]`.

### ✅ 67. `calcDamage` drops ability modifier for formulas with trailing `+N`

**File:** `sheet/panels/AttacksPanel.tsx` (L73) **Description:** If user enters
`1d8+0`, the ability mod and dueling bonus are lost. **Fix:** Always add ability
mod and dueling; don't skip based on regex presence of `+N`.

### ✅ 68. No `aria-current="page"` on active navigation link

**File:** `components/layout/Header.tsx` **Description:** Screen readers don't
know which link is current. **Fix:** Add `aria-current="page"` when `active` is
true on `NavLink`.

### ✅ 69. HomePage search input has no label or aria-label

**File:** `pages/HomePage.tsx` (L142) **Description:** Screen readers can't
identify the input's purpose. **Fix:** Add `aria-label="Search characters"` to
the input.

### ✅ 70. HomePage character cards not keyboard-accessible

**File:** `pages/HomePage.tsx` **Description:** Cards use `div onClick` with no
`tabIndex` or keyboard handler. **Fix:** Add `tabIndex={0}`, `role="button"`,
and `onKeyDown` for Enter/Space.

### ✅ 71. No body scroll lock when Modal is open

**File:** `components/ui/Modal.tsx` **Description:** Background content scrolls
behind the modal overlay. **Fix:** Set `document.body.style.overflow = 'hidden'`
when open, restore on close.

### ✅ 72. Redundant Google Fonts `@import` in CSS

**File:** `styles/globals.css` (L1) **Description:** Fonts already loaded via
`<link>` in `index.html`. The CSS `@import` is render-blocking and duplicate.
**Fix:** Remove the `@import url(...)` line from globals.css.

### ✅ 73. `BrowserRouter` needs server rewrite rules for production deploy

**File:** `App.tsx` **Description:** Direct navigation to `/builder` or
`/sheet/:id` returns 404 on static hosts. **Fix:** Add `_redirects` or
`404.html` fallback for static deployment.

### ✅ 74. CharacterSheet 12+ `useState` hooks with no `React.memo` on children

**File:** `sheet/CharacterSheet.tsx` **Description:** Any state change
re-renders the entire component tree. **Fix:** Wrap panel components in
`React.memo` with proper equality checks.

### ✅ 75. Step7 `randomFrom` assumes ideal entries are tuples

**File:** `builder/steps/Step7_Details.tsx` (L135) **Description:**
`bg.ideal?.map(([,t]) => t)` fails at runtime if `bg.ideal` is `string[]`.
**Fix:** Add type guard to handle both `string[]` and `[any, string][]` formats.

### ✅ 76. Missing `skin` detail input in Step7

**File:** `builder/steps/Step7_Details.tsx` **Description:** `CharacterDetails`
has `skin` property but builder provides no field for it. **Fix:** Add a `skin`
input field alongside the existing appearance fields.

---

## Progress Summary

| Severity  | Total  | Fixed  | Remaining |
| --------- | ------ | ------ | --------- |
| CRITICAL  | 8      | 8      | 0         |
| HIGH      | 11     | 11     | 0         |
| MEDIUM    | 24     | 24     | 0         |
| LOW       | 33     | 33     | 0         |
| **Total** | **76** | **76** | **0**     |
