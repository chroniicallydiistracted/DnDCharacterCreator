# MPMB PDF Function Pipeline Analysis

## Overview

This document maps all 597 functions from the MPMB PDF JavaScript codebase
(v13.2.3+241220), showing how they connect and flow through the application. The
functions are organized into pipelines showing the complete call chains.

## File Structure Summary

| File                  | Lines      | Purpose                                         |
| --------------------- | ---------- | ----------------------------------------------- |
| Functions0.js         | 1,329      | Basic utilities (Hide, Show, Value, What, etc.) |
| Functions1.js         | 10,095     | UI functions, ResetAll, MakeButtons, layers     |
| Functions2.js         | 8,650      | Creature/race/companion functions               |
| Functions3.js         | 3,946      | Feature attribute processing                    |
| FunctionsSpells.js    | 5,983      | Spell sheet generation and management           |
| FunctionsResources.js | 1,738      | Source/resource selection                       |
| FunctionsImport.js    | 3,340      | Import/export functionality                     |
| ClassSelection.js     | 1,498      | Class selection dialog                          |
| AbilityScores.js      | 1,319      | Ability score management                        |
| Lists.js              | 2,216      | Global variables. data structures               |
| **Total**             | **63,361** |                                                 |

---

## 1. STARTUP PIPELINE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT OPEN                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  InitializeEverything()                                              │
│  ├── calcStop()                                                      │
│  ├── GetStringifieds()           ← Load saved state from fields      │
│  ├── InitiateLists()             ← Create base data lists            │
│  │   └── Creates: BackgroundList, ClassList, ClassSubList,          │
│  │       CompanionList, CreatureList, FeatsList, MagicItemsList,    │
│  │       ArmourList, WeaponsList, AmmoList, PacksList, GearList,    │
│  │       ToolsList, RaceList, RaceSubList, SourceList, SpellsList   │
│  ├── RunUserScript(true)         ← Execute custom scripts            │
│  ├── spellsAfterUserScripts()    ← Process spell variables           │
│  │   ├── amendPsionicsToSpellsList()                                │
│  │   └── setSpellVariables()                                        │
│  ├── SetGearVariables()                                              │
│  ├── setListsUnitSystem()                                            │
│  ├── getDynamicFindVariables()   ← Parse all character data          │
│  │   ├── FindClasses()                                              │
│  │   ├── FindRace()                                                 │
│  │   ├── FindCompRace()                                             │
│  │   ├── FindWeapons()                                              │
│  │   ├── FindCompWeapons()                                          │
│  │   ├── FindArmor()                                                │
│  │   ├── FindBackground()                                           │
│  │   ├── FindFeats()                                                │
│  │   └── FindMagicItems()                                           │
│  ├── UpdateTooSkill()                                                │
│  ├── SetRichTextFields()                                             │
│  ├── MakeAdventureLeagueMenu()                                       │
│  ├── SetHighlighting()                                               │
│  ├── MakeButtons()               ← Create toolbar buttons            │
│  └── calcCont(true)              ← Resume calculations               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  OpeningStatement()              ← First-time user dialog (timeout)  │
│  ├── resourceDecisionDialog()                                        │
│  └── PatreonStatement()                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. CLASS SELECTION PIPELINE

```
┌─────────────────────────────────────────────────────────────────────┐
│  User clicks "Class" button or edits "Class and Levels" field        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │ SelectClass()        │    │ classesFieldVal()    │
        │ (dialog method)      │    │ (field event)        │
        └──────────────────────┘    └──────────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FindClasses()                                                       │
│  ├── ParseClass(input)          ← Returns [className, subclassName]  │
│  │   ├── Matches against ClassList keys                             │
│  │   ├── Matches against ClassList[].name                           │
│  │   ├── Matches against ClassList[].regExpSearch                   │
│  │   └── Matches against ClassSubList[].fullname                    │
│  └── Updates classes.known{} object                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ApplyClasses()                                                      │
│  ├── Compare classes.known with classes.old                          │
│  ├── For each class change:                                          │
│  │   ├── ApplyClassLevel(className, oldLvl, newLvl)                 │
│  │   │   ├── ApplyClassBaseAttributes()  ← First level only         │
│  │   │   │   ├── processArmourProfs()                               │
│  │   │   │   ├── processWeaponProfs()                               │
│  │   │   │   ├── processSaves()                                     │
│  │   │   │   ├── processSkills()                                    │
│  │   │   │   └── processTools()                                     │
│  │   │   └── UpdateLevelFeatures()       ← Level-dependent          │
│  │   │       └── ApplyFeatureAttributes()                           │
│  │   └── CreateCurrentSpellsEntry()      ← If spellcaster           │
│  ├── SetClassHD()                ← Set hit dice                      │
│  ├── calcHP()                    ← Recalculate HP                    │
│  └── CurrentUpdates.types.push("classes")                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  UpdateSheetDisplay() [triggered by CurrentUpdates]                  │
│  ├── UpdateDropdown("resources")                                     │
│  ├── ReCalcWeapons()                                                 │
│  └── SetStringifieds() ← Save state                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. RACE SELECTION PIPELINE

```
┌─────────────────────────────────────────────────────────────────────┐
│  User edits "Race" field                                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FindRace()                                                          │
│  ├── ParseRace(input)           ← Returns [raceName, variantName]    │
│  │   ├── Matches against RaceList keys                              │
│  │   ├── Matches against RaceList[].name                            │
│  │   ├── Matches against RaceList[].regExpSearch                    │
│  │   └── Matches against RaceSubList (variants)                     │
│  └── Sets CurrentRace object                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ApplyRace()                                                         │
│  ├── Clear previous race attributes                                  │
│  │   └── ApplyFeatureAttributes(race, [1,0,true])                   │
│  ├── Apply new race attributes                                       │
│  │   ├── processStats()         ← Racial ASI                        │
│  │   ├── processVision()                                            │
│  │   ├── processResistance()                                        │
│  │   ├── processLanguages()                                         │
│  │   ├── processSkills()                                            │
│  │   ├── processArmourProfs()                                       │
│  │   ├── processWeaponProfs()                                       │
│  │   └── processTools()                                             │
│  ├── For each race feature:                                          │
│  │   └── ApplyFeatureAttributes("race", [race, feature], ...)       │
│  └── CreateCurrentSpellsEntry()  ← If innate spellcasting           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. ABILITY SCORES PIPELINE

```
┌─────────────────────────────────────────────────────────────────────┐
│  User clicks "Scores" button or edits ability score field            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  AbilityScores_Button()                                              │
│  ├── initiateCurrentStats()     ← Initialize if needed               │
│  │   └── Creates CurrentStats{} structure:                          │
│  │       cols: [base, race, feats, classes, levels, magic,          │
│  │              items, override, maximum]                           │
│  │       txts: {classes, race, feats, items, magic, background}     │
│  │       overrides: [{},{},{},{},{},{},{}]                          │
│  │       maximums: [{},{},{},{},{},{},{}]                           │
│  ├── Build dialog from CurrentStats                                  │
│  └── On commit → SetStringifieds("stats")                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  processStats(addRemove, type, name, scores, text, special, max)     │
│  ├── type = "race" | "feats" | "classes" | "items" | "magic"        │
│  ├── special = "overrides" | "maximums" | false                      │
│  ├── Updates CurrentStats.cols[type].scores[]                        │
│  ├── Updates CurrentStats.txts[type][name]                           │
│  ├── If special: Updates CurrentStats[special]                       │
│  └── SetStringifieds("stats")                                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Field Calculations (on change)                                      │
│  ├── CalcMod(abilityScore)      ← floor((score - 10) / 2)           │
│  ├── CalcSave(ability)          ← mod + profBonus (if proficient)   │
│  ├── CalcSkill(skill)           ← mod + profBonus + bonuses         │
│  └── CalcAbilityDC()            ← 8 + profBonus + mod               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. SPELLCASTING PIPELINE

```
┌─────────────────────────────────────────────────────────────────────┐
│  User clicks "Spells" button                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MakeSpellMenu_SpellOptions()                                        │
│  ├── Create Spell Sheet                                              │
│  ├── Delete Spell Sheet                                              │
│  ├── Spell Points toggle                                             │
│  └── Spell Slot visibility                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
    ┌──────────────────────────┐  ┌──────────────────────────────────┐
    │ GenerateSpellSheet()     │  │ GenerateCompleteSpellSheet()     │
    │ (per class)              │  │ (all spells)                     │
    └──────────────────────────┘  └──────────────────────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Spell Processing Pipeline                                           │
│  ├── CreateSpellList(className)                                      │
│  │   ├── Get base class spell list                                  │
│  │   ├── Add spellcastingExtra spells                               │
│  │   └── Filter by source exclusions                                │
│  ├── For each spell:                                                 │
│  │   ├── ParseSpell(input)     ← Find spell in SpellsList           │
│  │   └── GetSpellObject(spell, caster)                              │
│  │       ├── Apply spellAttrOverride                                │
│  │       ├── Apply metric conversion                                │
│  │       ├── Apply cantrip die scaling                              │
│  │       ├── Apply spellcasting ability                             │
│  │       └── Execute CurrentEvals.spellAdd functions                │
│  └── OrderSpells(spellList)                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ApplySpell(spellName, fieldName)                                    │
│  ├── ReturnSpellFieldsArray()   ← Get all field names               │
│  ├── GetSpellObject()                                                │
│  ├── Set spell fields:                                               │
│  │   ├── spells.check (checkbox/firstCol)                           │
│  │   ├── spells.name                                                │
│  │   ├── spells.description                                         │
│  │   ├── spells.save                                                │
│  │   ├── spells.school                                              │
│  │   ├── spells.time                                                │
│  │   ├── spells.range                                               │
│  │   ├── spells.components                                          │
│  │   ├── spells.duration                                            │
│  │   ├── spells.book                                                │
│  │   └── spells.page                                                │
│  └── Set tooltip with full description                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. SPELL SLOTS CALCULATION

```
┌─────────────────────────────────────────────────────────────────────┐
│  CalcSpellScores()                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  For each spellcasting class in CurrentSpells:                       │
│  ├── Get spellcasting level                                          │
│  │   ├── Full caster: class level                                   │
│  │   ├── Half caster: floor(level / 2)                              │
│  │   └── Third caster: floor(level / 3)                             │
│  └── Sum for multiclass slot calculation                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Spell Slot Tables (from ClassList/data)                             │
│                                                                      │
│  Standard Multiclass Table:                                          │
│  Level │ 1st │ 2nd │ 3rd │ 4th │ 5th │ 6th │ 7th │ 8th │ 9th        │
│  ──────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────       │
│    1   │  2  │  -  │  -  │  -  │  -  │  -  │  -  │  -  │  -         │
│    2   │  3  │  -  │  -  │  -  │  -  │  -  │  -  │  -  │  -         │
│    3   │  4  │  2  │  -  │  -  │  -  │  -  │  -  │  -  │  -         │
│    4   │  4  │  3  │  -  │  -  │  -  │  -  │  -  │  -  │  -         │
│    5   │  4  │  3  │  2  │  -  │  -  │  -  │  -  │  -  │  -         │
│   ...  │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ... │ ...        │
│   20   │  4  │  3  │  3  │  3  │  3  │  2  │  2  │  1  │  1         │
│                                                                      │
│  Warlock Pact Magic (separate):                                      │
│  Level │ Slots │ Level                                               │
│  ──────┼───────┼───────                                              │
│   1-2  │   1   │  1st                                                │
│   3-4  │   2   │  2nd                                                │
│   5-6  │   2   │  3rd                                                │
│  ...   │  ...  │  ...                                                │
│  17-20 │   4   │  5th                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. EQUIPMENT PIPELINE

```
┌─────────────────────────────────────────────────────────────────────┐
│  Equipment Entry Points                                              │
│  ├── InventoryOptions() (gear button)                                │
│  ├── AddToInv() (programmatic)                                       │
│  └── Field validation events                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
        ┌────────────────┐ ┌────────────┐ ┌────────────────┐
        │ AddArmor()     │ │ AddWeapon()│ │ AddToInv()     │
        │ ├─ParseArmor() │ │ ├─ParseWp()│ │ ├─ParseGear()  │
        │ └─ApplyArmor() │ │ └─ApplyWp()│ │ └─SetGearVars()│
        └────────────────┘ └────────────┘ └────────────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Weight Calculation Pipeline                                         │
│  ├── CalcWeightSubtotal()       ← Per section                        │
│  ├── CalcWeightCarried()        ← Total weight                       │
│  └── CalcEncumbrance()          ← Check vs carrying capacity         │
│      ├── Str × 15 (normal)                                          │
│      ├── Str × 10 (encumbered)                                      │
│      └── Str × 5 (heavily encumbered)                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  AC Calculation Pipeline                                             │
│  ├── CalcAC()                                                        │
│  │   ├── Base AC from armor                                         │
│  │   │   ├── None: 10 + Dex                                         │
│  │   │   ├── Light: AC + Dex                                        │
│  │   │   ├── Medium: AC + min(Dex, 2)                               │
│  │   │   └── Heavy: AC only                                         │
│  │   ├── + Shield bonus                                             │
│  │   ├── + Magic bonuses                                            │
│  │   ├── + Misc modifiers (AC Misc Mod 1, 2)                        │
│  │   └── Check for Unarmored Defense                                │
│  └── formatACdescr() ← Build tooltip                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. ATTACK CALCULATION PIPELINE

```
┌─────────────────────────────────────────────────────────────────────┐
│  Attack Entry Points                                                 │
│  ├── AddWeapon(weaponName)                                           │
│  ├── Attack field validation                                         │
│  └── ReCalcWeapons()                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FindWeapons() / ParseWeapon(input)                                  │
│  ├── Match against WeaponsList keys                                  │
│  ├── Match against WeaponsList[].name                                │
│  ├── Match against WeaponsList[].regExpSearch                        │
│  └── Return weapon key                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ApplyWeapon(weaponKey, prefix)                                      │
│  ├── Get weapon from WeaponsList or CurrentVars.extraWeapons         │
│  ├── isProficientWithWeapon()   ← Check proficiency                  │
│  │   ├── Simple weapon + simple prof                                │
│  │   ├── Martial weapon + martial prof                              │
│  │   └── Specific weapon proficiency                                │
│  └── Set attack fields                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CalcAttackDmgHit(prefix)                                            │
│  ├── To Hit Calculation:                                             │
│  │   ├── + Ability modifier (Str or Dex for finesse)                │
│  │   ├── + Proficiency bonus (if proficient)                        │
│  │   ├── + Magic bonus                                              │
│  │   └── + BlueText modifier                                        │
│  │                                                                   │
│  ├── Damage Calculation:                                             │
│  │   ├── Damage die (from weapon)                                   │
│  │   ├── + Ability modifier                                         │
│  │   ├── + Magic bonus                                              │
│  │   ├── + BlueText modifier                                        │
│  │   └── + calcChanges.atkCalc modifications                        │
│  │                                                                   │
│  └── Apply calcChanges:                                              │
│      ├── atkAdd: Modify attack properties                           │
│      ├── atkCalc: Modify to-hit and damage                          │
│      └── atkCritRange: Modify critical range                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. FEATURE ATTRIBUTE PROCESSING (Core Engine)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ApplyFeatureAttributes(type, objName, lvlArray, choiceArray)        │
│  ├── type: "class" | "race" | "feat" | "item" | "background"        │
│  ├── objName: feature identifier                                     │
│  ├── lvlArray: [oldLevel, newLevel, forceApply]                      │
│  └── choiceArray: [oldChoice, newChoice, "only"|"change"]            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Get Feature Object                                                  │
│  ├── Class: CurrentClasses[class].features[feature]                  │
│  ├── Race: CurrentRace.features[feature]                             │
│  ├── Feat: FeatsList[feat]                                           │
│  ├── Item: MagicItemsList[item]                                      │
│  └── Background: CurrentBackground                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GetLevelFeatures(fObj, newLvl, newChoice, oldLvl, oldChoice)        │
│  ├── Process minlevel checks                                        │
│  ├── Process level-dependent attributes                             │
│  │   └── description, additional, usages, recovery, etc.            │
│  └── Return features to add/remove                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  useAttr(featureObj, addIt)     ← Core attribute processor           │
│  ├── runEval(eval/removeeval)                                        │
│  ├── addEvals(calcChanges)      ← Register calculation hooks         │
│  ├── SetProf("savetxt")                                              │
│  ├── SetProf("speed")                                                │
│  ├── processMods(addMod)                                             │
│  ├── processSaves(saves)                                             │
│  ├── processTools(toolProfs)                                         │
│  ├── processLanguages(languageProfs)                                 │
│  ├── processVision(vision)                                           │
│  ├── processResistance(dmgres)                                       │
│  ├── processActions(action)                                          │
│  ├── processExtraLimitedFeatures(extraLimitedFeatures)               │
│  ├── processExtraAC(extraAC)                                         │
│  ├── processToNotesPage(toNotesPage)                                 │
│  ├── SetProf("carryingcapacity")                                     │
│  ├── processAdvantages(advantages)                                   │
│  ├── processStats(scores)                                            │
│  ├── processSpBonus(spellcastingBonus)                               │
│  ├── processSpellcastingExtra(spellcastingExtra)                     │
│  ├── processSpChanges(spellChanges)                                  │
│  ├── processWeaponProfs(weaponProfs)                                 │
│  ├── processArmourProfs(armorProfs)                                  │
│  ├── processAddWeapons(weaponsAdd)                                   │
│  ├── processAddArmour(armorAdd)                                      │
│  ├── processAddShield(shieldAdd)                                     │
│  ├── processSkills(skills)                                           │
│  ├── processAddCompanions(creaturesAdd)                              │
│  └── processAddMagicItems(magicitemsAdd)                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. CALCULATION HOOKS SYSTEM (calcChanges)

```
┌─────────────────────────────────────────────────────────────────────┐
│  calcChanges Object Structure                                        │
│  {                                                                   │
│    hp: function(totalHD, HDobj, prefix) { ... },                     │
│    atkAdd: [function(fields, v) { ... }, "description"],             │
│    atkCalc: [function(fields, v, output) { ... }, "description"],    │
│    spellAdd: [function(spellKey, spellObj, spName) { ... }, "desc"], │
│    spellCalc: [function(type, spellcasters, ability) { ... }, "d"],  │
│    spellList: [function(spellList, class, level) { ... }, "desc"],   │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  addEvals(calcChanges, featureName, addIt, type)                     │
│  ├── Adds/removes functions to CurrentEvals                          │
│  ├── CurrentEvals.atkStr[name] = description                         │
│  ├── CurrentEvals.atkAdd[name] = function                            │
│  ├── CurrentEvals.atkCalc[name] = function                           │
│  ├── CurrentEvals.spellAdd[name] = function                          │
│  └── etc.                                                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Execution Points                                                    │
│  ├── HP calculation: calcHP() iterates CurrentEvals.hp               │
│  ├── Attack calc: CalcAttackDmgHit() iterates CurrentEvals.atkCalc   │
│  ├── Spell processing: GetSpellObject() iterates CurrentEvals.spell  │
│  └── etc.                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. PROFICIENCY SYSTEM

```
┌─────────────────────────────────────────────────────────────────────┐
│  SetProf(type, addIt, value, source)                                 │
│  ├── type: "skill" | "armour" | "weapon" | "save" | etc.            │
│  ├── addIt: true (add) | false (remove)                              │
│  ├── value: the proficiency to add/remove                            │
│  └── source: feature name for tooltip                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CurrentProfs Structure                                              │
│  {                                                                   │
│    skill: { athletics: { "Fighter": true }, ... },                   │
│    armour: { light: { "Fighter": true }, ... },                      │
│    weapon: { simple: { "Fighter": true }, ... },                     │
│    save: { str: { "Fighter": true }, ... },                          │
│    resistance: { fire: { "Tiefling": true }, ... },                  │
│    language: { common: { "Background": true }, ... },                │
│    tool: { "thieves' tools": { "Rogue": true }, ... },               │
│    savetxt: { adv_vs: {...}, immune: {...}, text: {...} },           │
│    vision: { darkvision: {...}, ... },                               │
│    speed: { walk: {...}, fly: {...}, ... },                          │
│    carryingcapacity: { "multiplier": {...} },                        │
│    advantage: { initiative: {...}, ... }                             │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 12. GLOBAL STATE OBJECTS

```
┌─────────────────────────────────────────────────────────────────────┐
│  classes{} - Parsed class information                                │
│  ├── field: raw field value                                          │
│  ├── parsed: [[className, level], ...]                               │
│  ├── known: { className: { level, subclass, string }, ... }          │
│  ├── old: previous known state                                       │
│  ├── hd: { d8: 5, d10: 3, ... }                                      │
│  ├── hp: base HP from hit dice                                       │
│  ├── attacks: attacks per action                                     │
│  ├── totallevel: sum of all class levels                             │
│  ├── primary: first class (for proficiencies)                        │
│  └── spellcastlvl: { default: X, warlock: Y }                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CurrentClasses{} - Full class objects for known classes             │
│  ├── [className]: ClassList[className] + modifications              │
│  └── Properties: name, subname, fullname, features{}, etc.          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CurrentRace{} - Merged race + variant                               │
│  ├── All properties from RaceList[race]                              │
│  ├── Overrides from RaceSubList[variant]                             │
│  └── features{}: race features                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CurrentBackground{} - Background object                             │
│  ├── Properties from BackgroundList[background]                      │
│  └── feature: background feature                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CurrentSpells{} - Spellcasting entries                              │
│  ├── [casterId]: {                                                   │
│  │     name, list, known, prepared, typeSp, ability,                 │
│  │     abilityToUse, bonus, spellcastingExtra, ...                   │
│  │   }                                                               │
│  └── One entry per spellcasting source                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CurrentFeats{} - Feat tracking                                      │
│  ├── known: [featKey, featKey, ...]                                  │
│  ├── choices: [choice, choice, ...]                                  │
│  └── level: character level                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CurrentMagicItems{} - Magic item tracking                           │
│  ├── known: [itemKey, itemKey, ...]                                  │
│  ├── choices: [choice, choice, ...]                                  │
│  └── level: character level                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CurrentSources{} - Source filtering                                 │
│  ├── firstTime: boolean                                              │
│  ├── globalExcl: [source, source, ...]                               │
│  └── globalKnown: [source, source, ...]                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CurrentEvals{} - Active calculation hooks                           │
│  ├── hp: { featureName: function, ... }                              │
│  ├── atkAdd: { featureName: function, ... }                          │
│  ├── atkCalc: { featureName: function, ... }                         │
│  ├── spellAdd: { featureName: function, ... }                        │
│  └── etc.                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 13. KEY HELPER FUNCTIONS

```
┌─────────────────────────────────────────────────────────────────────┐
│  Field Manipulation (Functions0.js)                                  │
│  ├── Value(field, value, tooltip, submitName)   ← Set field value   │
│  ├── What(field)                                ← Get field value   │
│  ├── Who(field)                                 ← Get tooltip       │
│  ├── How(field)                                 ← Get submitName    │
│  ├── Hide(field)                                ← Hide field        │
│  ├── Show(field)                                ← Show field        │
│  ├── DontPrint(field)                           ← Mark non-print    │
│  ├── Editable(field)                            ← Make editable     │
│  ├── Uneditable(field)                          ← Make readonly     │
│  └── AddTooltip(field, tooltip, submitName)     ← Set tooltip       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  String Manipulation                                                 │
│  ├── clean(input)               ← Remove extra whitespace            │
│  ├── desc(array, joiner)        ← Join array with prefix             │
│  ├── toUni(text)                ← Convert to unicode bold            │
│  ├── formatLineList(header, arr)← Format bulleted list              │
│  ├── AddString(field, text)     ← Append to field                    │
│  └── RemoveString(field, text)  ← Remove from field                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  State Management                                                    │
│  ├── SetStringifieds(type)      ← Save state to hidden fields        │
│  │   ├── type: "vars" | "sources" | "spells" | "stats" | etc.       │
│  │   └── Stores JSON in field.submitName or .userName               │
│  ├── GetStringifieds()          ← Load state from hidden fields      │
│  └── calcStop() / calcCont()    ← Pause/resume calculations          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Source Testing                                                      │
│  ├── testSource(key, obj, exclType)                                  │
│  │   ├── Returns true if source is excluded                         │
│  │   └── exclType: "classExcl" | "spellsExcl" | etc.                │
│  └── sourceDate(source)         ← Get source publication date        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 14. DATA LIST STRUCTURES

```
┌─────────────────────────────────────────────────────────────────────┐
│  ClassList[className] = {                                            │
│    name: "Fighter",                                                  │
│    regExpSearch: /^(?=.*fighter).*$/i,                               │
│    source: ["PHB", 46],                                              │
│    primaryAbility: "Strength or Dexterity",                          │
│    prereqs: "Strength 13 or Dexterity 13",                           │
│    die: 10,                                                          │
│    improvements: [0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,5,5],          │
│    saves: ["Str", "Con"],                                            │
│    skillstxt: { primary: "Choose 2..." },                            │
│    armorProfs: { primary: [true,true,true,true] },                   │
│    weaponProfs: { primary: [true,true] },                            │
│    equipment: "...",                                                 │
│    subclasses: ["Martial Archetype", ["champion","battlemaster"..]], │
│    attacks: [1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,4],               │
│    features: {                                                       │
│      "fighting style": { ... },                                      │
│      "second wind": { ... },                                         │
│      ...                                                             │
│    },                                                                │
│    ...                                                               │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  RaceList[raceName] = {                                              │
│    name: "Tiefling",                                                 │
│    regExpSearch: /^(?=.*tiefling).*$/i,                              │
│    source: ["PHB", 42],                                              │
│    plural: "Tieflings",                                              │
│    size: 3,                                                          │
│    speed: { walk: { spd: 30, enc: 20 } },                            │
│    languageProfs: ["Common", "Infernal"],                            │
│    vision: [["Darkvision", 60]],                                     │
│    dmgres: ["Fire"],                                                 │
│    age: "...",                                                       │
│    height: "...",                                                    │
│    weight: "...",                                                    │
│    scores: [0, 0, 0, 1, 0, 2],                                       │
│    trait: "...",                                                     │
│    spellcastingAbility: 6,                                           │
│    spellcastingBonus: { ... },                                       │
│    features: { ... },                                                │
│    variants: ["feral", "winged", ...]                                │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  SpellsList[spellName] = {                                           │
│    name: "Fireball",                                                 │
│    regExpSearch: /^(?=.*fire)(?=.*ball).*$/i,                        │
│    source: ["PHB", 241],                                             │
│    level: 3,                                                         │
│    school: "Evoc",                                                   │
│    time: "1 a",                                                      │
│    range: "150 ft",                                                  │
│    components: "V,S,M",                                              │
│    compMaterial: "...",                                              │
│    duration: "Instantaneous",                                        │
│    save: "Dex",                                                      │
│    description: "20-ft rad 8d6 Fire dmg; +1d6/SL",                   │
│    descriptionFull: "...",                                           │
│    classes: ["sorcerer", "wizard"]                                   │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WeaponsList[weaponName] = {                                         │
│    name: "Longsword",                                                │
│    regExpSearch: /^(?=.*long)(?=.*sword).*$/i,                       │
│    source: ["PHB", 149],                                             │
│    type: "Martial",                                                  │
│    ability: 1,                                                       │
│    abilitytodamage: true,                                            │
│    damage: [1, 8, "slashing"],                                       │
│    range: "Melee",                                                   │
│    description: "Versatile (1d10)",                                  │
│    weight: 3                                                         │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 15. APP IMPLEMENTATION MAPPING

### Functions Already Implemented in React App

| PDF Function    | App Implementation       | Location                |
| --------------- | ------------------------ | ----------------------- |
| `CalcMod()`     | `abilityMod()`           | character.calculator.ts |
| `ProfBonus()`   | `profBonus()`            | character.calculator.ts |
| Cantrip scaling | `cantripDieByLevel()`    | character.calculator.ts |
| Spell slots     | `getSpellSlots()`        | character.calculator.ts |
| Warlock slots   | `getWarlockPactSlots()`  | character.calculator.ts |
| AC calculation  | `calculateAC()`          | character.calculator.ts |
| Skill bonuses   | `skillBonus()`           | character.calculator.ts |
| `ParseClass()`  | Built-in React selection | Step2_Class.tsx         |
| `ParseRace()`   | Built-in React selection | Step1_Race.tsx          |
| `ParseSpell()`  | SpellBrowser filtering   | SpellBrowser.tsx        |

### Functions Needing Implementation

| PDF Function               | Purpose                       | Priority |
| -------------------------- | ----------------------------- | -------- |
| `ApplyFeatureAttributes()` | Feature processing engine     | HIGH     |
| `calcChanges` hooks        | Dynamic calculation modifiers | HIGH     |
| `CurrentEvals` system      | Runtime calculation hooks     | HIGH     |
| `processSpBonus()`         | Spellcasting bonus handling   | MEDIUM   |
| `processExtraAC()`         | AC modifier handling          | MEDIUM   |
| `processMods()`            | Generic modifier system       | MEDIUM   |
| `SetProf()`                | Proficiency tracking          | MEDIUM   |
| Level-dependent features   | Feature scaling by level      | HIGH     |
| Feature choices            | User choice tracking          | MEDIUM   |

---

## 16. DATA TRANSFORMATION (convert.js)

```
┌─────────────────────────────────────────────────────────────────────┐
│  convert.js Pipeline                                                 │
│  ├── Load SRD scripts (ListsClasses.js, etc.)                        │
│  ├── Load All_WotC.js                                                │
│  ├── Load primary source books                                       │
│  ├── Load ExpandedScripts                                            │
│  └── Execute in VM sandbox                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Stub Functions (defined in convert.js)                              │
│  ├── desc(arr)                  ← Join array for descriptions        │
│  ├── toUni(str)                 ← Bold text formatting               │
│  ├── FightingStyles             ← Fighting style definitions         │
│  ├── AddSubClass()              ← Add subclass to ClassSubList       │
│  ├── AddRacialVariant()         ← Add variant to RaceSubList         │
│  ├── AddWarlockInvocation()     ← Add invocation                     │
│  ├── AddBackgroundVariant()     ← Add background variant             │
│  └── defaultSpellTable          ← Standard caster progression        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Output JSON Files                                                   │
│  ├── classes.json               ← ClassList + ClassSubList           │
│  ├── races.json                 ← RaceList                           │
│  ├── race_variants.json         ← RaceSubList                        │
│  ├── backgrounds.json           ← BackgroundList                     │
│  ├── spells.json                ← SpellsList                         │
│  ├── feats.json                 ← FeatsList                          │
│  ├── weapons.json               ← WeaponsList                        │
│  ├── armor.json                 ← ArmourList                         │
│  └── ... (21 total)                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Summary

The MPMB PDF contains **597 functions** across **63,361 lines** of JavaScript.
The core architecture follows these patterns:

1. **Event-Driven**: Field changes trigger calculation functions
2. **Global State**: `Current*` objects hold parsed character data
3. **Hook System**: `calcChanges` allows features to modify calculations
4. **Feature Attributes**: `ApplyFeatureAttributes()` is the universal feature
   processor
5. **Proficiency Tracking**: `SetProf()` and `CurrentProfs` track all
   proficiencies
6. **State Persistence**: `SetStringifieds()`/`GetStringifieds()` serialize
   state to fields

The React app should implement:

- The `calcChanges` hook system for dynamic modifiers
- The `ApplyFeatureAttributes()` pattern for feature processing
- Level-dependent feature scaling
- The proficiency tracking system
