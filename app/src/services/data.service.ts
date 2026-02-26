import type { DndClass, DndSubclass, DndRace, DndRaceVariant, DndBackground, DndBackgroundFeature, DndBackgroundVariant, DndSpell, DndFeat, DndWeapon, DndArmor, DndPack, DndGear, DndSource, DndMagicItem, DndWarlockInvocation } from '../types/data';

type DataKey =
  | 'classes' | 'subclasses' | 'races' | 'race_variants'
  | 'backgrounds' | 'background_features' | 'background_variants'
  | 'spells' | 'feats' | 'weapons' | 'armor' | 'ammo'
  | 'tools' | 'gear' | 'packs' | 'magic_items'
  | 'sources' | 'warlock_invocations' | 'psionics' | 'companions' | 'creatures';

type DataMap = {
  classes:              DndClass[];
  subclasses:           DndSubclass[];
  races:                DndRace[];
  race_variants:        DndRaceVariant[];
  backgrounds:          DndBackground[];
  background_features:  DndBackgroundFeature[];
  background_variants:  DndBackgroundVariant[];
  spells:               DndSpell[];
  feats:                DndFeat[];
  weapons:              DndWeapon[];
  armor:                DndArmor[];
  ammo:                 unknown[];
  tools:                unknown[];
  gear:                 DndGear[];
  packs:                DndPack[];
  magic_items:          DndMagicItem[];
  sources:              DndSource[];
  warlock_invocations:  DndWarlockInvocation[];
  psionics:             unknown[];
  companions:           unknown[];
  creatures:            unknown[];
};

const cache = new Map<DataKey, unknown>();

async function load<K extends DataKey>(key: K): Promise<DataMap[K]> {
  if (cache.has(key)) return cache.get(key) as DataMap[K];

  const url = `/data/${key}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);

  const data = await res.json() as DataMap[K];
  cache.set(key, data);
  return data;
}

/** Deserialise a serialised MPMB RegExp back to a real RegExp, safely. */
export function deserializeRegExp(val: unknown): RegExp | null {
  if (val && typeof val === 'object' && (val as { _type?: string })._type === 'RegExp') {
    const { source, flags } = val as { source: string; flags: string };
    try { return new RegExp(source, flags); } catch { return null; }
  }
  return null;
}

/** Return the source abbreviation list as a display string e.g. "PHB p.42" */
export function formatSource(source: [string, number][]): string {
  if (!source?.length) return '';
  const [abbr, page] = source[0];
  return page ? `${abbr} p.${page}` : abbr;
}

const DataService = {
  getClasses:             () => load('classes'),
  getSubclasses:          () => load('subclasses'),
  getRaces:               () => load('races'),
  getRaceVariants:        () => load('race_variants'),
  getBackgrounds:         () => load('backgrounds'),
  getBackgroundFeatures:  () => load('background_features'),
  getBackgroundVariants:  () => load('background_variants'),
  getSpells:              () => load('spells'),
  getFeats:               () => load('feats'),
  getWeapons:             () => load('weapons'),
  getArmor:               () => load('armor'),
  getGear:                () => load('gear'),
  getPacks:               () => load('packs'),
  getMagicItems:          () => load('magic_items'),
  getWarlockInvocations:  () => load('warlock_invocations'),
  getSources:             () => load('sources'),

  /** Helper: get all subclasses for a specific parent class */
  async getSubclassesForClass(classKey: string): Promise<DndSubclass[]> {
    const all = await load('subclasses');
    return all.filter(s => s._parentClass === classKey);
  },

  /** Helper: get all spells available to a class */
  async getSpellsForClass(classKey: string): Promise<DndSpell[]> {
    const all = await load('spells');
    return all.filter(s => s.classes?.includes(classKey));
  },

  /** Helper: filter spells by level */
  async getSpellsByLevel(classKey: string, level: number): Promise<DndSpell[]> {
    const spells = await DataService.getSpellsForClass(classKey);
    return spells.filter(s => s.level === level);
  },

  /** Check whether a class has spellcasting */
  async isSpellcaster(classKey: string): Promise<boolean> {
    const classes = await load('classes');
    const cls = classes.find(c => c._key === classKey);
    if (!cls) return false;
    return 'spellcasting' in cls.features || classKey === 'artificer';
  },
};

export default DataService;
