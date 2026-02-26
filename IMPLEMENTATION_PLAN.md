# D&D Character Creator — Full Implementation Plan

This document maps every feature present in the MPMB Character Sheet PDF JavaScript
against the current state of the web app. Items marked **✅ Done** are complete.
Items marked **🔲 TODO** must be built to reach full feature parity.

Source: `MPMB Character Sheet [Printer Friendly].pdf` v13.2.3+241220 (7 pages,
1518 form fields, 3631 JS event handlers). PDF JS modules analysed:
`Functions0-3`, `FunctionsImport`, `FunctionsResources`, `FunctionsSpells`,
`AbilityScores`, `ClassSelection`, `Lists`, `ListsClasses`, `ListsRaces`,
`ListsBackgrounds`, `ListsSpells`, `ListsMagicItems`, `ListsGear`.

---

## A. Character Builder — Creation Wizard

### A1. Race Selection (Step 1)
| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Browse all 226 races | `ListsRaces.js` | ✅ Done | `Step1_Race.tsx` |
| Browse 127 race variants / subraces | `ListsRaces.js` | ✅ Done | `Step1_Race.tsx` |
| Fixed racial ASI auto-applied | `AbilityScores.js → processStats()` | ✅ Done | `step1 → setRaceAsi()` |
| **"Choose any" racial ASI picker** | `AbilityScores.js — isSpecial=true bonuses` | ✅ Done | `Step1_Race.tsx` |
| Race trait / feature preview | `ListsRaces.js — traits[]` | ✅ Done (detail panel) | `Step1_Race.tsx` |
| Race speed applied to character | `ListsRaces.js — speed.walk.spd` | ✅ Done | `Step8_Review.tsx` |
| **Racial languages** | `ListsRaces.js — languageProfs[]` | ✅ Done | `Step8_Review.tsx + char.languages` |
| **Racial tool proficiencies** | `ListsRaces.js — toolProfs[]` | 🔲 TODO | — |
| **Racial weapon/armor proficiencies** | `ListsRaces.js — weaponProfs/armorProfs` | 🔲 TODO (display only) | — |
| **Racial features applied at creation** | `Functions3.js — ApplyRaceFeatures()` | ✅ Done | `FeaturesPanel.tsx` |

### A2. Class Selection (Step 2)
| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Browse all 22 classes | `ListsClasses.js` | ✅ Done | `Step2_Class.tsx` |
| Class feature preview | `ListsClasses.js — features{}` | ✅ Done | `Step2_Class.tsx` |
| Starting level picker (1–20) | `ClassSelection.js` | ✅ Done | `Step2_Class.tsx` |
| Subclass picker (when level ≥ unlock) | `ClassSelection.js` | ✅ Done | `Step2_Class.tsx` |
| ASI count for starting level | `ListsClasses.js — improvements[]` | ✅ Done | `Step4_AbilityScores.tsx` |
| **Fighting style selection** | `ListsClasses.js — features{fighting style}` | ✅ Done | `Step2_Class.tsx` |
| **Multiclass — add second+ class** | `ClassSelection.js — ClassSelection_Dialog` | 🔲 TODO | — |
| **Multiclass prerequisite enforcement** | `Functions1.js — meetsMulticlassPrereq` | 🔲 TODO | — |
| **Class tool proficiencies** | `ListsClasses.js — toolProfs[]` | 🔲 TODO | — |
| **Class weapon/armor proficiencies display** | `ListsClasses.js — armorProfs, weaponProfs` | ✅ Done (shown in detail) | `Step2_Class.tsx` |

### A3. Background Selection (Step 3)
| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Browse all 132 backgrounds | `ListsBackgrounds.js` | ✅ Done | `Step3_Background.tsx` |
| Background skill proficiencies | `ListsBackgrounds.js — skills[]` | ✅ Done | `Step8_Review.tsx → char.skills` |
| Background equipment | `ListsBackgrounds.js — equipleft/equipright` | ✅ Done | `Step8_Review.tsx` |
| Background starting gold | `ListsBackgrounds.js — gold` | ✅ Done | `Step8_Review.tsx` |
| Background feature display | `ListsBackgrounds.js / background_features.json` | ✅ Done | `Step3_Background.tsx` |
| Background personality traits/ideals/bonds/flaws | `ListsBackgrounds.js` | ✅ Done | `Step7_Details.tsx` |
| **Background languages** | `ListsBackgrounds.js — languageProfs[]` | ✅ Done | `Step8_Review.tsx → char.languages` |
| **Background tool proficiencies** | `ListsBackgrounds.js — toolProfs[]` | ✅ Done | `Step8_Review.tsx → char.toolProficiencies` |
| **Background variants** | `background_variants.json` (45 entries) | 🔲 TODO | — |

### A4. Ability Scores (Step 4)
| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Standard Array assignment | `AbilityScores.js` | ✅ Done | `Step4_AbilityScores.tsx` |
| Point Buy (27-point budget) | `AbilityScores.js` | ✅ Done | `Step4_AbilityScores.tsx` |
| Manual / Roll entry | `AbilityScores.js` | ✅ Done | `Step4_AbilityScores.tsx` |
| Racial ASI stacked on base | `AbilityScores.js — processStats()` | ✅ Done | `resolveFinalScores()` |
| Background ASI stacked | `AbilityScores.js` | ✅ Done | `resolveFinalScores()` |
| Level ASI allocation (N×2 pts) | `AbilityScores.js — improvements[]` | ✅ Done | `Step4_AbilityScores.tsx` |
| Score cap at 20 | `AbilityScores.js — maxIsLimitToNow` | ✅ Done | `resolveFinalScores()` |
| **Class skill proficiency picker** | `Functions1.js — SetProf(); skillstxt parsing` | ✅ Done | `Step4_AbilityScores.tsx` |
| **Expertise picker (Rogue / Bard)** | `Functions1.js — SetExpert()` | ✅ Done | `Step4_AbilityScores.tsx` |
| **Feat browser as ASI alternative** | `Functions1.js / ListsFeats.js` | ✅ Done | `Step4_AbilityScores.tsx` |

### A5. Equipment (Step 5)
| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Starting equipment pack selection | `ListsGear.js — packs` | ✅ Done | `Step5_Equipment.tsx` |
| Starting gold alternative | `ListsClasses.js — startingGold` | ✅ Done | `Step5_Equipment.tsx` |
| Background equipment auto-added | `ListsBackgrounds.js` | ✅ Done | `Step8_Review.tsx` |
| Custom item entry | — | ✅ Done | `Step5_Equipment.tsx` |
| **Class starting weapon choices** | `ListsClasses.js — equipment[]` | 🔲 TODO | — |

### A6. Spells (Step 6)
| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Cantrip selection (count from class data) | `FunctionsSpells.js / ListsClasses.js` | ✅ Done | `Step6_Spells.tsx` |
| Spell selection (count from class data) | `FunctionsSpells.js` | ✅ Done | `Step6_Spells.tsx` |
| Counts scaled to starting level | `FunctionsSpells.js` | ✅ Done | `Step6_Spells.tsx` |
| Non-caster skip | `FunctionsSpells.js` | ✅ Done | `Step6_Spells.tsx` |
| Warlock eldritch invocations | `FunctionsSpells.js / ListsClasses.js` | ✅ Done | `Step6_Spells.tsx` |
| **Prepared vs. known caster label** | `FunctionsSpells.js — spellcastingKnown.prepared` | ✅ Done | `Step6_Spells.tsx` |
| **Ritual caster tag** | `ListsSpells.js — ritual: bool` | ✅ Done (in spell row) | `SpellsPanel.tsx` |
| **Cantrip damage die scaling preview** | `Lists.js — cantripDie[]` | ✅ Done | `SpellsPanel.tsx` |

### A7. Details (Step 7)
| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Character name | — | ✅ Done | `Step7_Details.tsx` |
| Alignment | — | ✅ Done | `Step7_Details.tsx` |
| Physical description (age/height/weight/etc.) | — | ✅ Done | `Step7_Details.tsx` |
| Personality traits (from background) | `ListsBackgrounds.js — trait[]` | ✅ Done | `Step7_Details.tsx` |
| Ideals | `ListsBackgrounds.js — ideal[]` | ✅ Done | `Step7_Details.tsx` |
| Bonds | `ListsBackgrounds.js — bond[]` | ✅ Done | `Step7_Details.tsx` |
| Flaws | `ListsBackgrounds.js — flaw[]` | ✅ Done | `Step7_Details.tsx` |
| Backstory / appearance text | — | ✅ Done | `Step7_Details.tsx` |
| **Allies & organisations** | PDF "Allies & Organizations" field | ✅ Done | `NotesPanel.tsx` |
| **Treasure (art/gems description)** | PDF "Treasure" field | ✅ Done | `NotesPanel.tsx` |

### A8. Review & Save (Step 8)
| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Full character summary | — | ✅ Done | `Step8_Review.tsx` |
| HP at starting level (avg formula) | `Functions1.js — buildHpPerLevel` | ✅ Done | `Step8_Review.tsx` |
| Subclass name shown | `ListsClasses.js` | ✅ Done | `Step8_Review.tsx` |
| Invocations listed | `ListsClasses.js` | ✅ Done | `Step8_Review.tsx` |
| Spell list in review | `ListsSpells.js` | ✅ Done | `Step8_Review.tsx` |
| Equipment in review | `ListsGear.js` | ✅ Done | `Step8_Review.tsx` |
| Class skills merged into char.skills | `Functions1.js` | ✅ Done | `Step8_Review.tsx` |
| Expertise merged into char.expertise | `Functions1.js` | ✅ Done | `Step8_Review.tsx` |
| Fighting style stored on CharacterClass | `ListsClasses.js` | ✅ Done | `Step8_Review.tsx` |
| Currency initialized (gp = background gold) | — | ✅ Done | `Step8_Review.tsx` |
| **Proficiency summary** | PDF summary fields | ✅ Done | `Step8_Review.tsx` |
| **Languages in review** | `ListsRaces/Backgrounds` | ✅ Done | `Step8_Review.tsx` |
| **Tool proficiencies in review** | `ListsClasses/Races/Backgrounds` | ✅ Done | `Step8_Review.tsx` |

---

## B. Character Sheet — Core Stats (StatsPanel)

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Ability scores + modifiers | `AbilityScores.js` | ✅ Done | `StatsPanel.tsx` |
| Proficiency bonus | `Lists.js — ProficiencyBonusList` | ✅ Done | `StatsPanel.tsx` |
| Saving throws (all 6 + proficiency) | `Functions1.js — CalcSave()` | ✅ Done | `StatsPanel.tsx` |
| Skill bonuses (all 18 skills) | `Functions1.js — CalcSkill()` | ✅ Done | `StatsPanel.tsx` |
| Proficiency dots on skills | `Functions1.js — SetProf()` | ✅ Done | `StatsPanel.tsx` |
| Expertise double-dots on skills | `Functions1.js — SetExpert()` | ✅ Done | `StatsPanel.tsx` |
| Passive Perception | `Functions1.js — line 4737` | ✅ Done | `StatsPanel.tsx` |
| **Passive Investigation** | `Functions1.js — same pattern` | ✅ Done | `StatsPanel.tsx` |
| **Passive Insight** | `Functions1.js — same pattern` | ✅ Done | `StatsPanel.tsx` |
| **Saving throw advantage indicators** | `Functions1.js — ConditionSet()` | 🔲 TODO | — |
| **Jack of All Trades** (half-prof unlearned skills) | `Functions1.js — CalcSkill()` | ✅ Done | `character.calculator.ts` |
| **Remarkable Athlete** (Fighter L7) | `Functions1.js — CalcSkill()` | ✅ Done | `character.calculator.ts` |
| **Reliable Talent** (Rogue L11) | `Functions1.js — CalcSkill()` | ✅ Done | `character.calculator.ts + StatsPanel.tsx` |

---

## C. Character Sheet — Header & Combat Stats

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Character name, race, class display | — | ✅ Done | `CharacterSheet.tsx` |
| Current HP / Max HP click-to-edit | `Functions1.js — HP tracking` | ✅ Done | `CharacterSheet.tsx` |
| Temp HP click-to-edit | `Functions1.js — Temp HP field` | ✅ Done | `CharacterSheet.tsx` |
| AC (armor type + shield + Unarmored Defense) | `Functions2.js — computeAc()` | ✅ Done | `character.calculator.ts` |
| Initiative | `Functions1.js — DEX mod` | ✅ Done | `CharacterSheet.tsx` |
| Speed (from race) | `ListsRaces.js — speed.walk.spd` | ✅ Done | `CharacterSheet.tsx` |
| Hit Dice used tracker | `FunctionsResources.js` | ✅ Done (basic) | `CharacterSheet.tsx` |
| Death saves (3 success / 3 fail) | `Functions1.js — death save fields` | ✅ Done | `CharacterSheet.tsx` |
| XP tracker + progress bar | `Functions1.js — ExperiencePointsList` | ✅ Done | `CharacterSheet.tsx` |
| Short Rest button | `FunctionsResources.js` | ✅ Done | `CharacterSheet.tsx` |
| Long Rest button | `FunctionsResources.js` | ✅ Done | `CharacterSheet.tsx` |
| **Inspiration toggle** | `Functions1.js — "Inspiration" field` | ✅ Done | `CharacterSheet.tsx` |
| **Exhaustion tracker (levels 1–6)** | `Functions1.js — ConditionSet()` | ✅ Done | `CharacterSheet.tsx` |
| **Exhaustion mechanical effects** | `Functions1.js — speed/HP/check penalties` | ✅ Done | `character.calculator.ts` |
| **Conditions tracker (14 conditions)** | `Functions1.js — ConditionSet()` | ✅ Done | `CharacterSheet.tsx` |
| **Condition mechanical effects** | `Functions1.js — ConditionSet() cascades` | ✅ Done (speed=0 + disadvantage/advantage flags) | `character.calculator.ts` |
| **Currency (cp / sp / ep / gp / pp)** | Not in PDF JS — PDF has static fields | ✅ Done | `EquipmentPanel.tsx` |
| **Attacks per action display** | `Functions1.js — attacksPerAction` | ✅ Done (computed) | `character.calculator.ts` |

> **Conditions list (14):** Blinded, Charmed, Deafened, Frightened, Grappled,
> Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained,
> Stunned, Unconscious.
>
> **Exhaustion mechanical effects by level:**
> - L1: Disadvantage on ability checks
> - L2: Speed halved
> - L3: Disadvantage on attack rolls & saving throws
> - L4: Max HP halved
> - L5: Speed = 0
> - L6: Death

---

## D. Character Sheet — Attacks Panel (NEW TAB)

The PDF dedicates a full section (5+ attack rows) with auto-calculated fields.

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Weapon name entry | `Functions1.js — ParseWeapon()` | ✅ Done | `AttacksPanel.tsx` |
| Attack to-hit bonus (prof + ability mod) | `Functions1.js — CalcAttackDmgHit()` | ✅ Done | `AttacksPanel.tsx` |
| Damage dice + modifier | `Functions1.js — CalcAttackDmgHit()` | ✅ Done | `AttacksPanel.tsx` |
| Attack type (melee/ranged/spell) | `Functions1.js` | ✅ Done | `AttacksPanel.tsx` |
| Ability used (STR/DEX/spell) | `Functions1.js` | ✅ Done | `AttacksPanel.tsx` |
| Magic weapon bonus (+1/+2/+3) | `Functions1.js — atkCalc extraHit` | ✅ Done | `AttacksPanel.tsx` |
| Proficiency toggle per attack | `Functions1.js — Attack.N.Proficiency` | ✅ Done | `AttacksPanel.tsx` |
| Cross-reference with equipment items | `ListsGear.js — weapons.json` | ✅ Done | `AttacksPanel.tsx` |
| Custom attack entry | — | ✅ Done | `AttacksPanel.tsx` |
| **Fighting Style bonuses applied** | `Functions1.js — calcChanges.atkCalc` | ✅ Done | `AttacksPanel.tsx` |
| **Two-weapon / off-hand attack** | `Functions1.js — atkAdd` | 🔲 TODO | — |
| **Sneak Attack damage display (Rogue)** | `ListsClasses.js — sneak attack` | ✅ Done | `AttacksPanel.tsx` |

---

## E. Character Sheet — Features Panel

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Class features by level (collapsible) | `ListsClasses.js` | ✅ Done | `FeaturesPanel.tsx` |
| Subclass features by level | `ListsClasses.js` | ✅ Done | `FeaturesPanel.tsx` |
| Feature description (full text) | `ListsClasses.js — descriptionFull` | ✅ Done | `FeaturesPanel.tsx` |
| Resource tracker dots (usages + recovery) | `FunctionsResources.js — Limited Feature` | ✅ Done | `FeaturesPanel.tsx` |
| Short rest vs long rest label | `FunctionsResources.js` | ✅ Done | `FeaturesPanel.tsx` |
| **Racial features display** | `ListsRaces.js` | ✅ Done | `FeaturesPanel.tsx` |
| **Background feature display** | `background_features.json` | ✅ Done | `FeaturesPanel.tsx` |
| **Feat features display** | `ListsFeats.js` | ✅ Done | `FeaturesPanel.tsx` |
| **Wild Shape uses tracker** | `ListsClasses.js — druid features` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Wild Shape CR limit by level** | `ListsClasses.js — druid` | ✅ Done | `FeaturesPanel.tsx` |
| **Channel Divinity uses** | `ListsClasses.js — cleric/paladin` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Second Wind uses** | `ListsClasses.js — fighter` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Action Surge uses** | `ListsClasses.js — fighter` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Bardic Inspiration die size + uses** | `ListsClasses.js — bard` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Ki point tracker** | `ListsClasses.js — monk` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Sorcery point tracker** | `ListsClasses.js — sorcerer` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Rage uses + damage bonus** | `ListsClasses.js — barbarian` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Superiority dice (Battle Master)** | `ListsClasses.js — fighter subclass` | ✅ Via resource dots | `FeaturesPanel.tsx` |
| **Font of Magic display** | `ListsClasses.js — sorcerer` | ✅ Via resource dots | `FeaturesPanel.tsx` |

---

## F. Character Sheet — Spells Panel

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Spell slot tracker (click to expend) | `FunctionsSpells.js` | ✅ Done | `SpellsPanel.tsx` |
| Long Rest resets slots | `FunctionsSpells.js` | ✅ Done | `CharacterSheet.tsx` |
| Cantrip list display | `FunctionsSpells.js` | ✅ Done | `SpellsPanel.tsx` |
| Prepared / known spell list | `FunctionsSpells.js` | ✅ Done | `SpellsPanel.tsx` |
| Spell detail expand (time/range/components/desc) | `ListsSpells.js` | ✅ Done | `SpellsPanel.tsx` |
| Concentration toggle | `FunctionsSpells.js` | ✅ Done | `SpellsPanel.tsx` |
| Concentration banner in header | `FunctionsSpells.js` | ✅ Done | `CharacterSheet.tsx` |
| Spell prep toggle (prepared casters) | `FunctionsSpells.js` | ✅ Done | `SpellsPanel.tsx` |
| Save DC + attack bonus display | `FunctionsSpells.js — CalcAbilityDC` | ✅ Done | `SpellsPanel.tsx` |
| Warlock Pact Magic slots | `FunctionsSpells.js — WARLOCK_PACT` | ✅ Done | `character.calculator.ts` |
| Multiclass combined spell slots | `FunctionsSpells.js — MULTICLASS_SLOTS` | ✅ Done | `character.calculator.ts` |
| **Cantrip damage die by total level** | `Lists.js — cantripDie[]` | ✅ Done | `SpellsPanel.tsx` |
| **Ritual spell indicator (R badge)** | `ListsSpells.js — ritual: bool` | ✅ Done | `SpellsPanel.tsx` |
| **Spell school badge** | `ListsSpells.js — school` | ✅ Done | `SpellsPanel.tsx` |
| **Material component text** | `ListsSpells.js — compMaterial` | ✅ Done | `SpellsPanel.tsx` |
| **Pact Magic short rest recharge** | `FunctionsSpells.js` | ✅ Done | `CharacterSheet.tsx` |
| **Spell point variant** | `Lists.js — SpellPointsTable` | 🔲 TODO (optional) | — |

---

## G. Character Sheet — Equipment Panel

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Equipment inventory list | `ListsGear.js` | ✅ Done | `EquipmentPanel.tsx` |
| Armor equip picker (light/medium/heavy) | `Functions2.js — armor types` | ✅ Done | `EquipmentPanel.tsx` |
| Shield toggle (+2 AC) | `Functions2.js` | ✅ Done | `EquipmentPanel.tsx` |
| Magic item browser (887 items) | `ListsMagicItems.js` | ✅ Done | `EquipmentPanel.tsx` |
| **Currency tracker (cp/sp/ep/gp/pp)** | Not in PDF JS | ✅ Done | `EquipmentPanel.tsx` |
| **Item weight / encumbrance total** | `ListsGear.js — weight` | ✅ Done | `EquipmentPanel.tsx` |
| **Carrying capacity** (15 × STR score) | `Functions1.js` | ✅ Done | `character.calculator.ts` |
| **Attunement slots** (max 3) | `ListsMagicItems.js — attunement` | ✅ Done | `EquipmentPanel.tsx` |
| **Attuned items tracker** | `ListsMagicItems.js` | ✅ Done | `EquipmentPanel.tsx` |

---

## H. Character Sheet — Notes Panel

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Free-form notes text | — | ✅ Done | `NotesPanel.tsx` |
| **Languages list** | `ListsRaces/Backgrounds` | ✅ Done | `NotesPanel.tsx` |
| **Tool proficiency list** | `ListsClasses/Races/Backgrounds` | ✅ Done | `NotesPanel.tsx` |
| **Allies & organisations** | PDF "Allies & Organizations" page | ✅ Done | `NotesPanel.tsx` |
| **Treasure description** | PDF "Treasure" field | ✅ Done | `NotesPanel.tsx` |

---

## I. Level-Up Wizard

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Choose class to level | `ClassSelection.js` | ✅ Done | `LevelUpWizard.tsx` |
| Add new multiclass | `ClassSelection.js` | ✅ Done | `LevelUpWizard.tsx` |
| Multiclass prerequisite check | `Functions1.js` | ✅ Done | `LevelUpWizard.tsx` |
| New class features shown | `ListsClasses.js` | ✅ Done | `LevelUpWizard.tsx` |
| Subclass selection (at unlock level) | `ClassSelection.js` | ✅ Done | `LevelUpWizard.tsx` |
| ASI: +2 pts, cap 20 | `AbilityScores.js` | ✅ Done | `LevelUpWizard.tsx` |
| Feat as ASI alternative | `ListsFeats.js` | ✅ Done | `LevelUpWizard.tsx` |
| HP: average / max / roll | `Functions1.js — buildHpPerLevel` | ✅ Done | `LevelUpWizard.tsx` |
| New spells (casters) | `FunctionsSpells.js` | ✅ Done | `LevelUpWizard.tsx` |
| Eldritch Invocations (warlocks) | `ListsClasses.js` | ✅ Done | `LevelUpWizard.tsx` |
| **Fighting style selection step** | `ListsClasses.js` | ✅ Done | `LevelUpWizard.tsx` |
| **Expertise selection step (Rogue/Bard)** | `ListsClasses.js` | ✅ Done | `LevelUpWizard.tsx` |
| **Language / tool proficiency step** | `ListsClasses/Races/Backgrounds` | 🔲 TODO | `LevelUpWizard.tsx` |
| **Ranger Favored Enemy / Terrain** | `ListsClasses.js — ranger features` | 🔲 TODO | `LevelUpWizard.tsx` |
| **Paladin Divine Smite upgrade tracking** | `ListsClasses.js — paladin` | 🔲 TODO | — |

---

## J. Derived Stats / Calculator

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Ability modifiers | `Functions1.js — floor((score-10)/2)` | ✅ Done | `character.calculator.ts` |
| Proficiency bonus by total level | `Lists.js — ProficiencyBonusList` | ✅ Done | `character.calculator.ts` |
| Saving throws | `Functions1.js — CalcSave()` | ✅ Done | `character.calculator.ts` |
| Skill bonuses with prof/expertise | `Functions1.js — CalcSkill()` | ✅ Done | `character.calculator.ts` |
| Passive Perception | `Functions1.js` | ✅ Done | `character.calculator.ts` |
| Max HP from hpPerLevel[] | `Functions1.js` | ✅ Done | `character.calculator.ts` |
| AC (light/medium/heavy/unarmored) | `Functions2.js` | ✅ Done | `character.calculator.ts` |
| Barbarian Unarmored Defense | `Functions2.js` | ✅ Done | `character.calculator.ts` |
| Monk Unarmored Defense | `Functions2.js` | ✅ Done | `character.calculator.ts` |
| Attacks per action (class data) | `ListsClasses.js — attacks[]` | ✅ Done | `character.calculator.ts` |
| Spell slots (multiclass table) | `FunctionsSpells.js` | ✅ Done | `character.calculator.ts` |
| Spell slots (Warlock Pact Magic) | `FunctionsSpells.js` | ✅ Done | `character.calculator.ts` |
| Spell save DC | `Functions1.js — CalcAbilityDC()` | ✅ Done | `character.calculator.ts` |
| Spell attack bonus | `Functions1.js` | ✅ Done | `character.calculator.ts` |
| **Passive Investigation** | `Functions1.js` | ✅ Done | `character.calculator.ts` |
| **Passive Insight** | `Functions1.js` | ✅ Done | `character.calculator.ts` |
| **Jack of All Trades** (Bard L2: +½ prof to unproficient skills) | `Functions1.js — CalcSkill()` | ✅ Done | `character.calculator.ts` |
| **Remarkable Athlete** (Fighter L7) | `Functions1.js — CalcSkill()` | ✅ Done | `character.calculator.ts` |
| **Condition penalties** (disadvantage on checks/attacks) | `Functions1.js — ConditionSet()` | ✅ Done | `character.calculator.ts + StatsPanel.tsx + AttacksPanel.tsx` |
| **Exhaustion speed/HP effects** | `Functions1.js — ConditionSet()` | ✅ Done | `character.calculator.ts` |
| **Carrying capacity** (STR × 15) | `Functions1.js` | ✅ Done | `character.calculator.ts` |
| **Cantrip die by total level** | `Lists.js — cantripDie[]` | ✅ Done | `character.calculator.ts` |
| **Multiclass saving throw proficiencies** | `Functions1.js` | ✅ Done | `character.calculator.ts` |

---

## K. Import / Export

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| Save to localStorage | — | ✅ Done | `character.repository.ts` |
| **Export character as JSON** | `FunctionsImport.js — ExportCharacter()` | ✅ Done | `character.repository.ts + HomePage.tsx` |
| **Import character from JSON** | `FunctionsImport.js — ImportCharacter()` | ✅ Done | `character.repository.ts + HomePage.tsx` |
| **Print / shareable view** | PDF format | 🔲 TODO | — |
| **Character list search/filter** | — | ✅ Done | `HomePage.tsx` |
| **Character duplicate** | — | ✅ Done | `HomePage.tsx` |

---

## L. Data Layer

| Feature | PDF Source | Status | App File |
|---|---|---|---|
| All 22 classes | `ListsClasses.js` | ✅ Done | `classes.json` |
| All 313 subclasses | `ListsClasses.js` | ✅ Done | `subclasses.json` |
| All 1000 spells | `ListsSpells.js` | ✅ Done | `spells.json` |
| All 226 races | `ListsRaces.js` | ✅ Done | `races.json` |
| All 127 race variants | `ListsRaces.js` | ✅ Done | `race_variants.json` |
| All 132 backgrounds | `ListsBackgrounds.js` | ✅ Done | `backgrounds.json` |
| All 164 background features | `ListsBackgrounds.js` | ✅ Done | `background_features.json` |
| All 307 feats | `ListsFeats.js` | ✅ Done | `feats.json` |
| All 106 weapons | `ListsGear.js` | ✅ Done | `weapons.json` |
| All 15 armor types | `ListsGear.js` | ✅ Done | `armor.json` |
| All 144 gear items | `ListsGear.js` | ✅ Done | `gear.json` |
| All 887 magic items | `ListsMagicItems.js` | ✅ Done | `magic_items.json` |
| All 61 warlock invocations | `ListsClasses.js` | ✅ Done | `warlock_invocations.json` |
| All 45 background variants | — | ✅ Stored | `background_variants.json` |
| All 231 psionic disciplines | — | ✅ Stored | `psionics.json` |
| All 359 creatures | `MonsterManual.js` | ✅ Stored | `creatures.json` |
| **BUG: 27 subclasses missing `_parentClass`** | — | ✅ Fixed | `subclasses.json` |
| **BUG: 2 spells with string-type `level`** | — | ✅ Fixed | `spells.json` |
| **BUG: 78 magic items with non-standard rarity** | — | 🔲 Low priority | `magic_items.json` |

---

## Priority Order for Implementation

### P1 — Highest value (play-session blocking) — COMPLETE ✅

1. **Conditions tracker** — ✅ Done (CharacterSheet.tsx)
2. **Exhaustion tracker** — ✅ Done (CharacterSheet.tsx + character.calculator.ts)
3. **Attacks panel** — ✅ Done (AttacksPanel.tsx — new tab)
4. **Inspiration toggle** — ✅ Done (CharacterSheet.tsx)

### P2 — Creation flow completion — COMPLETE ✅

5. **Class skill proficiency picker** — ✅ Done (Step4_AbilityScores.tsx)
6. **Race ASI "choose any" UI** — ✅ Done (Step1_Race.tsx)
7. **Expertise picker** — ✅ Done (Step4_AbilityScores.tsx)
8. **Fighting style picker** — ✅ Done (Step2_Class.tsx)
9. **Passive Investigation + Passive Insight** — ✅ Done (StatsPanel.tsx + calculator)

### P3 — Completeness — COMPLETE ✅

10. **Currency tracker** — ✅ Done (EquipmentPanel.tsx)
11. **Languages + Tool Proficiencies** — ✅ Done (NotesPanel.tsx + Step8_Review.tsx)
12. **Jack of All Trades + Remarkable Athlete** — ✅ Done (character.calculator.ts)
13. **Cantrip damage die display** — ✅ Done (SpellsPanel.tsx)
14. **Attunement slots** — ✅ Done (EquipmentPanel.tsx)
15. **Carrying capacity / encumbrance** — ✅ Done (EquipmentPanel.tsx + calculator)

### P4 — Polish & Export — COMPLETE ✅

16. **Export character as JSON** — ✅ Done (character.repository.ts)
17. **Import character from JSON** — ✅ Done (character.repository.ts + HomePage.tsx)
18. **Character list search/filter** — ✅ Done (HomePage.tsx)
19. **Character duplicate** — ✅ Done (HomePage.tsx)
20. **Background feature in FeaturesPanel** — ✅ Done (FeaturesPanel.tsx)
21. **Racial features in FeaturesPanel** — ✅ Done (FeaturesPanel.tsx)
22. **Data bug fixes** — ✅ Fixed (27 subclasses, 2 spells)

### Remaining / Optional

- Background variants (45 entries) — low priority
- Print / shareable view — future
- Feat features in FeaturesPanel (requires storing chosen feats on character)
- Fighting style / expertise steps in LevelUpWizard
- Condition mechanical penalties (disadvantage tracking)
- Spell point variant rule (optional ruleset)
- 78 magic items with non-standard rarity — cosmetic only

---

## Feature Count Summary

| State | Count |
|---|---|
| ✅ Done | ~110 features |
| 🔲 TODO | ~20 features (optional / low priority) |
| **Total tracked** | **~130 features** |

---

*Last updated: 2026-02-25*
*Derived from MPMB Character Sheet [Printer Friendly].pdf v13.2.3+241220*
