# JSON Data Audit Report

**Generated:** <!-- Auto-generated -->\
**Total JSON Files:** 21\
**Total Entries:** 3,759+

---

## Executive Summary

| File                     | Entries | Issues | Status             |
| ------------------------ | ------- | ------ | ------------------ |
| classes.json             | 22      | 15     | ⚠️ Has issues      |
| subclasses.json          | 313     | 1      | ⚠️ Minor issue     |
| races.json               | 226     | 1      | ⚠️ Minor issue     |
| race_variants.json       | 127     | 0      | ✅ Clean           |
| backgrounds.json         | 132     | 2      | ⚠️ Has issues      |
| background_features.json | 164     | 0      | ✅ Clean           |
| background_variants.json | 45      | 0      | ✅ Clean           |
| spells.json              | 1000    | 3      | ⚠️ Minor issues    |
| feats.json               | 307     | 2      | ⚠️ Minor issues    |
| weapons.json             | 106     | 84     | ⚠️ Type mismatches |
| armor.json               | 15      | 3      | ⚠️ Minor issues    |
| ammo.json                | 28      | 0      | ✅ Clean           |
| gear.json                | 144     | 0      | ✅ Clean           |
| packs.json               | 8       | 0      | ✅ Clean           |
| tools.json               | 44      | 0      | ✅ Clean           |
| magic_items.json         | 887     | 21     | ⚠️ Has issues      |
| warlock_invocations.json | 61      | 0      | ✅ Clean           |
| companions.json          | 11      | 0      | ✅ Clean           |
| creatures.json           | 359     | 0      | ✅ Clean           |
| psionics.json            | 231     | 0      | ✅ Clean           |
| sources.json             | 138     | 0      | ✅ Clean           |

**TOTAL ISSUES: 132** (mostly non-blocking)

---

## Dynamic Capability Summary

The JSON data contains rich dynamic data for PDF-like behavior:

| Feature Type         | Count | Usage                               |
| -------------------- | ----- | ----------------------------------- |
| calcChanges hooks    | 283   | Modify attack/spell/HP calculations |
| prereqeval functions | 383   | Prerequisite validation             |
| Limited-use features | 577   | usages + recovery tracking          |
| Action economy       | 744   | Action/bonus action/reaction costs  |
| Level-scaling text   | 283   | `additional` field variations       |
| spellcastingBonus    | 448   | Extra spells from features          |

### calcChanges Hook Types Found:

- `atkCalc` - Attack roll and damage calculations
- `atkAdd` - Add text/properties to attacks
- `spellList` - Modify available spell lists
- `spellAdd` - Add spells automatically
- `spellCalc` - Modify spell DCs/attacks
- `hp` - Modify hit point calculations

---

## Detailed Issues by File

### 1. classes.json (15 issues)

**Sidekick Classes (Expected - Incomplete Data):**

```
❌ sidekick-expert-tcoe: MISSING 'die', 'saves', attacks[20]
❌ sidekick-spellcaster-tcoe: MISSING 'die', 'saves', attacks[20], spellcastingAbility
❌ sidekick-warrior-tcoe: MISSING 'die', 'saves'
```

**Prestige Classes (Expected - Unique Structure):**

```
❌ rune scribe: MISSING 'saves'
```

**Recommendation:** These are intentionally different class types. App should
handle with null-safety rather than fixing data.

---

### 2. subclasses.json (1 issue)

```
❌ cleric-peace domain.features['subclassfeature1.1']: MISSING minlevel
```

**Fix Required:** Add `minlevel: 1` to this feature.

---

### 3. races.json (1 issue)

```
❌ human (L): scores has 7 entries (expected 6)
```

**Analysis:** This is the variant human with flexible ASI. The 7th entry may be
for player choice.

**Recommendation:** App should handle variable-length scores arrays.

---

### 4. backgrounds.json (2 issues)

```
❌ haunted one: skills missing or not an array
❌ investigator-vrgtr: skills missing or not an array
```

**Fix Required:** Add empty `skills: []` array or proper skill list. Already
handled with null-safety in Step3_Background.tsx.

---

### 5. spells.json (3 issues)

```
❌ gravity fissure: MISSING 'classes'
❌ lightning spheres: MISSING 'classes'
❌ shooting stars: MISSING 'classes'
```

**Fix Required:** Add `classes: []` array to these spells for proper filtering.

---

### 6. feats.json (2 issues)

```
❌ blessing: MISSING description
❌ epic boon: MISSING description
```

**Analysis:** These appear to be container/category entries, not actual feats.

**Recommendation:** Filter these out in the app or add placeholder descriptions.

---

### 7. weapons.json (84 issues)

**Type Mismatches (Adventuring Gear in Weapons):**

```
❌ net, alchemist fire, vials of acid, holy water: type='Adventuring Gear', list='gear'
```

**Analysis:** These items are technically weapons but categorized as gear in the
source. Valid entries but type/list don't match expected weapon enums.

**Recommendation:**

1. Add 'Adventuring Gear' to valid weapon types OR
2. Move these to gear.json and reference them differently

---

### 8. armor.json (3 issues)

```
❌ unarmored: MISSING 'type'
❌ mage armor: MISSING 'type'  
❌ inertial armor-ua-psy: MISSING 'type'
```

**Analysis:** These aren't physical armor - they're calculation bases for
unarmored defense.

**Recommendation:** Add `type: 'none'` or handle as special cases.

---

### 9. magic_items.json (21 issues)

**Unknown Rarity (7 items):**

```
❌ green copper ewer, statuette of saint markovia, ring of hardened magma, 
   ancient relic boulder, survival mantle: rarity='unknown'
```

**Missing Type (8 items):**

```
❌ ingot of the skold rune, opal of the ild rune, orb of the stein rune,
   pennant of the vind rune, shield of the uven rune: MISSING 'type'
```

**Recommendation:** Add placeholder values or filter when displaying.

---

## Required Fixes (Priority Order)

### Critical (Causes Crashes):

1. ✅ Already fixed: backgrounds.json skills null-safety

### High (Affects Calculations):

2. `subclasses.json`: Add `minlevel: 1` to cleric-peace domain feature
3. `spells.json`: Add `classes: []` to 3 spells

### Medium (Data Completeness):

4. `armor.json`: Add `type: 'none'` to unarmored entries
5. `magic_items.json`: Add default rarity/type where missing

### Low (Cosmetic):

6. `feats.json`: Add descriptions to container feats
7. `weapons.json`: Consider reorganizing gear-weapons

---

## App Implementation Requirements

Based on the dynamic data available, the app needs to implement:

### 1. Feature Processor (Like PDF's ApplyFeatureAttributes)

```typescript
interface FeatureProcessor {
  // Process features at level-up
  processFeature(feature: ClassFeature, level: number): void;

  // Handle calcChanges hooks
  applyCalcChanges(changes: CalcChanges): void;

  // Track limited-use resources
  trackUsages(usages: number | object, recovery: string): void;
}
```

### 2. Prerequisite Evaluator

```typescript
interface PrereqEvaluator {
  // Evaluate prereqeval functions
  canSelect(item: any, character: Character): boolean;

  // Check class/level/ability requirements
  meetsRequirements(prereqs: any): boolean;
}
```

### 3. Calculation Change System

```typescript
interface CalcChanges {
  atkCalc?: SerializedFunction; // Modify attack rolls
  atkAdd?: SerializedFunction; // Add attack properties
  spellList?: SerializedFunction; // Modify spell lists
  spellAdd?: SerializedFunction; // Add bonus spells
  spellCalc?: SerializedFunction; // Modify spell DCs
  hp?: SerializedFunction; // Modify HP
}
```

### 4. Resource Tracking

```typescript
interface ResourceTracker {
  // Track uses per rest type
  uses: Map<string, { current: number; max: number; recovery: string }>;

  // Reset on rest
  shortRest(): void;
  longRest(): void;
}
```

---

## Appendix: Field Presence by File

### classes.json Required Fields

- [x] `_key` - Unique identifier
- [x] `name` - Display name
- [x] `source` - Source book
- [x] `die` - Hit die (missing for sidekicks)
- [x] `saves` - Proficient saves (missing for some)
- [x] `improvements` - ASI levels [20]
- [x] `features` - Class features map
- [x] `subclasses` - Subclass list

### races.json Required Fields

- [x] `_key` - Unique identifier
- [x] `name` - Display name
- [x] `source` - Source book
- [x] `size` - Size category (1-5)
- [x] `speed` - Movement speeds object

### spells.json Required Fields

- [x] `_key` - Unique identifier
- [x] `name` - Display name
- [x] `level` - Spell level (0-9)
- [x] `school` - Magic school
- [x] `time` - Casting time
- [x] `range` - Range
- [x] `components` - V/S/M components
- [x] `duration` - Duration
- [x] `description` - Spell text
- [x] `classes` - Available to classes (missing for 3)

---

## Conclusion

The JSON data is **96.5% valid** for the app's current needs. The 132 issues
identified are mostly:

1. **Intentional variations** (sidekick classes, prestige classes)
2. **Edge case data** (unarmored "armor", gear-weapons)
3. **Missing optional fields** (can be handled with null-safety)

The data contains **rich dynamic capability** with:

- 283 calculation hooks
- 383 prerequisite functions
- 577 limited-use features
- 744 action economy entries

This provides everything needed to implement PDF-like dynamic behavior in the
app.
