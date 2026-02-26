# D&D Character Creator - Data Flow Map & Field Verification

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             DATA PIPELINE                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐                                                            │
│  │  MPMB JS Files   │  Player_Handbook.js, All_WizOfTheCoast+UnearthedArc.js    │
│  │  (Source Data)   │  Xans_Guide_To_Everything.js, etc.                         │
│  └────────┬─────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌──────────────────┐  VM sandbox execution with MPMB API stubs                 │
│  │   convert.js     │  Populates: ClassList, SpellsList, RaceList, etc.         │
│  │  (Transformer)   │  Serializes: RegExp → {_type,source,flags}                │
│  └────────┬─────────┘  Functions → {_type:"function",body}                      │
│           │                                                                      │
│           ▼                                                                      │
│  ┌──────────────────┐                                                            │
│  │   json_data/     │  21 JSON files: classes, races, backgrounds, spells,      │
│  │  (JSON Output)   │  subclasses, feats, weapons, armor, magic_items, etc.     │
│  └────────┬─────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌──────────────────┐  Async fetch with caching                                  │
│  │ data.service.ts  │  Type-safe accessors: getClasses(), getRaces(), etc.      │
│  │  (Data Layer)    │  Helper methods: getSpellsForClass(), isSpellcaster()     │
│  └────────┬─────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌──────────────────┐  Step1_Race, Step2_Class, Step3_Background, etc.          │
│  │  UI Components   │  CharacterSheet, LevelUpWizard, SpellsPanel               │
│  │   (React TSX)    │  character.calculator.ts (derived stats)                  │
│  └──────────────────┘                                                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ JSON Files & Field Mappings

### 1. **classes.json** (22 entries)

| JSON Field            | TypeScript Type                | UI Usage                           | Status  |
| --------------------- | ------------------------------ | ---------------------------------- | ------- |
| `_key`                | `string`                       | Entity lookup key                  | ✅ Used |
| `name`                | `string`                       | Display name                       | ✅ Used |
| `source`              | `[string, number][]`           | Source citation                    | ✅ Used |
| `primaryAbility`      | `string[]`                     | Primary stat display               | ✅ Used |
| `abilitySave`         | `number`                       | Spellcasting save ability index    | ✅ Used |
| `prereqs`             | `string`                       | Multiclass prerequisite text       | ✅ Used |
| `improvements`        | `number[]`                     | ASI levels (cumulative count)      | ✅ Used |
| `die`                 | `number`                       | Hit die size (d6/d8/d10/d12)       | ✅ Used |
| `saves`               | `string[]`                     | Saving throw proficiencies         | ✅ Used |
| `skillstxt`           | `{primary, secondary}`         | Skill choice text                  | ✅ Used |
| `armorProfs`          | `{primary: boolean[]}`         | [light, medium, heavy, shields]    | ✅ Used |
| `weaponProfs`         | `{primary: boolean[]}`         | [simple, martial]                  | ✅ Used |
| `toolProfs`           | `{primary: array}`             | Tool proficiency choices           | ✅ Used |
| `equipment`           | `string`                       | Starting equipment text            | ✅ Used |
| `subclasses`          | `[label, keys[]]`              | Subclass type name + key list      | ✅ Used |
| `attacks`             | `number[]`                     | Attacks per action by level        | ✅ Used |
| `features`            | `Record<string, Feature>`      | Class features by key              | ✅ Used |
| `spellcastingAbility` | `number`                       | Ability index for spellcasting     | ✅ Used |
| `spellcastingFactor`  | `number`                       | Multiclass caster level multiplier | ✅ Used |
| `spellcastingKnown`   | `{cantrips, spells, prepared}` | Known/prepared spell counts        | ✅ Used |

### 2. **races.json** (226 entries)

| JSON Field            | TypeScript Type                | UI Usage                            | Status                             |
| --------------------- | ------------------------------ | ----------------------------------- | ---------------------------------- |
| `_key`                | `string`                       | Entity lookup key                   | ✅ Used                            |
| `name`                | `string`                       | Display name                        | ✅ Used                            |
| `source`              | `[string, number][]`           | Source citation                     | ✅ Used                            |
| `size`                | `number \| number[]`           | Size code (3=Medium, 4=Small)       | ✅ Used                            |
| `speed`               | `{walk:{spd,enc}}`             | Movement speeds                     | ✅ Used                            |
| `scores`              | `number[]`                     | Fixed ASI [Str,Dex,Con,Int,Wis,Cha] | ✅ Used                            |
| `scoresGeneric`       | `boolean`                      | True = player assigns +2/+1         | ✅ Used                            |
| `vision`              | `[string, number][]`           | Darkvision, etc.                    | ✅ Used                            |
| `languageProfs`       | `(string\|number)[]`           | Languages known                     | ✅ Used                            |
| `skills`              | `string[]`                     | Skill proficiencies                 | ✅ Used                            |
| `skillstxt`           | `string`                       | Skill choice description            | ✅ Used                            |
| `trait`               | `string`                       | Full trait description text         | ✅ Used                            |
| `age`                 | `string`                       | Age description                     | ✅ Used                            |
| `height`              | `string`                       | Height description                  | ✅ Used                            |
| `features`            | `Record<string, Feature>`      | Racial features                     | ✅ Used                            |
| `dmgres`              | `(string\|[string,string])[]`  | Damage resistances                  | ✅ Used                            |
| `savetxt`             | `{text, adv_vs}`               | Saving throw advantages             | ✅ Used                            |
| `toolProfs`           | `(string\|[string,number])[]`  | Tool proficiencies                  | ✅ Used                            |
| `weaponProfs`         | `[simple,martial,specific[]]`  | Weapon proficiencies                | ✅ Used                            |
| `armorProfs`          | `[light,medium,heavy,shields]` | Armor proficiencies                 | ✅ Used                            |
| `spellcastingAbility` | `number`                       | Racial spellcasting ability         | ✅ Used                            |
| `spellcastingBonus`   | `object[]`                     | Racial spells                       | ⚠️ Data exists, not fully rendered |
| `weaponOptions`       | `object[]`                     | Natural weapons (breath, etc.)      | ⚠️ Not displayed in builder        |

### 3. **backgrounds.json** (132 entries, 2 missing `skills`)

| JSON Field      | TypeScript Type               | UI Usage                      | Status               |
| --------------- | ----------------------------- | ----------------------------- | -------------------- |
| `_key`          | `string`                      | Entity lookup key             | ✅ Used              |
| `name`          | `string`                      | Display name                  | ✅ Used              |
| `source`        | `[string, number][]`          | Source citation               | ✅ Used              |
| `scorestxt`     | `string[]`                    | ASI description text          | ✅ Used              |
| `skills`        | `string[]`                    | Skill proficiencies           | ✅ Fixed (null-safe) |
| `toolProfs`     | `(string\|[string,number])[]` | Tool proficiencies            | ✅ Used              |
| `languageProfs` | `(string\|number)[]`          | Language proficiencies        | ✅ Used              |
| `gold`          | `number`                      | Starting gold                 | ✅ Used              |
| `equipleft`     | `[name, qty, weight][]`       | Equipment list (left column)  | ✅ Used              |
| `equipright`    | `[name, qty, weight][]`       | Equipment list (right column) | ✅ Used              |
| `feature`       | `string`                      | Background feature name       | ✅ Used              |
| `trait`         | `string[]`                    | d8 personality traits         | ✅ Used              |
| `ideal`         | `[alignment, text][]`         | d6 ideals                     | ✅ Used              |
| `bond`          | `string[]`                    | d6 bonds                      | ✅ Used              |
| `flaw`          | `string[]`                    | d6 flaws                      | ✅ Used              |
| `_variants`     | `string[]`                    | Background variant keys       | ✅ Used              |

### 4. **subclasses.json** (313 entries)

| JSON Field          | TypeScript Type           | UI Usage                      | Status                        |
| ------------------- | ------------------------- | ----------------------------- | ----------------------------- |
| `_key`              | `string`                  | "classKey-subclassKey" format | ✅ Used                       |
| `_parentClass`      | `string`                  | Parent class key              | ✅ Used                       |
| `_subKey`           | `string`                  | Subclass key segment          | ✅ Used                       |
| `subname`           | `string`                  | Display name (NOT `name`!)    | ✅ Used                       |
| `fullname`          | `string`                  | "ClassName (SubclassName)"    | ✅ Used                       |
| `source`            | `[string, number][]`      | Source citation               | ✅ Used                       |
| `features`          | `Record<string, Feature>` | Subclass features             | ✅ Used                       |
| `spellcastingExtra` | `string[]`                | Bonus spells granted          | ⚠️ Data exists, not displayed |
| `abilitySave`       | `number`                  | Subclass save ability         | ✅ Used                       |

### 5. **spells.json** (1000 entries)

| JSON Field              | TypeScript Type      | UI Usage                | Status  |
| ----------------------- | -------------------- | ----------------------- | ------- |
| `_key`                  | `string`             | Spell lookup key        | ✅ Used |
| `name`                  | `string`             | Display name            | ✅ Used |
| `classes`               | `string[]`           | Classes with access     | ✅ Used |
| `source`                | `[string, number][]` | Source citation         | ✅ Used |
| `level`                 | `number`             | Spell level (0=cantrip) | ✅ Used |
| `school`                | `string`             | School abbreviation     | ✅ Used |
| `time`                  | `string`             | Casting time            | ✅ Used |
| `range`                 | `string`             | Range                   | ✅ Used |
| `components`            | `string`             | "V,S,M"                 | ✅ Used |
| `compMaterial`          | `string`             | Material component text | ✅ Used |
| `duration`              | `string`             | Duration                | ✅ Used |
| `save`                  | `string`             | Saving throw type       | ✅ Used |
| `ritual`                | `boolean`            | Ritual castable         | ✅ Used |
| `description`           | `string`             | Short description       | ✅ Used |
| `descriptionFull`       | `string`             | Full spell text         | ✅ Used |
| `descriptionCantripDie` | `string`             | Scaled cantrip text     | ✅ Used |

### 6. **weapons.json** (106 entries)

| JSON Field        | TypeScript Type            | UI Usage                      | Status  |
| ----------------- | -------------------------- | ----------------------------- | ------- |
| `_key`            | `string`                   | Weapon lookup key             | ✅ Used |
| `name`            | `string`                   | Display name                  | ✅ Used |
| `source`          | `[string, number][]`       | Source citation               | ✅ Used |
| `type`            | `'Simple'\|'Martial'\|...` | Weapon category               | ✅ Used |
| `list`            | `'melee'\|'ranged'`        | Attack type                   | ✅ Used |
| `ability`         | `number`                   | Attack ability (1=Str, 2=Dex) | ✅ Used |
| `abilitytodamage` | `boolean`                  | Add ability to damage         | ✅ Used |
| `damage`          | `[dice, size, type]`       | Damage info                   | ✅ Used |
| `range`           | `string`                   | Range string                  | ✅ Used |
| `description`     | `string`                   | Properties text               | ✅ Used |
| `weight`          | `number`                   | Weight in lb                  | ✅ Used |
| `monkweapon`      | `boolean`                  | Qualifies as monk weapon      | ✅ Used |

### 7. **feats.json** (307 entries)

| JSON Field        | TypeScript Type      | UI Usage              | Status  |
| ----------------- | -------------------- | --------------------- | ------- |
| `_key`            | `string`             | Feat lookup key       | ✅ Used |
| `name`            | `string`             | Display name          | ✅ Used |
| `source`          | `[string, number][]` | Source citation       | ✅ Used |
| `type`            | `string`             | Feat category         | ✅ Used |
| `prerequisite`    | `string`             | Prerequisite text     | ✅ Used |
| `description`     | `string`             | Short description     | ✅ Used |
| `descriptionFull` | `string`             | Full feat text        | ✅ Used |
| `scores`          | `number[]`           | ASI bonuses           | ✅ Used |
| `skills`          | `string[]`           | Skill proficiencies   | ✅ Used |
| `choices`         | `string[]`           | Sub-choices available | ✅ Used |

### 8. **warlock_invocations.json** (61 entries)

| JSON Field     | TypeScript Type      | UI Usage                           | Status  |
| -------------- | -------------------- | ---------------------------------- | ------- |
| `_key`         | `string`             | Invocation lookup key              | ✅ Used |
| `name`         | `string`             | Internal name                      | ✅ Used |
| `_displayName` | `string`             | Display name                       | ✅ Used |
| `description`  | `string`             | Invocation text                    | ✅ Used |
| `source`       | `[string, number][]` | Source citation                    | ✅ Used |
| `submenu`      | `string`             | Prerequisites (e.g. "[warlock 5]") | ✅ Used |

---

## 🔌 Component → Data Field Mapping

### Step1_Race.tsx

```
DataService.getRaces() → races.json
DataService.getRaceVariants() → race_variants.json

Fields Used:
- race._key            → selection key
- race.name            → display
- race.source          → formatSource()
- race.size            → SIZE_LABELS mapping
- race.speed.walk.spd  → speed badge
- race.vision          → vision badge
- race.scores          → ASI display
- race.scoresGeneric   → enables GenericAsiPicker
- race.trait           → trait text display
- race.languageProfs   → language display
- race.dmgres          → resistance display
- race.savetxt.adv_vs  → saving throw advantages
- race.toolProfs       → tool proficiency display
- race.weaponProfs     → weapon proficiency display
- race.armorProfs      → armor proficiency display
- race.age             → age description
- race.height          → height description
```

### Step2_Class.tsx

```
DataService.getClasses() → classes.json
DataService.getSubclasses() → subclasses.json

Fields Used:
- cls._key             → selection key
- cls.name             → display
- cls.source           → formatSource()
- cls.die              → hit die badge
- cls.primaryAbility   → primary stat
- cls.saves            → saving throw proficiencies
- cls.armorProfs       → armor proficiency badges
- cls.skillstxt        → skill choice text
- cls.toolProfs        → tool proficiency display
- cls.features         → level 1 features
- cls.subclasses       → subclass type label
- cls.improvements     → ASI level detection

- sub._key             → selection key
- sub.subname          → display name (NOT name!)
- sub.source           → formatSource()
```

### Step3_Background.tsx

```
DataService.getBackgrounds() → backgrounds.json
DataService.getBackgroundVariants() → background_variants.json

Fields Used:
- bg._key              → selection key
- bg.name              → display
- bg.source            → formatSource()
- bg.skills            → skill proficiency badges (NULL-SAFE!)
- bg.scorestxt         → ASI choice text
- bg.feature           → background feature name
- bg.trait             → personality traits (rollable)
- bg.ideal             → ideals (rollable)
- bg.bond              → bonds (rollable)
- bg.flaw              → flaws (rollable)
- bg.toolProfs         → tool proficiency display
- bg.languageProfs     → language proficiency display
- bg.equipleft         → equipment list
- bg.equipright        → equipment list
- bg.gold              → starting gold
```

### Step6_Spells.tsx

```
DataService.getSpellsForClass(classKey) → spells.json (filtered)
DataService.getWarlockInvocations() → warlock_invocations.json

Fields Used:
- spell._key           → selection key
- spell.name           → display
- spell.level          → level filtering
- spell.school         → school badge
- spell.classes        → class filtering
- spell.time           → casting time
- spell.range          → range
- spell.duration       → duration
- spell.components     → component string
- spell.description    → short description
- spell.ritual         → ritual tag

- cls.spellcastingKnown.cantrips → max cantrip count
- cls.spellcastingKnown.spells   → max spell count
- cls.spellcastingKnown.prepared → known vs prepared

- inv._key             → selection key
- inv._displayName     → display name
- inv.description      → invocation text
- inv.submenu          → level requirement parsing
```

### character.calculator.ts

```
Fields Used:
- char.classes[].classKey     → multiclass handling
- char.classes[].level        → level-based calculations
- char.classes[].hpPerLevel   → HP calculation
- char.abilityScores          → modifier calculations
- char.skills                 → proficiency checks
- char.expertise              → double proficiency
- char.conditions             → status effects
- char.exhaustion             → exhaustion penalties
- char.raceSpeed              → base speed
- char.equippedArmorKey       → AC calculation
- char.hasShield              → AC calculation

Derived:
- proficiencyBonus   → Math.ceil(totalLevel / 4) + 1
- abilityModifiers   → Math.floor((score - 10) / 2)
- savingThrows       → mod + (proficient ? pb : 0)
- skillBonuses       → mod + (prof ? pb : 0) + (expert ? pb : 0)
- spellSlots         → MULTICLASS_SLOTS table + WARLOCK_PACT
- ac                 → armor + dex (capped) + shield + unarmored
- speed              → base - exhaustion/condition penalties
- attacksPerAction   → cls.attacks[level] array
```

---

## ⚠️ Known Data Issues

### Backgrounds Missing `skills` Array

These backgrounds crash without null-safety:

1. `haunted one` - No skills defined
2. `investigator-vrgtr` - No skills defined

**Fix Applied**: `(bg.skills ?? []).map(...)` in Step3_Background.tsx

### Subclasses Use `subname` Not `name`

The `name` field is NOT used for subclasses. The correct display field is
`subname`.

---

## ✅ Verification Summary

| Entity Type         | JSON→TS Types | TS→UI Wiring | Null Safety |
| ------------------- | ------------- | ------------ | ----------- |
| Classes             | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Subclasses          | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Races               | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Race Variants       | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Backgrounds         | ✅ Complete   | ✅ Complete  | ✅ Fixed    |
| Spells              | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Feats               | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Weapons             | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Armor               | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Warlock Invocations | ✅ Complete   | ✅ Complete  | ✅ Safe     |
| Magic Items         | ✅ Complete   | ⚠️ Partial   | ✅ Safe     |

---

## 📝 Recommendations

### High Priority

1. ✅ **DONE** - Add null safety for `bg.skills` in Step3_Background.tsx

### Medium Priority

2. Display `spellcastingBonus` racial spells in Step1_Race.tsx
3. Display `spellcastingExtra` subclass spells in Step2_Class.tsx
4. Display racial `weaponOptions` (breath weapons, natural attacks)

### Low Priority

5. Add magic item browser to equipment step
6. Parse `toNotesPage` for background/feat notes display
7. Display `extraLimitedFeatures` for racial abilities

---

_Generated: Data Flow Analysis for DnDCharacterCreator_ _Last Updated:
2026-02-26_
