#!/usr/bin/env node
/**
 * MPMB Character Sheet → JSON Converter
 *
 * Evaluates all MPMB JS data files in a sandboxed Node.js vm context that
 * stubs out every MPMB/PDF API call, then serialises every populated data
 * list to clean JSON files in ./json_data/.
 *
 * Handled list types:
 *   SourceList, ClassList, ClassSubList, SpellsList, RaceList, RaceSubList,
 *   BackgroundList, BackgroundFeatureList, FeatsList, WeaponsList, ArmourList,
 *   AmmoList, ToolsList, GearList, PacksList, MagicItemsList, CreatureList,
 *   CompanionList
 *
 * Serialisation rules:
 *   • RegExp  → { _type:"RegExp",  source, flags }
 *   • Function → { _type:"function", body }          (never called, just stored)
 *   • Circular → "[Circular]"
 *   • NaN / ±Inf → null
 *   • Everything else: plain JSON-safe value
 */
'use strict';

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// SERIALISATION
// ─────────────────────────────────────────────────────────────────────────────
function serialize(value, _seen, depth) {
  _seen  = _seen  || new WeakSet();
  depth  = depth  || 0;
  if (depth > 40) return null;

  if (value === null || value === undefined) return value;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string')  return value.replace(/\u00a0/g, ' ');
  if (typeof value === 'number') {
    if (!isFinite(value) || isNaN(value)) return null;
    return value;
  }
  if (typeof value === 'function') {
    return { _type: 'function', body: value.toString() };
  }
  // Cross-realm RegExp detection (works for objects created inside vm sandbox)
  if (Object.prototype.toString.call(value) === '[object RegExp]') {
    return { _type: 'RegExp', source: value.source, flags: value.flags };
  }
  if (typeof value === 'object') {
    if (_seen.has(value)) return '[Circular]';
    _seen.add(value);
    let result;
    if (Array.isArray(value)) {
      result = value.map(function(v) { return serialize(v, _seen, depth + 1); });
    } else {
      result = {};
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        result[k] = serialize(value[k], _seen, depth + 1);
      }
    }
    _seen.delete(value);
    return result;
  }
  return value;
}

/** Convert a plain {key: obj} map to [{_key, ...props}] array */
function listToArray(listObj) {
  return Object.keys(listObj).map(function(key) {
    const ser = serialize(listObj[key]);
    if (ser && typeof ser === 'object' && !Array.isArray(ser)) {
      return Object.assign({ _key: key }, ser);
    }
    return { _key: key, _value: ser };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA CONTAINERS  (populated by running the JS files)
// ─────────────────────────────────────────────────────────────────────────────
const SourceList            = {};
const ClassList             = {};
const ClassSubList          = {};
const SpellsList            = {};
const RaceList              = {};
const RaceSubList           = {};
const BackgroundList        = {};
const BackgroundFeatureList = {};
const FeatsList             = {};
const WeaponsList           = {};
const ArmourList            = {};
const AmmoList              = {};
const ToolsList             = {};
const GearList              = {};
const PacksList             = {};
const MagicItemsList        = {};
const CreatureList          = {};
const CompanionList         = {};
const PsionicsList          = {};

// ─────────────────────────────────────────────────────────────────────────────
// MPMB API STUBS
// ─────────────────────────────────────────────────────────────────────────────

/** Character levels 1–20 used by levels.map(...) calls in feature definitions */
const levels = Array.from({ length: 20 }, function(_, i) { return i + 1; });

/**
 * desc() — MPMB helper that joins an array of description strings.
 * Called heavily in feature/spell/race definitions.
 */
function desc(arr, separator) {
  if (!Array.isArray(arr)) return arr != null ? String(arr) : '';
  return arr.join(separator !== undefined ? separator : '\n   ');
}

/** String appended to spell descriptions for upcast rules */
const AtHigherLevels = '\n   At Higher Levels. ';

/**
 * PsychicFocus — section-header separator used in UA Mystic psionic discipline
 * descriptions, parallel to how AtHigherLevels is used in spell descriptions.
 */
var PsychicFocus = '\n   Psychic Focus. ';

/** toUni() — in MPMB renders underlined text in the PDF; we just pass through */
function toUni(str) { return String(str || ''); }

/** tDoc() — returns a doc-string unchanged */
function tDoc(str) { return String(str || ''); }

/** sourceCategories() — source grouping helper, pass-through */
function sourceCategories(str) { return String(str || ''); }

/** RequiredSheetVersion() — version guard, no-op for extraction */
function RequiredSheetVersion() {}

/**
 * AddSubClass() — MPMB global that registers a subclass.
 * Our version wires the subclass into both ClassSubList and ClassList.
 */
function AddSubClass(classKey, subKey, obj) {
  const fullKey = classKey + '-' + subKey;
  obj._parentClass = classKey;
  obj._subKey      = subKey;
  ClassSubList[fullKey] = obj;

  if (!ClassList[classKey]) {
    ClassList[classKey] = { name: classKey, subclasses: ['', []] };
  }
  if (!ClassList[classKey].subclasses) {
    ClassList[classKey].subclasses = ['', []];
  }
  if (!Array.isArray(ClassList[classKey].subclasses[1])) {
    ClassList[classKey].subclasses[1] = [];
  }
  if (ClassList[classKey].subclasses[1].indexOf(fullKey) === -1) {
    ClassList[classKey].subclasses[1].push(fullKey);
  }
  return obj;
}

// ── Stubs for PDF/form manipulation calls ────────────────────────────────────
var CurrentSources = {
  weapExcl: { eject: function() { return -1; }, indexOf: function() { return -1; }, includes: function() { return false; } },
  ammoExcl: { eject: function() { return -1; }, indexOf: function() { return -1; }, includes: function() { return false; } },
};
function SetWeaponsdropdown()  {}
function SetAmmosdropdown()    {}
function How()                 { return 0; }
function What()                { return ''; }
function Value()               {}
function show()                {}
function hide()                {}
function processActions()      {}
function tDoc_text()           { return ''; }
function AddAction()           {}
function AddSpell()            {}

/**
 * defaultSpellTable — half-caster (Paladin / Ranger) spell slot table.
 * Indexed 0–10; the files access it via defaultSpellTable[Math.ceil(level/2)].
 * Each row = [1st,2nd,3rd,4th,5th,6th,7th,8th,9th] spell slots.
 */
var defaultSpellTable = [
  [0,0,0,0,0,0,0,0,0],   // index 0 (unused)
  [2,0,0,0,0,0,0,0,0],   // index 1  → levels 1–2
  [3,0,0,0,0,0,0,0,0],   // index 2  → levels 3–4
  [4,2,0,0,0,0,0,0,0],   // index 3  → levels 5–6
  [4,3,0,0,0,0,0,0,0],   // index 4  → levels 7–8
  [4,3,2,0,0,0,0,0,0],   // index 5  → levels 9–10
  [4,3,3,0,0,0,0,0,0],   // index 6  → levels 11–12
  [4,3,3,1,0,0,0,0,0],   // index 7  → levels 13–14
  [4,3,3,2,0,0,0,0,0],   // index 8  → levels 15–16
  [4,3,3,3,1,0,0,0,0],   // index 9  → levels 17–18
  [4,3,3,3,2,0,0,0,0],   // index 10 → levels 19–20
];

/** sentientItemConflictTxt — boilerplate appended to sentient magic item descriptions */
var sentientItemConflictTxt = "Sentient Item Conflict: If this item's alignment is opposed to yours, you take 1d6 Psychic damage each hour you remain attuned to it. Resolve the conflict as described in the Dungeon Master's Guide.";

/**
 * FightingStyles — global registry of fighting style feature objects.
 * XGtE references FightingStyles.dueling and FightingStyles.two_weapon
 * to embed them directly inside subclass feature choice entries.
 */
var FightingStyles = {
  dueling: {
    name: "Dueling",
    description: desc([
      "When I am wielding a melee weapon in one hand and no other weapons, +2 to damage rolls",
    ]),
    calcChanges: {
      atkCalc: [
        function(fields, v, output) {
          if (v.isMeleeWeapon && !v.isNaturalWeapon && !v.isOffHand &&
              !(/\b(2|two|double).?hand/i).test(fields.Description)) {
            output.extraDmg += 2;
          }
        },
        "When I am wielding a melee weapon in one hand and no other weapons, I gain a +2 bonus to damage rolls with that weapon."
      ]
    }
  },
  great_weapon: {
    name: "Great Weapon Fighting",
    description: desc([
      "When I roll a 1 or 2 on a damage die for an attack with a two-handed or versatile weapon, I can reroll that die",
    ]),
  },
  two_weapon: {
    name: "Two-Weapon Fighting",
    description: desc([
      "When engaging in two-weapon fighting, I can add my ability modifier to the damage of the extra attack",
    ]),
  },
  defense: {
    name: "Defense",
    description: desc(["When I am wearing armor, I gain a +1 bonus to AC"]),
    extraAC: { mod: 1, text: "Defense fighting style: +1 AC when wearing armor", stopeval: "This creature isn't wearing armor" }
  },
  protection: {
    name: "Protection",
    description: desc(["When a creature I can see attacks a target other than me within 5 ft, I can use my reaction to impose disadvantage (requires shield)"]),
  },
  archery: {
    name: "Archery",
    description: desc(["I gain a +2 bonus to attack rolls with ranged weapons"]),
    calcChanges: {
      atkCalc: [
        function(fields, v, output) { if (v.isRangedWeapon && !v.isNaturalWeapon) output.extraHit += 2; },
        "Ranged weapons get +2 to hit."
      ]
    }
  },
  blind_fighting: {
    name: "Blind Fighting",
    description: desc(["I have Blindsight with a range of 10 feet"]),
    vision: [["Blindsight", 10]],
  },
  interception: {
    name: "Interception",
    description: desc(["When a creature I can see hits a target other than me within 5 ft with an attack, I can use my reaction and roll 1d10 + my proficiency bonus to reduce the damage"]),
  },
  thrown_weapon: {
    name: "Thrown Weapon Fighting",
    description: desc(["I can draw a weapon that has the thrown property as part of the attack I make with the weapon; +2 to damage rolls with thrown weapons"]),
  },
  unarmed_fighting: {
    name: "Unarmed Fighting",
    description: desc(["My unarmed strikes deal 1d6 bludgeoning damage (1d8 if no shield) and can grapple on hit"]),
  },
  superior_technique: {
    name: "Superior Technique",
    description: desc(["I learn one maneuver from the Battle Master subclass and gain one superiority die (d6)"]),
  },
};

/**
 * ProficiencyBonusList — proficiency bonus by character level (index 0 = level 1).
 * Used by WBtW's Harengon race feature.
 */
var ProficiencyBonusList = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];

/**
 * AddRacialVariant — registers a sub-variant of a race (e.g. dragonborn colour variants).
 * Entries are stored in RaceSubList under 'parentRaceKey-variantKey'.
 */
function AddRacialVariant(raceKey, variantKey, obj) {
  var fullKey = raceKey + '-' + variantKey;
  obj._parentRace = raceKey;
  obj._variantKey = variantKey;
  RaceSubList[fullKey] = obj;
  // Link back to parent if it exists and has a variants array
  if (RaceList[raceKey] && Array.isArray(RaceList[raceKey].variants)) {
    if (RaceList[raceKey].variants.indexOf(fullKey) === -1) {
      RaceList[raceKey].variants.push(fullKey);
    }
  }
  return obj;
}

/**
 * ConvertToMetric — used in WBtW Harengon feature; just returns input unchanged
 * (metric conversion is a display concern handled by the app).
 */
function ConvertToMetric(str) { return str; }

/** addEvals — registers global calculation hooks; no-op for data extraction */
function addEvals() {}

/** newObj — MPMB deep-clone utility; equivalent to a JSON round-trip clone */
function newObj(obj) {
  if (obj === null || obj === undefined) return obj;
  try { return JSON.parse(JSON.stringify(obj)); } catch(e) { return obj; }
}

/** CurrentUpdates — PDF form update tracker; stub with mutable types array */
var CurrentUpdates = { types: [] };

/**
 * sheetVersion — numeric form of the MPMB sheet version (major*1e6 + minor*1e3 + patch).
 * All_WizOfTheCoast+UnearthedArc.js requires >= 13002003 (v13.2.3); set to that
 * exact value so the version guard passes without throwing.
 */
var sheetVersion = 13002003;

/**
 * CurrentVars — MPMB character-state bag used for dynamic calculations.
 * Properties accessed by the WotC aggregation file are stubbed here so the
 * file can load without throwing; the values are never used during extraction.
 */
var CurrentVars = {
  manual:              {},
  extraArmour:         {},
  CoA_Corruption:      0,
  sidekickDialogShown: false,
  sidekickHD:          [],
};

/**
 * Current* state objects — MPMB stores active character state in these globals.
 * Stubbed as empty objects so property accesses inside function bodies don't
 * throw at file-load time; none of these functions are ever called during data
 * extraction.
 */
var CurrentRace       = { known: '', variant: '', level: 0, dmgres: [] };
var CurrentClasses    = {};
var CurrentProfs      = { weapon: { otherWep: [], staveWep: [] }, armor: {}, tool: {}, save: {}, skill: {} };
var CurrentArmour     = { known: '' };
var CurrentWeapons    = { known: [] };
var CurrentSpells     = {};
var CurrentMagicItems = {};
var CurrentFeats      = { known: [] };
var CurrentCompRace   = {};
var CurrentBackground = { known: '' };

/**
 * Add* helper stubs — MPMB API calls that mutate the live PDF character sheet.
 * For data-extraction purposes these are no-ops; the actual content they would
 * add is already captured by the direct-assignment writes to the container
 * objects (ClassList, FeatsList, etc.) earlier in the same source file.
 */
function AddFightingStyle()          {}
function AddFeat()                   {}
function AddFeature()                {}
function AddMagicItem()              {}
function AddString()                 {}
function AddToInv()                  {}
function AddToModFld()               {}
function AddTooltip()                {}
function AddWarlockPactBoon()        {}
function AddWeapon()                 {}
function SetProf()                   {}
function Checkbox()                  { return false; }
function CreateClassFeatureVariant() {}
function CreateSpellList()           {}

/**
 * isArray — MPMB uses a bare isArray() shorthand (not Array.isArray).
 * Delegate to the standard implementation.
 */
function isArray(v) { return Array.isArray(v); }

/**
 * app — AcroJS PDF application object; stubbed as a minimal object so code
 * that calls app.alert() or reads app.fromPDFCoords() doesn't throw.
 */
var app = {
  alert:         function() {},
  response:      function() { return null; },
  fromPDFCoords: function() { return 0; },
  runtimeHighlight: false,
};

/**
 * FieldNumbers — MPMB form field count constants referenced inside calcChanges
 * function bodies. The functions are never called during extraction so only
 * the object needs to exist to prevent reference errors.
 */
var FieldNumbers = { actions: 3, bonus_actions: 3, infoboxes: 3 };

/**
 * WarlockInvocationsList — dedicated container for Eldritch Invocations,
 * equivalent to how subclasses use ClassSubList.
 */
var WarlockInvocationsList = {};

/**
 * AddWarlockInvocation(name, obj) — registers a Warlock Eldritch Invocation.
 * The name also serves as the _key.
 */
function AddWarlockInvocation(invocationName, obj) {
  var key = invocationName.toLowerCase().replace(/\s+/g, '_');
  obj._key         = key;
  obj._displayName = invocationName;
  WarlockInvocationsList[key] = obj;
}

/**
 * BackgroundVariantsList — sub-variants of existing backgrounds
 * (e.g. "Luxonborn" variant of the Acolyte background).
 */
var BackgroundVariantsList = {};

/**
 * AddBackgroundVariant(bgKey, variantKey, obj) — registers a variant.
 * Also links it back to the parent BackgroundList entry.
 */
function AddBackgroundVariant(bgKey, variantKey, obj) {
  var fullKey = bgKey + '-' + variantKey;
  obj._parentBackground = bgKey;
  obj._variantKey       = variantKey;
  BackgroundVariantsList[fullKey] = obj;
  if (BackgroundList[bgKey]) {
    if (!BackgroundList[bgKey]._variants) BackgroundList[bgKey]._variants = [];
    BackgroundList[bgKey]._variants.push(fullKey);
  }
  return obj;
}

/**
 * RunFunctionAtEnd(fn) — MPMB defers fn until after all scripts are loaded,
 * so that newly added classes/weapons are visible. For our extraction we just
 * call it immediately since all data is collected sequentially.
 */
function RunFunctionAtEnd(fn) {
  try { fn(); } catch(e) { /* deferred call failed; skip */ }
}

/**
 * GenericClassFeatures — a MPMB registry of reusable class feature objects
 * that subclasses (XGtE etc.) can reference by key to inherit calcChanges.
 */
var GenericClassFeatures = {
  "potent spellcasting": {
    name: "Potent Spellcasting",
    description: desc(["I add my Wisdom modifier to the damage I deal with my cleric cantrips"]),
    calcChanges: {
      atkCalc: [
        function(fields, v, output) {
          if (v.isSpell && v.spellLevel === 0) {
            output.extraDmg += How("Wis Mod");
          }
        },
        "I add my Wisdom modifier to the damage I deal with my cantrips."
      ]
    }
  },
  "empowered evocation": {
    name: "Empowered Evocation",
    description: desc(["I add my Intelligence modifier to the damage I deal with wizard evocation spells"]),
    calcChanges: {
      atkCalc: [
        function(fields, v, output) {
          if (v.isSpell) output.extraDmg += How("Int Mod");
        },
        "I add my Intelligence modifier to the damage I deal with any wizard evocation spell I cast."
      ]
    }
  },
};

/**
 * FeatureChoicesList — collects all AddFeatureChoice() calls for the app.
 * Keyed by "<classKey>.<featureKey>.<choiceName>".
 */
var FeatureChoicesList = {};

/**
 * AddFeatureChoice(featureObj, bOptional, choiceName, choiceObj, optionalCategory)
 * Attaches an optional sub-choice to an existing class feature object and
 * records it in FeatureChoicesList for the companion app.
 */
function AddFeatureChoice(featureObj, bOptional, choiceName, choiceObj, optionalCategory) {
  if (!featureObj) return;
  // Attach directly onto the feature so it travels with it into JSON
  if (!featureObj._optionalChoices) featureObj._optionalChoices = [];
  featureObj._optionalChoices.push(Object.assign({
    _choiceName: choiceName,
    _optional: !!bOptional,
    _optionalCategory: optionalCategory || '',
  }, choiceObj));
}

// ─────────────────────────────────────────────────────────────────────────────
// VM SANDBOX
// ─────────────────────────────────────────────────────────────────────────────
const sandbox = {
  // ── Data lists ──────────────────────────────────────────────────────────
  SourceList, ClassList, ClassSubList, SpellsList,
  RaceList, RaceSubList, BackgroundList, BackgroundFeatureList,
  FeatsList, WeaponsList, ArmourList, AmmoList,
  ToolsList, GearList, PacksList, MagicItemsList,
  CreatureList, CompanionList, PsionicsList,

  // ── MPMB API ─────────────────────────────────────────────────────────────
  AddSubClass, RequiredSheetVersion,
  desc, toUni, tDoc, sourceCategories,
  AtHigherLevels, PsychicFocus, levels, typePF: false, typeA4: false,
  CurrentSources,
  SetWeaponsdropdown, SetAmmosdropdown,
  How, What, Value, show, hide, processActions, tDoc_text,
  AddAction, AddSpell,
  defaultSpellTable, sentientItemConflictTxt,
  FightingStyles, ProficiencyBonusList,
  AddRacialVariant, ConvertToMetric,
  RunFunctionAtEnd, GenericClassFeatures,
  FeatureChoicesList, AddFeatureChoice,
  addEvals, newObj, CurrentUpdates, FieldNumbers, sheetVersion,
  CurrentVars, CurrentRace, CurrentClasses, CurrentProfs, CurrentArmour,
  CurrentWeapons, CurrentSpells, CurrentMagicItems, CurrentFeats,
  CurrentCompRace, CurrentBackground,
  AddFightingStyle, AddFeat, AddFeature, AddMagicItem, AddString,
  AddToInv, AddToModFld, AddTooltip, AddWarlockPactBoon, AddWeapon,
  SetProf, Checkbox, app,
  CreateClassFeatureVariant, CreateSpellList, isArray,
  WarlockInvocationsList, AddWarlockInvocation,
  BackgroundVariantsList, AddBackgroundVariant,

  // ── Standard JS globals ───────────────────────────────────────────────────
  // Wrap console to add console.println() — used by Acrobat/MPMB scripts as
  // an alias for console.log().  All other console methods pass through.
  console: Object.assign(Object.create(null), console, { println: function() { console.log.apply(console, arguments); } }),
  Math,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  String, Number, Boolean, Array, Object, RegExp, Function, JSON, Error,
  Symbol, Map, Set, WeakMap, WeakSet, Promise,
  setTimeout: function(fn, ms) {},
  clearTimeout: function() {},

  // ── Mutable file-level var ────────────────────────────────────────────────
  iFileName: '',
};

vm.createContext(sandbox);

// ─────────────────────────────────────────────────────────────────────────────
// FILE LISTS
//   SRD files first — they use Base_* variable names and are merged into the
//   standard sandbox containers before the primary source books run.
//   Non-SRD books are processed second so their more-detailed versions
//   naturally override any SRD entries with the same key.
// ─────────────────────────────────────────────────────────────────────────────
const SRD_FILES = [
  { file: 'SRD/ListsSpells.js',      desc: 'SRD – base spells'                              },
  { file: 'SRD/ListsClasses.js',     desc: 'SRD – base classes & subclasses'               },
  { file: 'SRD/ListsRaces.js',       desc: 'SRD – base races & racial variants'             },
  { file: 'SRD/ListsBackgrounds.js', desc: 'SRD – base backgrounds & background features'   },
  { file: 'SRD/ListsFeats.js',       desc: 'SRD – base feats'                               },
  { file: 'SRD/ListsGear.js',        desc: 'SRD – weapons, armor, ammo, gear, tools, packs' },
  { file: 'SRD/ListsMagicItems.js',  desc: 'SRD – base magic items'                         },
  { file: 'SRD/ListsCreatures.js',   desc: 'SRD – base creatures'                           },
  { file: 'SRD/ListsCompanions.js',  desc: 'SRD – companion types'                          },
];

const FILES = [
  { file: 'Player_Handbook.js',            desc: '2024 PHB – classes, races, spells, equipment'   },
  { file: 'DungeonMasterGuide.js',         desc: '2024 DMG – magic items, supernatural gifts'      },
  { file: 'Xans_Guide_To_Everything.js',   desc: 'XGtE – subclasses, spells, feats'               },
  { file: 'MonsterManual.js',              desc: '2025 MM – creatures'                             },
  { file: 'Exp_Guide_To_Wildemount.js',    desc: 'EGtW – races, subclasses, spells, magic items'  },
  { file: 'Van_Richten_Guide2Ravenloft.js',desc: 'VRGtR – lineages, backgrounds, feats'           },
  { file: 'Wild_Beyond_the_Witch.js',      desc: 'WBtW – backgrounds, races, magic items'         },
];

const runStats = {};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: run a batch of source files and record success/failure in runStats.
// ─────────────────────────────────────────────────────────────────────────────
function runBatch(fileList) {
  for (let fi = 0; fi < fileList.length; fi++) {
    const entry    = fileList[fi];
    const filePath = path.join(__dirname, entry.file);
    process.stdout.write('  Processing ' + entry.file + ' ... ');
    const t0 = Date.now();
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      vm.runInContext(code, sandbox, { filename: entry.file, timeout: 60000 });
      const ms = Date.now() - t0;
      console.log('✓  (' + ms + 'ms)');
      runStats[entry.file] = 'ok';
    } catch (err) {
      console.log('✗');
      console.error("    └─ " + (err.stack || err.message));
      runStats[entry.file] = err.message;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: merge an SRD Base_* sandbox variable into a standard container.
// Uses "fill-gaps" semantics — only copies keys not already present so that
// non-SRD books (processed afterward) win on any duplicate.
// ─────────────────────────────────────────────────────────────────────────────
function mergeBase(srcKey, target) {
  var src = sandbox[srcKey];
  if (!src || typeof src !== 'object') return 0;
  var added = 0;
  Object.keys(src).forEach(function(k) {
    if (!target[k]) { target[k] = src[k]; added++; }
  });
  return added;
}

// ─────────────────────────────────────────────────────────────────────────────
// After running SRD files, promote their Base_* containers into the shared
// standard containers so non-SRD books can reference and extend them.
// ─────────────────────────────────────────────────────────────────────────────
function mergeSRDBase() {
  console.log('\n  Merging SRD Base_* containers into standard containers …');

  // Simple fill-gap merges ─────────────────────────────────────────────────
  var simpleMerges = [
    ['Base_ClassList',             ClassList            ],
    ['Base_SpellsList',            SpellsList           ],
    ['Base_ArmourList',            ArmourList           ],
    ['Base_WeaponsList',           WeaponsList          ],
    ['Base_AmmoList',              AmmoList             ],
    ['Base_PacksList',             PacksList            ],
    ['Base_GearList',              GearList             ],
    ['Base_ToolsList',             ToolsList            ],
    ['Base_MagicItemsList',        MagicItemsList       ],
    ['Base_CreatureList',          CreatureList         ],
    ['Base_CompanionList',         CompanionList        ],
    ['Base_BackgroundList',        BackgroundList       ],
    ['Base_BackgroundFeatureList', BackgroundFeatureList],
    ['Base_FeatsList',             FeatsList            ],
  ];

  var totalAdded = 0;
  simpleMerges.forEach(function(pair) {
    var n = mergeBase(pair[0], pair[1]);
    if (n > 0) console.log('    ✓  ' + pair[0] + ' +' + n);
    totalAdded += n;
  });

  // Base_RaceList — merge races first so AddRacialVariant can link to them ──
  var n = mergeBase('Base_RaceList', RaceList);
  if (n > 0) console.log('    ✓  Base_RaceList +' + n);
  totalAdded += n;

  // Base_RaceSubList — use AddRacialVariant to maintain parent ↔ variant links
  var baseRaceSub = sandbox['Base_RaceSubList'];
  if (baseRaceSub && typeof baseRaceSub === 'object') {
    var rAdded = 0;
    Object.keys(baseRaceSub).forEach(function(fullKey) {
      if (RaceSubList[fullKey]) return; // non-SRD version already present
      var obj      = baseRaceSub[fullKey];
      var dashIdx  = fullKey.indexOf('-');
      if (dashIdx === -1) return;
      var raceKey    = fullKey.substring(0, dashIdx);
      var variantKey = fullKey.substring(dashIdx + 1);
      AddRacialVariant(raceKey, variantKey, obj);
      rAdded++;
    });
    if (rAdded > 0) console.log('    ✓  Base_RaceSubList +' + rAdded);
    totalAdded += rAdded;
  }

  // Base_ClassSubList — use AddSubClass to wire parent ↔ subclass links ─────
  var baseSubs = sandbox['Base_ClassSubList'];
  if (baseSubs && typeof baseSubs === 'object') {
    var sAdded = 0;
    Object.keys(baseSubs).forEach(function(fullKey) {
      if (ClassSubList[fullKey]) return; // non-SRD version already present
      var obj     = baseSubs[fullKey];
      var dashIdx = fullKey.indexOf('-');
      if (dashIdx === -1) return;
      var classKey = fullKey.substring(0, dashIdx);
      var subKey   = fullKey.substring(dashIdx + 1);
      AddSubClass(classKey, subKey, obj);
      sAdded++;
    });
    if (sAdded > 0) console.log('    ✓  Base_ClassSubList +' + sAdded);
    totalAdded += sAdded;
  }

  // Add SRD as a recognized source ──────────────────────────────────────────
  if (!SourceList['SRD']) {
    SourceList['SRD'] = {
      name:                   'Systems Reference Document 5.1',
      abbreviation:           'SRD',
      abbreviationSpellsheet: 'SRD',
      group:                  'Core Sources',
      url:                    'https://dnd.wizards.com/resources/systems-reference-document',
      date:                   '2023/01/26',
    };
    console.log('    ✓  Added SRD source entry');
  }

  console.log('  ── SRD merge complete: ' + totalAdded + ' entries added\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROCESSING
// ─────────────────────────────────────────────────────────────────────────────
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║   MPMB Character Sheet → JSON Converter                         ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log('── Phase 1: SRD (Systems Reference Document) ───────────────────────');
runBatch(SRD_FILES);
mergeSRDBase();

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2: All WotC + Unearthed Arcana
//
//   This massive aggregation file (~3.8 MB minified) covers ~51 source books
//   using direct dot-notation writes (ClassList.foo = {...}, etc.) and ~223
//   AddSubClass / ~69 AddRacialVariant calls.
//
//   It runs AFTER the SRD (Phase 1) and BEFORE the curated individual book
//   files (Phase 3).  Running it here means:
//     • It operates on SRD-format data it was authored for (no compat issues).
//     • Phase 3 individual books apply last and remain authoritative on
//       anything they cover.
//
//   Duplicate-check logic (snapshot → run → report, no restoration needed):
//     1. Snapshot all container key sets right after the SRD merge.
//     2. Run the file (it freely overwrites SRD entries and adds new ones).
//     3. Report: keys already in SRD = "srd_updated"; new keys = "new_entries".
//        All_WotC's versions replace SRD's; Phase 3 then overrides both.
// ─────────────────────────────────────────────────────────────────────────────
console.log('── Phase 2: All WotC + Unearthed Arcana ─────────────────────────────');

/** All containers that All_WotC writes to (directly or via helper functions). */
var WOTC_TRACKED = [
  { name: 'SourceList',            obj: SourceList            },
  { name: 'ClassList',             obj: ClassList             },
  { name: 'ClassSubList',          obj: ClassSubList          },
  { name: 'SpellsList',            obj: SpellsList            },
  { name: 'RaceList',              obj: RaceList              },
  { name: 'RaceSubList',           obj: RaceSubList           },
  { name: 'BackgroundList',        obj: BackgroundList        },
  { name: 'BackgroundFeatureList', obj: BackgroundFeatureList },
  { name: 'FeatsList',             obj: FeatsList             },
  { name: 'WeaponsList',           obj: WeaponsList           },
  { name: 'ArmourList',            obj: ArmourList            },
  { name: 'AmmoList',              obj: AmmoList              },
  { name: 'ToolsList',             obj: ToolsList             },
  { name: 'GearList',              obj: GearList              },
  { name: 'PacksList',             obj: PacksList             },
  { name: 'MagicItemsList',        obj: MagicItemsList        },
  { name: 'CreatureList',          obj: CreatureList          },
  { name: 'CompanionList',         obj: CompanionList         },
  { name: 'WarlockInvocationsList',obj: WarlockInvocationsList},
  { name: 'BackgroundVariantsList',obj: BackgroundVariantsList},
  { name: 'PsionicsList',          obj: PsionicsList          },
];

// 1. Snapshot key sets after the SRD merge (baseline for duplicate reporting)
var preWotcKeys = {};
WOTC_TRACKED.forEach(function(c) {
  preWotcKeys[c.name] = new Set(Object.keys(c.obj));
});

// 1b. Extend the VM-internal RegExp.prototype so All_WotC code can call
//     .replace() and .indexOf() on regExpSearch values that were stored as
//     actual RegExp objects by the SRD files.  We access the VM's own RegExp
//     prototype via a regex literal (not via the sandbox's host-realm RegExp).
//     Both methods delegate to the pattern source string; the returned strings
//     are stored back into regExpSearch, which is fine for JSON extraction.
//     Object.defineProperty keeps the new methods non-enumerable, matching
//     the behaviour of built-in prototype methods and preventing surprises in
//     for…in loops or Object.keys() reflection on RegExp instances.
vm.runInContext(
  '(function() {' +
  '  var _p = Object.getPrototypeOf(/x/);' +
  '  Object.defineProperty(_p, "replace", {' +
  '    value: function() {' +
  '      return String.prototype.replace.apply(this.source, arguments);' +
  '    }, enumerable: false, configurable: true, writable: true' +
  '  });' +
  '  Object.defineProperty(_p, "indexOf", {' +
  '    value: function() {' +
  '      return String.prototype.indexOf.apply(this.source, arguments);' +
  '    }, enumerable: false, configurable: true, writable: true' +
  '  });' +
  '}());',
  sandbox
);

// 2. Run the file
var wotcReport = {
  new_entries:     {},
  srd_updated:     {},
  total_new:       0,
  total_srd_updated: 0,
};
const wotcFile = 'All_WizOfTheCoast+UnearthedArc.js';
process.stdout.write('  Processing ' + wotcFile + ' ... ');
const wotcT0 = Date.now();
try {
  let wotcCode = fs.readFileSync(path.join(__dirname, wotcFile), 'utf8');

  // ── Pre-run patches ──────────────────────────────────────────────────────
  // BoMT.to1stPerson() replace callback: the capture group `n` corresponds to
  // the optional pattern ( \(.*?\))? and can be `undefined` when no parenthetical
  // source citation follows a >>text<<. marker.  Guard both uses with (n||"").
  //
  // The target string is matched with a regex so we can assert exactly one hit.
  // A count of 0 means the upstream file changed formatting; failing fast here
  // produces a clear diagnostic instead of a cryptic runtime error later.
  const BOMT_PATCH_RE = /t\.toUpperCase\(\)\+n\.toLowerCase\(\)\+"\\n   ":a\+t\+n\+": "/g;
  const patchMatches = wotcCode.match(BOMT_PATCH_RE);
  if (!patchMatches || patchMatches.length !== 1) {
    throw new Error(
      'Pre-run patch: expected exactly 1 match for BoMT.to1stPerson() target, ' +
      'found ' + (patchMatches ? patchMatches.length : 0) + '. ' +
      'The upstream file may have changed; review the patch in convert.js.'
    );
  }
  wotcCode = wotcCode.replace(
    BOMT_PATCH_RE,
    't.toUpperCase()+(n||"").toLowerCase()+"\\n   ":a+t+(n||"")+": "'
  );

  vm.runInContext(wotcCode, sandbox, { filename: wotcFile, timeout: 120000 });
  console.log('✓  (' + (Date.now() - wotcT0) + 'ms)');
  runStats[wotcFile] = 'ok';
} catch (err) {
  console.log('✗');
  const col = err.stack && err.stack.match(/:2:(\d+)/);
  console.error('    └─ ' + err.message + (col ? ' (col ' + col[1] + ')' : ''));
  runStats[wotcFile] = err.message;
}

// 3. Report new entries vs SRD-updates (no restoration — All_WotC wins over SRD)
WOTC_TRACKED.forEach(function(c) {
  var srdKeys  = preWotcKeys[c.name];
  var newCount = 0, updCount = 0;
  Object.keys(c.obj).forEach(function(k) {
    if (srdKeys.has(k)) updCount++;
    else                newCount++;
  });
  if (newCount > 0) wotcReport.new_entries[c.name]  = newCount;
  if (updCount > 0) wotcReport.srd_updated[c.name]  = updCount;
  wotcReport.total_new         += newCount;
  wotcReport.total_srd_updated += updCount;
});

console.log(
  '  ── All WotC: +' + wotcReport.total_new + ' new entries, ' +
  wotcReport.total_srd_updated + ' SRD entries updated\n'
);

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3: Primary source books (final authority — override All_WotC + SRD)
// ─────────────────────────────────────────────────────────────────────────────
console.log('── Phase 3: Primary source books ────────────────────────────────────');
runBatch(FILES);

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4: ExpandedScripts — UA 2024/2025 classes, subclasses, and setting
//          content that extends or replaces entries from earlier phases.
//
//  Load order rules:
//    • Parent/base entries must precede their update files.
//    • Within a dependency chain (e.g. Artificer → ArtificerUpdate →
//      EberronArtificer) each file's legacyClassRefactor /
//      legacySubClassRefactor calls archive the previous version and write
//      the new one — so last writer wins, which is the desired behaviour.
//    • Independent new-content files (AdventuresInFearun, RealmsSubclass,
//      ThePsion, Arcane_Subclass) run first so their entries are present
//      before any update file references them.
//    • HeroesOfFearun runs after RealmsSubclass because it calls
//      legacySubClassRefactor with replaces: pointing at several
//      RealmsSubclass keys (Knowledge Domain, Purple Dragon Knight,
//      Bladesinging).
//    • PsionUpdate runs after ThePsion so its SpellsList writes are the
//      authoritative final definitions for all shared psion spells.
// ─────────────────────────────────────────────────────────────────────────────
const EXPANDED_FILES = [
  // ── New standalone content (no dependencies) ─────────────────────────────
  { file: 'ExpandedScripts/AdventuresInFearun.js',       desc: 'FR:AiF / NF – magic items & creatures'                         },

  // ── FR subclasses: base UA → official FRHoF expansion ────────────────────
  { file: 'ExpandedScripts/RealmsSubclass.js',           desc: 'UA2025 Realms – 8 FR base subclasses (parent)'                 },
  { file: 'ExpandedScripts/HeroesOfFearun.js',           desc: 'FRHoF – races, backgrounds, feats, spells; replaces UA entries'},

  // ── Psion: base class → spell updates ────────────────────────────────────
  { file: 'ExpandedScripts/ThePsion.js',                 desc: 'UA25P – Psion class, 4 subclasses, Wild Talent feats (parent)' },
  { file: 'ExpandedScripts/PsionUpdate.js',              desc: 'UA25P – authoritative Psion spell definitions + new spells'    },

  // ── Arcane subclasses: base UA → UA update ────────────────────────────────
  { file: 'ExpandedScripts/Arcane_Subclass.js',          desc: 'XUA25AS – 9 arcane subclasses (parent)'                       },
  { file: 'ExpandedScripts/Arcane_Subclass_Update.js',   desc: 'XUA25AU – replaces all 9 arcane subclasses with revised forms' },

  // ── Artificer: UA 2024 → UA 2025 update → Eberron expansion ─────────────
  { file: 'ExpandedScripts/Artificer.js',                desc: 'XUA24A – Artificer class, Alchemist/Artillerist/Battle Smith/Armorer (parent)'},
  { file: 'ExpandedScripts/ArtificerUpdate.js',          desc: 'XUA25EU – updates Artificer class features; adds Cartographer' },
  { file: 'ExpandedScripts/EberronArtificer.js',         desc: 'E:FA – Eberron Artificer; scaled elixirs, Dragonmark feats/items'},
];

console.log('── Phase 4: ExpandedScripts (UA 2024/2025 + setting content) ─────────');
runBatch(EXPANDED_FILES);

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT
// ─────────────────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, 'json_data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function writeJSON(filename, data) {
  const filePath = path.join(outDir, filename);
  const json     = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
  const count = Array.isArray(data) ? data.length : Object.keys(data).length;
  const kb    = Math.round(json.length / 1024);
  console.log(
    '  ✓  ' +
    filename.padEnd(38) +
    String(count).padStart(5) + ' entries' +
    String(kb).padStart(7)   + ' KB'
  );
}

console.log('\n──────────────────────────────────────────────────────────────────');
console.log('  Writing JSON → ./json_data/');
console.log('──────────────────────────────────────────────────────────────────');

writeJSON('sources.json',              serialize(SourceList));
writeJSON('classes.json',              listToArray(ClassList));
writeJSON('subclasses.json',           listToArray(ClassSubList));
writeJSON('spells.json',               listToArray(SpellsList));
writeJSON('races.json',                listToArray(RaceList));
writeJSON('race_variants.json',        listToArray(RaceSubList));
writeJSON('backgrounds.json',          listToArray(BackgroundList));
writeJSON('background_features.json',  listToArray(BackgroundFeatureList));
writeJSON('feats.json',                listToArray(FeatsList));
writeJSON('weapons.json',              listToArray(WeaponsList));
writeJSON('armor.json',                listToArray(ArmourList));
writeJSON('ammo.json',                 listToArray(AmmoList));
writeJSON('tools.json',                listToArray(ToolsList));
writeJSON('gear.json',                 listToArray(GearList));
writeJSON('packs.json',                listToArray(PacksList));
writeJSON('magic_items.json',          listToArray(MagicItemsList));
writeJSON('creatures.json',            listToArray(CreatureList));
writeJSON('companions.json',            listToArray(CompanionList));
writeJSON('warlock_invocations.json',  listToArray(WarlockInvocationsList));
writeJSON('background_variants.json',  listToArray(BackgroundVariantsList));
writeJSON('psionics.json',             listToArray(PsionicsList));

// ── Manifest ─────────────────────────────────────────────────────────────────
const manifest = {
  generated: new Date().toISOString(),
  converter_version: '1.0.0',
  source_files: runStats,
  wotc_duplicate_report: wotcReport,
  entry_counts: {
    sources:              Object.keys(SourceList).length,
    classes:              Object.keys(ClassList).length,
    subclasses:           Object.keys(ClassSubList).length,
    spells:               Object.keys(SpellsList).length,
    races:                Object.keys(RaceList).length,
    race_variants:        Object.keys(RaceSubList).length,
    backgrounds:          Object.keys(BackgroundList).length,
    background_features:  Object.keys(BackgroundFeatureList).length,
    feats:                Object.keys(FeatsList).length,
    weapons:              Object.keys(WeaponsList).length,
    armor:                Object.keys(ArmourList).length,
    ammo:                 Object.keys(AmmoList).length,
    tools:                Object.keys(ToolsList).length,
    gear:                 Object.keys(GearList).length,
    packs:                Object.keys(PacksList).length,
    magic_items:          Object.keys(MagicItemsList).length,
    creatures:              Object.keys(CreatureList).length,
    companions:             Object.keys(CompanionList).length,
    warlock_invocations:    Object.keys(WarlockInvocationsList).length,
    background_variants:    Object.keys(BackgroundVariantsList).length,
    psionics:               Object.keys(PsionicsList).length,
  },
  /**
   * JSON field reference for the companion web app.
   *
   * Each entry below documents the fields that appear in that JSON file and
   * how the web app should interpret them.
   *
   * Special serialised types:
   *   { _type:"RegExp",   source, flags }  → rebuild with new RegExp(source, flags)
   *   { _type:"function", body }           → store as descriptive text; implement
   *                                          logic natively in the app
   */
  field_reference: {
    sources: {
      _key:                 "Source abbreviation used as ID (e.g. 'P24', 'D24')",
      name:                 "Full source book name",
      abbreviation:         "Short display code",
      abbreviationSpellsheet: "Abbreviation used on spell sheets",
      group:                "Category: 'Core Sources' | 'Primary Sources' | 'Campaign Sourcebooks' | 'Adventure Books'",
      url:                  "D&D Beyond product URL",
      date:                 "Publication date YYYY/MM/DD",
      campaignSetting:      "(optional) Campaign setting name",
      defaultExcluded:      "(optional) true = opt-in content",
    },
    classes: {
      _key:                 "Class ID in lowercase (e.g. 'barbarian')",
      name:                 "Display name",
      source:               "[[sourceAbbr, pageNumber], ...]",
      primaryAbility:       "['Strength', ...]",
      abilitySave:          "Index 1–6 of primary saving throw ability",
      prereqs:              "Multiclass prerequisite string",
      improvements:         "Array[20] of ASI counts per level",
      die:                  "Hit die size (e.g. 12)",
      saves:                "['Str','Con', ...] saving throw proficiencies",
      skillstxt:            "{ primary: 'Choose N from ...' }",
      armorProfs:           "{ primary: [light,medium,heavy,shields], secondary: [...] }",
      weaponProfs:          "{ primary: [simple,martial], secondary: [...] }",
      equipment:            "Starting equipment text",
      subclasses:           "['Subclass Label', [subclassKey, ...]]",
      attacks:              "Array[20] of attacks per turn by level",
      features:             "{ featureKey: { name, source, minlevel, description, ... } }",
    },
    subclasses: {
      _key:                 "'classKey-subclassKey' (e.g. 'barbarian-berserker')",
      _parentClass:         "Parent class key",
      _subKey:              "Subclass key segment",
      regExpSearch:         "{ _type:'RegExp', source, flags } — pattern to match subclass name",
      subname:              "Subclass display name",
      fullname:             "(optional) Combined 'ClassName (SubclassName)'",
      source:               "[[sourceAbbr, page], ...]",
      features:             "{ subclassfeature3: { name, minlevel, description, ... }, ... }",
      spellcastingExtra:    "(optional) Array of spell keys granted to spell list",
      abilitySave:          "(optional) Ability index for subclass DC calculations",
    },
    spells: {
      _key:                 "Spell ID in lowercase (e.g. 'fireball')",
      name:                 "Display name",
      classes:              "['wizard', 'sorcerer', ...] — classes that have access",
      source:               "[[sourceAbbr, page], ...]",
      level:                "Spell level 0–9 (0 = cantrip)",
      school:               "School abbreviation: Abjur|Conj|Div|Ench|Evoc|Illus|Necro|Trans",
      time:                 "Casting time (e.g. '1 a', '1 ba', '1 rea', '1 min', '1 h')",
      range:                "Range string (e.g. '120 ft', 'Touch', 'Self')",
      components:           "Component string (e.g. 'V,S,M')",
      compMaterial:         "(optional) Material component description",
      duration:             "Duration string (e.g. 'Instantaneous', 'Conc, 1 min')",
      save:                 "(optional) Saving throw type (e.g. 'Dex', 'Con')",
      ritual:               "(optional) true if castable as ritual",
      description:          "Short description for character sheet",
      descriptionFull:      "Full spell text",
      descriptionShorter:   "(optional) Even shorter form",
      dynamicDamageBonus:   "(optional) Rules for scaling damage display",
      spellChanges:         "(optional) Modifications when cast via special feature",
    },
    races: {
      _key:                 "Race ID (e.g. 'pallid elf', 'dhampir')",
      name:                 "Display name",
      source:               "[[sourceAbbr, page], ...]",
      plural:               "Plural form",
      size:                 "Size code: 0=Gargantuan,1=Huge,2=Large,3=Medium,4=Small,5=Tiny; array [min,max] for variable-size races",
      speed:                "{ walk:{spd,enc}, fly:{spd,enc}, swim:{spd,enc}, ... }",
      scores:               "Array[6] of ability score bonuses [Str,Dex,Con,Int,Wis,Cha]",
      scoresGeneric:        "(optional) true = player chooses where to assign bonuses",
      vision:               "[['Darkvision', 60], ...]",
      languageProfs:        "['Common', 'Elvish', ...]",
      skills:               "['Perception', ...] proficiencies",
      advantages:           "[['Skill', true/false], ...]",
      savetxt:              "{ text:[], adv_vs:[] }",
      trait:                "Full traits text displayed on character sheet",
      age:                  "Age description string",
      height:               "Height description string",
      weight:               "Weight description string",
      features:             "{ featureKey: { name, minlevel, ... } }",
      spellcastingAbility:  "Ability index (or array) for racial spellcasting",
      spellcastingBonus:    "Array of granted spell objects",
      weaponOptions:        "(optional) Array of innate weapon definitions",
      dmgres:               "(optional) Array of damage resistances",
      extraLimitedFeatures: "(optional) Array of limited-use features",
      useFromPreviousRace:  "(optional) Lineage blending rules",
    },
    race_variants: {
      _key:                 "'race-variant' (e.g. 'dragonborn-black')",
      name:                 "Display name",
      trait:                "Trait text appended to parent race",
      dmgres:               "Damage resistances specific to this variant",
    },
    backgrounds: {
      _key:                 "Background ID (e.g. 'feylost')",
      name:                 "Display name",
      source:               "[[sourceAbbr, page], ...]",
      skills:               "['Skill1', 'Skill2'] proficiencies",
      toolProfs:            "[['Tool name', count], ...]",
      languageProfs:        "[[lang, count], ...]",
      gold:                 "Starting gold",
      equipleft:            "[['item', qty, weight], ...] left column equipment",
      equipright:           "[['item', qty, weight], ...] right column equipment",
      feature:              "Background feature name (key into BackgroundFeatureList)",
      trait:                "Array of d8 personality trait strings",
      ideal:                "Array of [alignment, text] ideal strings",
      bond:                 "Array of bond strings",
      flaw:                 "Array of flaw strings",
      extra:                "(optional) Array of additional random table entries",
      toNotesPage:          "(optional) [{ name, note }] additional rules notes",
    },
    background_features: {
      _key:                 "Feature ID matching background.feature",
      description:          "Full feature description",
      source:               "[[sourceAbbr, page], ...]",
    },
    feats: {
      _key:                 "Feat ID (e.g. 'alert')",
      name:                 "Display name",
      source:               "[[sourceAbbr, page], ...]",
      type:                 "(optional) Feat category (e.g. 'supernatural gifts')",
      prereqs:              "(optional) Prerequisite string",
      description:          "Short description",
      descriptionFull:      "(optional) Full feat text",
      choices:              "(optional) Array of choice names — sub-options are keyed by lowercase choice",
      scores:               "(optional) Array[6] ability score improvements",
      scoresMaximum:        "(optional) Array[6] maximum score caps",
      skills:               "(optional) Skill proficiencies granted",
      skillstxt:            "(optional) Free-text skill choice description",
      action:               "(optional) [['action type', 'label'], ...]",
      usages:               "(optional) Uses per recovery period",
      recovery:             "(optional) Recovery period string",
      spellcastingBonus:    "(optional) Spells granted",
      savetxt:              "(optional) Saving throw text",
      addMod:               "(optional) Numeric modifiers to add",
      extraAC:              "(optional) Extra AC bonus definition",
      toNotesPage:          "(optional) Notes page entries",
    },
    weapons: {
      _key:                 "Weapon ID (e.g. 'longsword')",
      name:                 "Display name",
      infoname:             "(optional) Name with cost (e.g. 'Longsword [15 gp]')",
      source:               "[[sourceAbbr, page], ...]",
      regExpSearch:         "{ _type:'RegExp', source, flags } — match pattern",
      type:                 "Weapon type: 'Simple'|'Martial'|'Natural'|'Other'",
      list:                 "'melee'|'ranged'",
      ability:              "Attack ability index: 1=Str, 2=Dex",
      abilitytodamage:      "true = add ability mod to damage",
      damage:               "[diceCount, diceSize, damageType]",
      range:                "Range string (e.g. 'Melee', '80/320 ft')",
      description:          "Properties string (e.g. 'Light, Finesse')",
      weight:               "Weight in lb",
      monkweapon:           "(optional) true = qualifies as monk weapon",
      dc:                   "(optional) true = uses saving throw instead of attack roll",
    },
    armor: {
      _key:                 "Armor ID (e.g. 'chain mail')",
      name:                 "Display name",
      source:               "[[sourceAbbr, page], ...]",
      regExpSearch:         "{ _type:'RegExp', source, flags }",
      type:                 "'light'|'medium'|'heavy'|'shield'|'magic'|'firstlist'",
      ac:                   "AC value or formula string (e.g. '10+Con')",
      addMod:               "(optional) true = add Dex modifier",
      stealthdis:           "(optional) true = Disadvantage on Stealth",
      strReq:               "(optional) Strength requirement",
      weight:               "(optional) Weight in lb",
      list:                 "(optional) 'firstlist'|'magic' for display ordering",
    },
    ammo: {
      _key:                 "Ammo ID (e.g. 'arrows')",
      name:                 "Display name",
      source:               "[[sourceAbbr, page], ...]",
      icon:                 "Icon label string",
      amount:               "Default stack size",
      weight:               "Weight per unit in lb",
    },
    tools: {
      _key:                 "Tool ID (e.g. \"alchemist's supplies\")",
      name:                 "Display name",
      infoname:             "Name with cost",
      type:                 "Tool category (e.g. \"artisan's tools\", 'musical instrument')",
      weight:               "Weight in lb",
      source:               "[[sourceAbbr, page], ...]",
    },
    gear: {
      _key:                 "Gear ID (e.g. 'rope')",
      name:                 "Display name",
      infoname:             "(optional) Name with cost",
      amount:               "Default quantity",
      weight:               "Weight in lb",
      type:                 "(optional) Category string",
    },
    packs: {
      _key:                 "Pack ID (e.g. 'burglar')",
      name:                 "Pack name with cost",
      source:               "[[sourceAbbr, page], ...]",
      items:                "[['item name', qty, weight], ...]",
    },
    magic_items: {
      _key:                 "Magic item ID (e.g. 'cloak of protection')",
      name:                 "Display name",
      source:               "[[sourceAbbr, page], ...]",
      magicItemTable:       "(optional) Table letter (A–I or '?')",
      type:                 "Item type string (e.g. 'wondrous item', 'armor (light)')",
      rarity:               "'common'|'uncommon'|'rare'|'very rare'|'legendary'|'artifact'",
      description:          "Short description for character sheet",
      descriptionFull:      "(optional) Full item rules text",
      attunement:           "(optional) Attunement requirement string",
      choices:              "(optional) Array of variant names",
      defaultExcluded:      "(optional) true = opt-in item",
      action:               "(optional) [['action type', 'label'], ...]",
      usages:               "(optional) Charges or uses",
      recovery:             "(optional) Recovery period",
      spellcastingBonus:    "(optional) Spells granted by item",
      extraAC:              "(optional) AC bonus definition",
      scores:               "(optional) Array[6] ability score bonuses",
      weaponsAdd:           "(optional) { select: ['weapon name'] }",
      eval:                 "(optional) { _type:'function', body } — evaluated on equip",
    },
    creatures: {
      _key:                 "Creature ID (e.g. 'air elemental')",
      name:                 "Display name",
      nameAlt:              "(optional) Alternative name forms",
      source:               "[[sourceAbbr, page], ...]",
      size:                 "Size code: 0=Gargantuan,1=Huge,2=Large,3=Medium,4=Small,5=Tiny",
      type:                 "Creature type string",
      alignment:            "Alignment string",
      ac:                   "Armor Class number",
      hp:                   "Average hit points",
      hd:                   "[count, dieSize] hit dice",
      speed:                "Speed string (e.g. '30 ft, fly 60 ft')",
      scores:               "Array[6] ability scores [Str,Dex,Con,Int,Wis,Cha]",
      saves:                "(optional) { Str:+N, ... } saving throw bonuses",
      skills:               "(optional) { Perception:+N, ... }",
      damage_resistances:   "(optional) Comma-separated damage types",
      damage_immunities:    "(optional) Comma-separated damage types",
      damage_vulnerabilities:"(optional) Comma-separated damage types",
      condition_immunities: "(optional) Comma-separated conditions",
      senses:               "Senses string",
      languages:            "Languages string",
      challengeRating:      "CR string (e.g. '5', '1/2')",
      proficiencyBonus:     "Proficiency bonus number",
      attacksAction:        "Number of attacks per action",
      attacks:              "[{ name, ability, damage:[n,d,type], range, description, dc? }, ...]",
      traits:               "[{ name, description }, ...] passive traits + Multiattack",
      actions:              "[{ name, description }, ...] action descriptions",
      bonus_actions:        "(optional) [{ name, description }, ...]",
      reactions:            "(optional) [{ name, description }, ...]",
      legendary_actions:    "(optional) [{ name, description }, ...]",
      spellcastingAbility:  "(optional) Spell casting ability index",
      spells:               "(optional) Spell list",
    },
    companions: {
      _key:                 "Companion ID (e.g. 'familiar')",
      name:                 "Display name",
      nameMenu:             "Menu display label",
      source:               "[[sourceAbbr, page], ...]",
      includeCheck:         "{ _type:'function', body } — filters eligible creature types",
      action:               "[['action type', 'label'], ...]",
      notes:                "[{ name, description, joinString }, ...] rule notes",
      attributesAdd:        "{ header, features } additional attributes shown on sheet",
    },
  },
};

writeJSON('_manifest.json', manifest);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║   Conversion complete                                            ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');
console.log('  Entry counts:');
const counts = manifest.entry_counts;
const countKeys = Object.keys(counts);
for (let i = 0; i < countKeys.length; i++) {
  const k = countKeys[i];
  if (counts[k] > 0) {
    console.log('    ' + k.padEnd(26) + String(counts[k]).padStart(5));
  }
}
const total = countKeys.reduce(function(s, k) { return s + counts[k]; }, 0);
console.log('    ' + '─'.repeat(31));
console.log('    ' + 'TOTAL'.padEnd(26) + String(total).padStart(5));
console.log('');
console.log('  File status:');
const fileKeys = Object.keys(runStats);
for (let i = 0; i < fileKeys.length; i++) {
  const f = fileKeys[i];
  const status = runStats[f] === 'ok' ? '✓' : '✗ ' + runStats[f];
  console.log('    ' + (runStats[f] === 'ok' ? '✓' : '✗') + '  ' + f);
}
console.log('');
