// ─── Character model ─────────────────────────────────────────────────────────

export type AbilityIndex = 0 | 1 | 2 | 3 | 4 | 5;
export type AbilityScores = [number, number, number, number, number, number];

export const ABILITY_NAMES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'] as const;
export const ABILITY_ABBR  = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
export const ABILITY_SHORT = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'] as const;

export const ALL_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics',
  'Deception', 'History', 'Insight', 'Intimidation',
  'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand',
  'Stealth', 'Survival',
] as const;
export type Skill = typeof ALL_SKILLS[number];

export const SKILL_ABILITY: Record<Skill, AbilityIndex> = {
  'Acrobatics':     1, 'Animal Handling': 4, 'Arcana':        3,
  'Athletics':      0, 'Deception':       5, 'History':       3,
  'Insight':        4, 'Intimidation':    5, 'Investigation':  3,
  'Medicine':       4, 'Nature':          3, 'Perception':     4,
  'Performance':    5, 'Persuasion':      5, 'Religion':       3,
  'Sleight of Hand':1, 'Stealth':         1, 'Survival':       4,
};

export type Alignment =
  | 'Lawful Good' | 'Neutral Good' | 'Chaotic Good'
  | 'Lawful Neutral' | 'True Neutral' | 'Chaotic Neutral'
  | 'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil'
  | 'Unaligned';

// ─── D&D 5e Conditions ──────────────────────────────────────────────────────
export const ALL_CONDITIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
  'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
  'Prone', 'Restrained', 'Stunned', 'Unconscious',
] as const;
export type Condition = typeof ALL_CONDITIONS[number];

export interface EquipmentItem {
  name: string;
  quantity: number;
  weight?: number;
  source?: 'class' | 'background' | 'pack' | 'custom';
}

export interface Currency {
  cp: number; // copper
  sp: number; // silver
  ep: number; // electrum
  gp: number; // gold
  pp: number; // platinum
}

export interface AttackEntry {
  id: string;
  name: string;
  weaponKey?: string;           // DndWeapon._key if linked to weapon data
  attackType?: 'melee' | 'ranged' | 'spell';
  abilityUsed?: 'STR' | 'DEX' | 'INT' | 'WIS' | 'CHA' | 'spellcasting';
  proficient?: boolean;
  magicBonus?: number;          // +1, +2, +3 weapon bonus
  toHitBonus?: number;          // manual override; if undefined, auto-calculated
  damageFormula?: string;       // e.g. "1d6+3"
  damageType?: string;          // e.g. "slashing"
  notes?: string;
  isOffHand?: boolean;          // off-hand attack (Two-Weapon Fighting)
}

export interface CharacterDetails {
  alignment: Alignment | '';
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  hair?: string;
  skin?: string;
  appearance?: string;
  backstory?: string;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  allies?: string;
  treasure?: string;
  notes?: string;
}

export interface CharacterClass {
  classKey: string;
  level: number;
  subclassKey: string | null;
  hpPerLevel: number[];           // HP gained at each level in this class (length = level)
  fightingStyle?: string;         // chosen fighting style name (if applicable)
  expertiseSkills?: Skill[];      // expertise skills for this class
}

export interface Character {
  id: string;
  name: string;
  race: string;                        // DndRace._key
  raceVariant: string | null;          // DndRaceVariant._key
  classes: CharacterClass[];           // one entry per class (multiclass)
  totalLevel: number;                  // sum of all class levels
  background: string;                  // DndBackground._key
  abilityScores: AbilityScores;        // final resolved scores [Str…Cha]
  abilityScoreMethod: 'standard-array' | 'point-buy' | 'manual';
  skills: Skill[];                     // proficient
  expertise: Skill[];
  chosenCantrips: string[];            // spell _keys
  chosenSpells: string[];              // spell _keys
  equipment: EquipmentItem[];
  gold: number;
  currency?: Currency;                 // detailed currency tracker (cp/sp/ep/gp/pp)
  details: CharacterDetails;
  currentHp?: number;                  // for the sheet tracker
  tempHp?: number;
  hitDiceUsed?: number[];              // used hit dice per class slot
  slotsUsed?: number[];                // expended spell slots [0, l1…l9]
  deathSaveSuccesses?: number;         // 0–3
  deathSaveFailures?: number;          // 0–3
  xp?: number;                         // experience points
  raceSpeed?: number;                  // walking speed from race (feet)
  equippedArmorKey?: string;           // DndArmor._key of worn armor
  hasShield?: boolean;                 // shield equipped (+2 AC)
  featureUses?: Record<string, number>; // "classKey|featureName" → current uses remaining
  preparedSpells?: string[];           // prepared spell _keys (for prepared casters)
  concentratingOn?: string;            // spell _key currently concentrating on
  chosenInvocations?: string[];        // warlock invocation _keys
  inspiration?: boolean;               // inspiration (from DM or bardic)
  conditions?: Condition[];            // active conditions
  exhaustion?: number;                 // exhaustion level 0–6
  attacks?: AttackEntry[];             // attacks panel entries
  languages?: string[];               // known languages
  toolProficiencies?: string[];        // tool proficiencies
  saveAdvantages?: string[];           // advantage on saves vs certain conditions/effects (from race/feats)
  attuned?: string[];                  // names of attuned magic items (max 3)
  feats?: string[];                    // feat _keys chosen via ASI/feat trades
  favoredEnemies?: string[];           // Ranger favored enemies (2014 PHB)
  favoredTerrains?: string[];          // Ranger favored terrains (Natural Explorer)
  createdAt: string;
  updatedAt: string;
}

// ─── Builder draft (in-progress character, may be incomplete) ─────────────────
export interface BuilderDraft {
  step: number;                        // current wizard step 1–8
  visitedSteps: Set<number>;

  // Step 1 – Race
  race: string | null;
  raceVariant: string | null;
  raceAsiGeneric: AbilityScores;       // for scoresGeneric races (half-elf, human variant, etc.)

  // Step 2 – Class
  classKey: string | null;
  startingLevel: number;           // 1–20, default 1
  startingSubclassKey: string | null;
  levelAsi: AbilityScores;         // ASI points spent from leveling up to startingLevel
  chosenFightingStyle: string | null;  // fighting style chosen at creation

  // Step 3 – Background
  background: string | null;
  backgroundVariant: string | null;    // variant within chosen background

  // Step 4 – Ability Scores
  abilityScoreMethod: 'standard-array' | 'point-buy' | 'manual';
  baseScores: AbilityScores;           // before ASIs
  raceAsi: AbilityScores;             // from race (fixed scores[])
  backgroundAsi: AbilityScores;       // from background scorestxt choice
  backgroundAsiChoice: string | null; // e.g. "Str+2,Dex+1"
  chosenSkills: Skill[];              // class skill proficiencies chosen by player
  chosenExpertise: Skill[];           // expertise (Rogue/Bard) chosen at creation

  // Step 5 – Equipment
  chosenPackKey: string | null;
  useStartingGold: boolean;
  customEquipment: EquipmentItem[];

  // Step 4b – Feats (chosen instead of ASI at higher starting levels)
  chosenFeats: string[];           // feat _keys chosen via ASI/feat swaps

  // Step 6 – Spells
  chosenCantrips: string[];
  chosenSpells: string[];
  chosenInvocations: string[];     // warlock eldritch invocations chosen at creation

  // Step 7 – Details
  name: string;
  details: Partial<CharacterDetails>;
}

// ─── Level-up draft ───────────────────────────────────────────────────────────
export type LevelUpChoice =
  | { type: 'asi'; scores: AbilityScores }
  | { type: 'feat'; featKey: string }
  | { type: 'subclass'; subclassKey: string }
  | { type: 'spells'; cantrips: string[]; spells: string[] }
  | { type: 'hp'; value: number }
  | { type: 'fightingStyle'; styleKey: string }
  | { type: 'expertise'; skills: Skill[] };

export interface LevelUpDraft {
  characterId: string;
  targetClassKey: string;          // class gaining the level
  isNewClass: boolean;             // true if adding a new class (multiclass)
  choices: LevelUpChoice[];
  step: number;
}

// ─── Derived stats (computed, never stored) ────────────────────────────────────
export interface DerivedStats {
  proficiencyBonus: number;
  abilityModifiers: AbilityScores;
  savingThrows: Record<string, number>;
  skillBonuses: Record<Skill, number>;
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
  maxHp: number;
  currentHp: number;
  initiative: number;
  ac: number;
  speed: number;
  carryingCapacity: number;        // STR score × 15
  spellSlots: number[];            // [0, l1, l2, l3, l4, l5, l6, l7, l8, l9]
  spellcastingAbility?: AbilityIndex;
  spellSaveDc?: number;
  spellAttackBonus?: number;
  attacksPerAction: number;
  cantripDie: number;              // d6 (levels 1-4) / d8 (5-10) / d10 (11-16) / d12 (17-20)
  reliableTalent: boolean;         // Rogue L11+: proficient skill checks treat d20 < 10 as 10
  disadvantageOnAttacks: boolean;  // from conditions (Blinded, Frightened, Poisoned, Prone, Restrained)
  disadvantageOnChecks: boolean;   // from conditions (Poisoned) or exhaustion L1+
  advantageOnAttacks: boolean;     // from conditions (Invisible)
}
