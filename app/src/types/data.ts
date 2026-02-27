// ─── Serialised MPMB primitives ───────────────────────────────────────────────
export interface SerializedRegExp {
  _type: 'RegExp';
  source: string;
  flags: string;
}
export interface SerializedFunction {
  _type: 'function';
  body: string;
}
export type MpmbValue = SerializedRegExp | SerializedFunction | unknown;

// ─── Source ──────────────────────────────────────────────────────────────────
export interface DndSource {
  _key: string;
  name: string;
  abbreviation: string;
  abbreviationSpellsheet?: string;
  group: string;
  url?: string;
  date?: string;
  campaignSetting?: string;
  defaultExcluded?: boolean;
}

// ─── Class ───────────────────────────────────────────────────────────────────
export interface ClassFeature {
  name: string;
  source?: [string, number][];
  minlevel: number;
  description?: string;
  descriptionFull?: string;
  usages?: number | number[] | string;
  recovery?: string;
  action?: ([string] | [string, string])[];
  additional?: string[];
  calcChanges?: MpmbValue;
  armorOptions?: MpmbValue[];
  weaponOptions?: MpmbValue[];
  [key: string]: MpmbValue;
}

export interface DndClass {
  _key: string;
  name: string;
  source: [string, number][];
  primaryAbility: string[];
  abilitySave: number;
  prereqs?: string;
  improvements: number[];
  die: number;
  saves: string[];
  skillstxt: { primary?: string; secondary?: string };
  armorProfs: { primary: boolean[]; secondary?: boolean[] };
  weaponProfs: { primary: boolean[]; secondary?: boolean[] };
  /** Tool proficiencies: primary (first class) / secondary (multiclass). Format: [name, count] or [[specific tools]] */
  toolProfs?: { primary?: (string | string[] | [string, number])[]; secondary?: (string | string[] | [string, number])[] };
  equipment?: string;
  subclasses: [string, string[]];
  attacks: number[];
  features: Record<string, ClassFeature>;
  spellcastingAbility?: number;
  spellcastingFactor?: number | string;
  spellcastingKnown?: {
    cantrips?: number[];
    spells?: number[];
    prepared?: boolean;
  };
}

// ─── Subclass ─────────────────────────────────────────────────────────────────
export interface DndSubclass {
  _key: string;
  _parentClass: string;
  _subKey: string;
  subname: string;
  fullname?: string;
  source: [string, number][];
  features: Record<string, ClassFeature>;
  spellcastingExtra?: string[];
  abilitySave?: number;
}

// ─── Race ─────────────────────────────────────────────────────────────────────
export interface DndRace {
  _key: string;
  name: string;
  source: [string, number][];
  plural?: string;
  size: number | number[];
  speed: { walk?: { spd: number; enc: number }; fly?: { spd: number; enc: number }; swim?: { spd: number; enc: number }; climb?: { spd: number; enc: number } };
  scores?: number[];
  scoresGeneric?: boolean;
  vision?: [string, number][];
  languageProfs?: (string | number)[];
  skills?: string[];
  skillstxt?: string;
  trait?: string;
  age?: string;
  height?: string;
  weight?: string;
  features?: Record<string, ClassFeature>;
  spellcastingAbility?: number | number[];
  spellcastingBonus?: MpmbValue[];
  weaponOptions?: MpmbValue[];
  dmgres?: (string | [string, string])[];
  savetxt?: { text?: string[]; adv_vs?: string[] };
  advantages?: [string, boolean][];
  /** Tool proficiencies - array of [name, choiceCount?] or string names */
  toolProfs?: (string | [string, number])[];
  /** Weapon proficiencies - [simple, martial, specificWeapons?] */
  weaponProfs?: [boolean, boolean, string[]?];
  /** Armor proficiencies - [light, medium, heavy, shields] */
  armorProfs?: [boolean, boolean, boolean, boolean];
  [key: string]: MpmbValue;
}

export interface DndRaceVariant {
  _key: string;
  name: string;
  trait?: string;
  dmgres?: (string | [string, string])[];
  spellcastingAbility?: number;
  spellcastingBonus?: MpmbValue[];
  scores?: number[];
  [key: string]: MpmbValue;
}

// ─── Background ───────────────────────────────────────────────────────────────
export interface DndBackground {
  _key: string;
  name: string;
  source: [string, number][];
  scorestxt?: string[];
  skills: string[];
  toolProfs?: (string | [string, string | number])[];
  languageProfs?: (string | number)[];
  gold?: number;
  equipleft?: [string, string | number, string | number][];
  equipright?: [string, string | number, string | number][];
  feature?: string;
  trait?: string[];
  ideal?: ([string, string])[];
  bond?: string[];
  flaw?: string[];
  extra?: string[];
  toNotesPage?: { name: string; note: string }[];
}

export interface DndBackgroundFeature {
  _key: string;
  description: string;
  source: [string, number][];
}

export interface DndBackgroundVariant {
  _key: string;
  name: string;
  _parentBackground?: string;
  _variantKey?: string;
  equipleft?: [string, string | number, string | number][];
  equipright?: [string, string | number, string | number][];
  feature?: string;
  toolProfs?: (string | [string, string | number])[];
  languageProfs?: (string | number)[];
  skills?: string[];
  skillstxt?: string;
  gold?: number;
  lifestyle?: string;
  extra?: string[];
  source?: [string, number][];
  regExpSearch?: SerializedRegExp;
}

// ─── Spell ────────────────────────────────────────────────────────────────────
export type SpellSchool = 'Abjur' | 'Conj' | 'Div' | 'Ench' | 'Evoc' | 'Illus' | 'Necro' | 'Trans';

export interface DndSpell {
  _key: string;
  name: string;
  classes: string[];
  source: [string, number][];
  level: number;
  school: SpellSchool;
  time: string;
  range: string;
  components: string;
  compMaterial?: string;
  duration: string;
  save?: string;
  ritual?: boolean;
  description: string;
  descriptionFull?: string;
  descriptionShorter?: string;
  descriptionCantripDie?: string;
}

// ─── Feat ─────────────────────────────────────────────────────────────────────
export interface DndFeat {
  _key: string;
  name: string;
  source: [string, number][];
  type?: string;
  prereqs?: string;
  prerequisite?: string;
  description: string;
  descriptionFull?: string;
  choices?: string[];
  scores?: number[];
  scoresMaximum?: number[];
  skills?: string[];
  skillstxt?: string;
  action?: ([string] | [string, string])[];
  usages?: number | string;
  recovery?: string;
  addMod?: { type: string; field: string; mod: string | number; text?: string }[];
  [key: string]: MpmbValue;
}

// ─── Equipment ────────────────────────────────────────────────────────────────
export interface DndWeapon {
  _key: string;
  name: string;
  source: [string, number][];
  type: 'Simple' | 'Martial' | 'Natural' | 'Other';
  list: 'melee' | 'ranged';
  ability: number;
  abilitytodamage: boolean;
  damage: [number, number, string];
  range: string;
  description?: string;
  weight?: number;
  monkweapon?: boolean;
  dc?: boolean;
}

export interface DndArmor {
  _key: string;
  name: string;
  source: [string, number][];
  type: 'light' | 'medium' | 'heavy' | 'shield' | 'magic' | 'firstlist';
  ac: number | string;
  addMod?: boolean;
  stealthdis?: boolean;
  strReq?: number;
  weight?: number;
}

export interface DndPack {
  _key: string;
  name: string;
  source: [string, number][];
  items: [string, string | number, string | number][];
}

export interface DndGear {
  _key: string;
  name: string;
  infoname?: string;
  amount?: number;
  weight?: number;
  type?: string;
}

// ─── Magic Items ──────────────────────────────────────────────────────────────
export interface DndMagicItem {
  _key: string;
  name: string;
  source: [string, number][];
  type: string;
  rarity?: string;
  description?: string;
  descriptionFull?: string;
  attunement?: boolean | string;
  weight?: number;
  choices?: string[];
}

// ─── Warlock Invocations ─────────────────────────────────────────────────────
export interface DndWarlockInvocation {
  _key: string;
  name: string;
  _displayName?: string;
  description: string;
  source: [string, number][];
  submenu?: string;
  prereqeval?: MpmbValue;
  usages?: number;
  recovery?: string;
  action?: ([string] | [string, string])[];
}

// ─── Ammo ─────────────────────────────────────────────────────────────────────
export interface DndAmmo {
  _key: string;
  name: string;
  source: [string, number][];
  weight?: number;
  icon?: string;
  infoname?: string;
  invName?: string;
  amount?: number;
  alternatives?: string[];
  defaultExcluded?: boolean;
}

// ─── Tool ─────────────────────────────────────────────────────────────────────
export interface DndTool {
  _key: string;
  name: string;
  source?: [string, number][];
  weight?: number;
  type?: string;
  infoname?: string;
  amount?: number;
}

// ─── Psionic ──────────────────────────────────────────────────────────────────
export interface DndPsionic {
  _key: string;
  name: string;
  nameShort?: string;
  classes?: string[];
  source: [string, number][];
  psionic?: boolean;
  level?: number;
  school?: string;
  time?: string;
  timeFull?: string;
  range?: string;
  duration?: string;
  components?: string;
  save?: string;
  description?: string;
  descriptionFull?: string;
  descriptionCantripDie?: string;
  descriptionMetric?: string;
  dependencies?: string[];
  firstCol?: string;
}

// ─── Companion ────────────────────────────────────────────────────────────────
export interface DndCompanion {
  _key: string;
  name: string;
  nameTooltip?: string;
  nameOrigin?: string;
  nameMenu?: string;
  source: [string, number][];
  includeCheck?: MpmbValue;
  action?: ([string] | [string, string])[];
  notes?: string;
  attributesAdd?: MpmbValue;
  attributesChange?: MpmbValue;
  eval?: MpmbValue;
  changeeval?: MpmbValue;
}

// ─── Creature ─────────────────────────────────────────────────────────────────
export interface DndCreature {
  _key: string;
  name: string;
  nameAlt?: string[];
  source: [string, number][];
  size?: number;
  type?: string;
  subtype?: string;
  alignment?: string;
  ac?: number;
  hp?: number;
  hd?: number[];
  hdLinked?: string[];
  speed?: string;
  scores?: number[];
  saves?: string;
  skills?: string;
  damage_resistances?: string;
  damage_immunities?: string;
  damage_vulnerabilities?: string;
  condition_immunities?: string;
  senses?: string;
  languages?: string;
  challengeRating?: string;
  proficiencyBonus?: number;
  proficiencyBonusLinked?: boolean;
  attacksAction?: number;
  attacks?: MpmbValue[];
  traits?: MpmbValue[];
  actions?: MpmbValue[];
  features?: MpmbValue[];
  notes?: string;
  header?: string;
  companion?: string;
  companionApply?: string;
  passivePerception?: number;
  wildshapeString?: string;
  variant?: string[];
  isSummon?: boolean;
  spell?: MpmbValue;
  addMod?: MpmbValue[];
  calcChanges?: MpmbValue;
  eval?: MpmbValue;
  removeeval?: MpmbValue;
  regExpSearch?: MpmbValue;
}
