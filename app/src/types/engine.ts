/**
 * Character Engine Types
 * 
 * Core type definitions for the character engine system that mirrors the
 * MPMB PDF's dynamic feature processing and calculation hooks.
 * 
 * This corresponds to the PDF's global state objects like:
 * - CurrentVars, CurrentEvals, CurrentProfs, CurrentClasses, CurrentRace, etc.
 */

import type { Character, AbilityIndex, Skill, AttackEntry } from './character';
import type {
  DndClass, DndSubclass, DndRace, DndRaceVariant, DndBackground,
  DndSpell, DndFeat, DndWeapon, DndArmor, DndMagicItem, ClassFeature, MpmbValue
} from './data';

// ─── Calculation Hook Types ──────────────────────────────────────────────────

/** Context passed to attack calculation hooks */
export interface AttackCalcContext {
  weaponKey: string;
  weapon: DndWeapon | null;
  attackType: 'melee' | 'ranged' | 'spell';
  isMelee: boolean;
  isRanged: boolean;
  isSpell: boolean;
  baseAbility: number;
  abilityMod: number;
  proficient: boolean;
  profBonus: number;
  magicBonus: number;
  isOffHand: boolean;
  /** Fields that can be modified by atkCalc hooks */
  fields: {
    Weapon_Attack_Bonus: number;
    Weapon_Damage_Bonus: number;
    Weapon_Attack_Dc: number;
    attackStr: string;
    damageStr: string;
  };
}

/** Context passed to spell calculation hooks */
export interface SpellCalcContext {
  spellKey: string;
  spell: DndSpell | null;
  casterClass: string;
  castingAbility: AbilityIndex;
  spellLevel: number;
  isCantrip: boolean;
  /** Fields that can be modified by spellCalc hooks */
  fields: {
    spellDc: number;
    spellAttack: number;
    cantripDie: number;
    description: string;
  };
}

/** Context passed to HP calculation hooks */
export interface HpCalcContext {
  totalHD: number;
  hdObject: Record<number, number>; // die size -> count (e.g. { 8: 5, 10: 3 })
  constitutionMod: number;
  level: number;
  baseHp: number;
  /** Modified by hp hooks - extra HP to add */
  extraHp: number;
}

/** Context passed to AC calculation hooks */
export interface AcCalcContext {
  baseAc: number;
  armorType: 'none' | 'light' | 'medium' | 'heavy';
  hasShield: boolean;
  dexMod: number;
  /** Modified by AC hooks */
  extraAc: number;
  acSources: string[];
}

// ─── CalcChanges Hook Registry ───────────────────────────────────────────────

/** Registered calculation hooks from features */
export interface CalcChangesRegistry {
  /** Attack to-hit and damage hooks */
  atkCalc: Map<string, { fn: (ctx: AttackCalcContext) => void; description: string }>;
  /** Attack property/text hooks */
  atkAdd: Map<string, { fn: (ctx: AttackCalcContext) => void; description: string }>;
  /** Spell list modification hooks */
  spellList: Map<string, { fn: (spellList: string[], className: string, level: number) => string[]; description: string }>;
  /** Add spells hooks */
  spellAdd: Map<string, { fn: (ctx: SpellCalcContext) => void; description: string }>;
  /** Spell DC/attack hooks */
  spellCalc: Map<string, { fn: (ctx: SpellCalcContext) => void; description: string }>;
  /** HP modification hooks */
  hp: Map<string, { fn: (ctx: HpCalcContext) => void; description: string }>;
}

// ─── Proficiency Tracking ────────────────────────────────────────────────────

export type ProficiencyType = 
  | 'skill' | 'save' | 'armor' | 'weapon' | 'tool' 
  | 'language' | 'resistance' | 'immunity' | 'vulnerability'
  | 'vision' | 'speed' | 'advantage';

/** Common source type for all feature origins */
export type FeatureSourceType = 'class' | 'subclass' | 'race' | 'background' | 'feat' | 'item';

export interface ProficiencySource {
  source: string;      // e.g. "Fighter", "Human", "Soldier"
  sourceType: FeatureSourceType;
  value?: number;      // for vision (darkvision 60), speed bonuses, etc.
  conditional?: string; // e.g. "vs poison" for resistance
}

/** Tracked proficiencies with sources */
export interface ProficiencyTracker {
  skills: Map<Skill, ProficiencySource[]>;
  expertise: Map<Skill, ProficiencySource[]>;
  saves: Map<string, ProficiencySource[]>;
  armor: Map<string, ProficiencySource[]>;
  weapons: Map<string, ProficiencySource[]>;
  tools: Map<string, ProficiencySource[]>;
  languages: Map<string, ProficiencySource[]>;
  resistances: Map<string, ProficiencySource[]>;
  immunities: Map<string, ProficiencySource[]>;
  vulnerabilities: Map<string, ProficiencySource[]>;
  vision: Map<string, ProficiencySource[]>;
  speed: Map<string, ProficiencySource[]>;
  advantages: Map<string, ProficiencySource[]>;
  saveTxt: {
    adv_vs: Map<string, ProficiencySource[]>;
    immune: Map<string, ProficiencySource[]>;
    text: Set<string>;
  };
}

// ─── Resource (Limited Use) Tracking ─────────────────────────────────────────

export type RecoveryType = 'short rest' | 'long rest' | 'dawn' | 'dusk' | 'never' | 'special';

export interface TrackedResource {
  id: string;               // unique ID: "classKey|featureName" or "feat|featName"
  name: string;             // display name
  source: string;           // source feature/item
  sourceType: FeatureSourceType;
  maxUses: number | null;   // null if dynamic (level-based)
  maxUsesFormula?: string;  // for level-based: "Wis mod" or level array
  currentUses: number;
  recovery: RecoveryType;
  description?: string;
}

export interface ResourceTracker {
  resources: Map<string, TrackedResource>;
  /** Reset resources by recovery type */
  shortRest: () => void;
  longRest: () => void;
}

// ─── Action Economy ──────────────────────────────────────────────────────────

export type ActionType = 'action' | 'bonus action' | 'reaction' | 'free action' | 'special';

export interface TrackedAction {
  name: string;
  type: ActionType;
  source: string;
  sourceType: FeatureSourceType;
  description?: string;
  usesResource?: string;    // resource ID if this uses a limited resource
}

// ─── Active Features ─────────────────────────────────────────────────────────

export interface ActiveFeature {
  key: string;              // unique key
  name: string;
  source: string;           // class name, race name, etc.
  sourceType: FeatureSourceType;
  level?: number;           // level requirement if from class/subclass
  description: string;
  /** Level-scaled additional text (e.g. "2d6" at level 5, "3d6" at level 9) */
  additional?: string;
  /** Has calcChanges hooks registered */
  hasCalcChanges: boolean;
  /** Has usages (limited use) */
  hasUsages: boolean;
  /** Action types provided by this feature */
  actions: ActionType[];
}

// ─── Spellcasting State ──────────────────────────────────────────────────────

export interface SpellcastingEntry {
  className: string;
  subclassName?: string;
  castingAbility: AbilityIndex;
  spellcastingFactor: number;   // 1 = full, 0.5 = half, 0.33 = third
  classLevel: number;
  cantripsKnown: number;
  spellsKnown: number;
  prepared: boolean;            // prepared caster?
  spellList: string[];          // available spell keys
  extraSpells: string[];        // from subclass/features
  ritualOnly: boolean;          // ritual casting only
  pactMagic: boolean;           // warlock pact magic
}

export interface SpellcastingState {
  entries: Map<string, SpellcastingEntry>;   // by class key
  /** Combined spell slots (multiclass rules) */
  slots: number[];              // [unused, 1st, 2nd, ..., 9th]
  /** Warlock pact slots (separate) */
  pactSlots: { count: number; level: number } | null;
  /** Bonus spells from race/feats/items */
  bonusSpells: Map<string, { spellKey: string; source: string; castingAbility?: AbilityIndex }>;
}

// ─── Character Engine State ──────────────────────────────────────────────────

/** Resolved class with merged subclass features */
export interface ResolvedClass {
  classData: DndClass;
  subclassData: DndSubclass | null;
  level: number;
  /** Merged features from class + subclass at current level */
  activeFeatures: Map<string, ClassFeature & { fromSubclass: boolean }>;
}

/** Resolved race with merged variant */
export interface ResolvedRace {
  raceData: DndRace;
  variantData: DndRaceVariant | null;
  /** Merged features */
  activeFeatures: Map<string, ClassFeature>;
}

/**
 * CharacterEngine - Central state manager for a character
 * 
 * Mirrors the PDF's global state objects:
 * - CurrentClasses, CurrentRace, CurrentBackground
 * - CurrentProfs, CurrentEvals, CurrentVars
 */
export interface CharacterEngine {
  // ─── Resolved Data ────────────────────────────────────────────────────────
  readonly character: Character;
  readonly classes: Map<string, ResolvedClass>;
  readonly race: ResolvedRace | null;
  readonly background: DndBackground | null;
  readonly feats: DndFeat[];
  
  // ─── Trackers ─────────────────────────────────────────────────────────────
  readonly proficiencies: ProficiencyTracker;
  readonly calcChanges: CalcChangesRegistry;
  readonly resources: ResourceTracker;
  readonly actions: TrackedAction[];
  readonly activeFeatures: ActiveFeature[];
  readonly spellcasting: SpellcastingState;
  
  // ─── Core Methods ─────────────────────────────────────────────────────────
  
  /** Rebuild all state from character data */
  rebuild(): void;
  
  /** Apply a feature's attributes (addIt=true to add, false to remove) */
  applyFeatureAttributes(
    feature: ClassFeature,
    sourceName: string,
    sourceType: 'class' | 'subclass' | 'race' | 'background' | 'feat' | 'item',
    level: number,
    addIt: boolean
  ): void;
  
  // ─── Calculation Methods ──────────────────────────────────────────────────
  
  /** Calculate attack to-hit and damage with all hooks */
  calculateAttack(attack: AttackEntry, weapon: DndWeapon | null): {
    toHit: number;
    damage: string;
    damageType: string;
    attackStr: string;
    notes: string[];
  };
  
  /** Calculate HP with all hooks */
  calculateHp(): { baseHp: number; bonusHp: number; totalHp: number; sources: string[] };
  
  /** Calculate AC with all hooks */
  calculateAc(armor: DndArmor | null, hasShield: boolean): { ac: number; sources: string[] };
  
  /** Get spell DC and attack bonus for a casting class */
  getSpellStats(className: string): { dc: number; attack: number; ability: AbilityIndex } | null;
  
  /** Check if character meets prerequisites for a feat/item */
  meetsPrerequisites(prereqeval: MpmbValue): boolean;
  
  // ─── Resource Management ──────────────────────────────────────────────────
  
  /** Use a limited resource */
  useResource(resourceId: string): boolean;
  
  /** Restore resources on short rest */
  shortRest(): void;
  
  /** Restore resources on long rest */
  longRest(): void;
}

// ─── Engine Factory ──────────────────────────────────────────────────────────

export interface CharacterEngineOptions {
  /** All loaded game data */
  data: {
    classes: DndClass[];
    subclasses: DndSubclass[];
    races: DndRace[];
    raceVariants: DndRaceVariant[];
    backgrounds: DndBackground[];
    spells: DndSpell[];
    feats: DndFeat[];
    weapons: DndWeapon[];
    armor: DndArmor[];
    magicItems: DndMagicItem[];
  };
}

export interface CreateCharacterEngineResult {
  engine: CharacterEngine;
  warnings: string[];
}
