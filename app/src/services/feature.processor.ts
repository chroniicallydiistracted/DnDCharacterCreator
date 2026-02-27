/**
 * Feature Processor
 * 
 * Processes feature attributes from classes, races, backgrounds, feats, and items.
 * This is the core engine equivalent to the PDF's ApplyFeatureAttributes().
 * 
 * Handles:
 * - Proficiencies (skills, armor, weapons, saves, tools, languages)
 * - Speed, vision, resistances, immunities
 * - Actions (action economy)
 * - Limited use features (usages + recovery)
 * - CalcChanges hook registration
 * - Ability score bonuses
 * - Spellcasting bonuses
 */

import type { Character, Skill, AbilityScores } from '../types/character';
import type {
  ClassFeature, DndClass, DndSubclass, DndRace, DndBackground, DndFeat,
  MpmbValue
} from '../types/data';
import type {
  ProficiencyTracker,
  ProficiencySource,
  CalcChangesRegistry,
  TrackedResource,
  TrackedAction,
  ActiveFeature,
  ActionType,
  RecoveryType,
} from '../types/engine';
import { registerCalcChanges, unregisterCalcChanges } from './calcChanges.evaluator';
import { abilityMod, profBonus } from './character.calculator';

// ─── Create Empty Trackers ───────────────────────────────────────────────────

export function createProficiencyTracker(): ProficiencyTracker {
  return {
    skills: new Map(),
    expertise: new Map(),
    saves: new Map(),
    armor: new Map(),
    weapons: new Map(),
    tools: new Map(),
    languages: new Map(),
    resistances: new Map(),
    immunities: new Map(),
    vulnerabilities: new Map(),
    vision: new Map(),
    speed: new Map(),
    advantages: new Map(),
    saveTxt: {
      adv_vs: new Map(),
      immune: new Map(),
      text: new Set(),
    },
  };
}

// ─── Proficiency Management ──────────────────────────────────────────────────

function addProf<T extends string>(
  map: Map<T, ProficiencySource[]>,
  key: T,
  source: ProficiencySource
): void {
  const existing = map.get(key) ?? [];
  // Check if already added from this source
  if (!existing.some(s => s.source === source.source)) {
    existing.push(source);
    map.set(key, existing);
  }
}

function removeProf<T extends string>(
  map: Map<T, ProficiencySource[]>,
  key: T,
  sourceName: string
): void {
  const existing = map.get(key);
  if (existing) {
    const filtered = existing.filter(s => s.source !== sourceName);
    if (filtered.length > 0) {
      map.set(key, filtered);
    } else {
      map.delete(key);
    }
  }
}

// ─── Process Feature Attributes ──────────────────────────────────────────────

export interface FeatureProcessorContext {
  character: Character;
  proficiencies: ProficiencyTracker;
  calcChanges: CalcChangesRegistry;
  resources: Map<string, TrackedResource>;
  actions: TrackedAction[];
  activeFeatures: ActiveFeature[];
}

/**
 * Process a feature's attributes - the core engine function
 * 
 * @param feature - The feature to process
 * @param sourceName - Name of the source (e.g., "Fighter", "Human")
 * @param sourceType - Type of source
 * @param level - Current level (for level-dependent features)
 * @param addIt - true to add the feature, false to remove
 * @param ctx - The processing context
 */
export function processFeatureAttributes(
  feature: ClassFeature,
  sourceName: string,
  sourceType: 'class' | 'subclass' | 'race' | 'background' | 'feat' | 'item',
  level: number,
  addIt: boolean,
  ctx: FeatureProcessorContext
): void {
  const profSource: ProficiencySource = {
    source: sourceName,
    sourceType,
  };
  
  const featureKey = `${sourceType}|${sourceName}|${feature.name}`;
  
  if (addIt) {
    // ─── Skills ────────────────────────────────────────────────────────────
    if ('skills' in feature && feature.skills) {
      const skills = feature.skills as string[];
      for (const skill of skills) {
        addProf(ctx.proficiencies.skills, skill as Skill, profSource);
      }
    }
    
    // ─── Expertise ─────────────────────────────────────────────────────────
    if ('expertise' in feature && feature.expertise) {
      const expertise = feature.expertise as string[];
      for (const skill of expertise) {
        addProf(ctx.proficiencies.expertise, skill as Skill, profSource);
      }
    }
    
    // ─── Saves ─────────────────────────────────────────────────────────────
    if ('saves' in feature && feature.saves) {
      const saves = feature.saves as string[];
      for (const save of saves) {
        addProf(ctx.proficiencies.saves, save, profSource);
      }
    }
    
    // ─── Armor Proficiencies ───────────────────────────────────────────────
    if ('armorProfs' in feature && feature.armorProfs) {
      processArmorProfs(feature.armorProfs, profSource, ctx.proficiencies, true);
    }
    
    // ─── Weapon Proficiencies ──────────────────────────────────────────────
    if ('weaponProfs' in feature && feature.weaponProfs) {
      processWeaponProfs(feature.weaponProfs, profSource, ctx.proficiencies, true);
    }
    
    // ─── Tool Proficiencies ────────────────────────────────────────────────
    if ('toolProfs' in feature && feature.toolProfs) {
      processToolProfs(feature.toolProfs, profSource, ctx.proficiencies, true);
    }
    
    // ─── Language Proficiencies ────────────────────────────────────────────
    if ('languageProfs' in feature && feature.languageProfs) {
      processLanguageProfs(feature.languageProfs, profSource, ctx.proficiencies, true);
    }
    
    // ─── Vision ────────────────────────────────────────────────────────────
    if ('vision' in feature && feature.vision) {
      processVision(feature.vision, profSource, ctx.proficiencies, true);
    }
    
    // ─── Speed ─────────────────────────────────────────────────────────────
    if ('speed' in feature && feature.speed) {
      processSpeed(feature.speed, profSource, ctx.proficiencies, true);
    }
    
    // ─── Damage Resistance ─────────────────────────────────────────────────
    if ('dmgres' in feature && feature.dmgres) {
      processResistance(feature.dmgres, profSource, ctx.proficiencies, true);
    }
    
    // ─── Save Advantages/Text ──────────────────────────────────────────────
    if ('savetxt' in feature && feature.savetxt) {
      processSaveTxt(feature.savetxt, profSource, ctx.proficiencies, true);
    }
    
    // ─── Advantages ────────────────────────────────────────────────────────
    if ('advantages' in feature && feature.advantages) {
      processAdvantages(feature.advantages, profSource, ctx.proficiencies, true);
    }
    
    // ─── Actions ───────────────────────────────────────────────────────────
    if ('action' in feature && feature.action) {
      processActions(feature, sourceName, sourceType, ctx.actions, true);
    }
    
    // ─── Limited Uses ──────────────────────────────────────────────────────
    if ('usages' in feature && feature.usages !== undefined) {
      processUsages(feature, sourceName, sourceType, level, ctx.resources, ctx.character.abilityScores, ctx.character.totalLevel, true);
    }
    
    // ─── CalcChanges ───────────────────────────────────────────────────────
    if ('calcChanges' in feature && feature.calcChanges) {
      registerCalcChanges(ctx.calcChanges, featureKey, feature.calcChanges, ctx.character);
    }
    
    // ─── Track Active Feature ──────────────────────────────────────────────
    const additional = resolveAdditional(feature.additional, level);
    ctx.activeFeatures.push({
      key: featureKey,
      name: feature.name,
      source: sourceName,
      sourceType,
      level: sourceType === 'class' || sourceType === 'subclass' ? level : undefined,
      description: feature.description ?? '',
      additional,
      hasCalcChanges: !!feature.calcChanges,
      hasUsages: feature.usages !== undefined,
      actions: feature.action ? parseActionTypes(feature.action) : [],
    });
    
  } else {
    // ─── Remove Feature ────────────────────────────────────────────────────
    
    // Skills
    if ('skills' in feature && feature.skills) {
      const skills = feature.skills as string[];
      for (const skill of skills) {
        removeProf(ctx.proficiencies.skills, skill as Skill, sourceName);
      }
    }
    
    // CalcChanges
    if ('calcChanges' in feature && feature.calcChanges) {
      unregisterCalcChanges(ctx.calcChanges, featureKey);
    }
    
    // Resources
    const resourceKey = `${sourceType}|${sourceName}|${feature.name}`;
    ctx.resources.delete(resourceKey);
    
    // Actions
    ctx.actions = ctx.actions.filter(a => 
      !(a.source === sourceName && a.sourceType === sourceType)
    );
    
    // Active features
    const featureIdx = ctx.activeFeatures.findIndex(f => f.key === featureKey);
    if (featureIdx >= 0) {
      ctx.activeFeatures.splice(featureIdx, 1);
    }
  }
}

// ─── Process Specific Attribute Types ────────────────────────────────────────

function processArmorProfs(
  armorProfs: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  // Format: [light, medium, heavy, shields] or { primary: [...], secondary: [...] }
  let profs: boolean[] = [];
  
  if (Array.isArray(armorProfs)) {
    profs = armorProfs as boolean[];
  } else if (typeof armorProfs === 'object' && armorProfs !== null) {
    const obj = armorProfs as { primary?: boolean[]; secondary?: boolean[] };
    profs = obj.primary ?? [];
  }
  
  const armorTypes = ['light', 'medium', 'heavy', 'shields'];
  profs.forEach((hasProf, i) => {
    if (hasProf && armorTypes[i]) {
      if (addIt) {
        addProf(prof.armor, armorTypes[i], source);
      } else {
        removeProf(prof.armor, armorTypes[i], source.source);
      }
    }
  });
}

function processWeaponProfs(
  weaponProfs: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  // Format: [simple, martial, specificWeapons?] or { primary: [...], secondary: [...] }
  let profs: (boolean | string[])[] = [];
  
  if (Array.isArray(weaponProfs)) {
    profs = weaponProfs;
  } else if (typeof weaponProfs === 'object' && weaponProfs !== null) {
    const obj = weaponProfs as { primary?: boolean[]; secondary?: boolean[] };
    profs = obj.primary ?? [];
  }
  
  if (profs[0] === true) {
    if (addIt) addProf(prof.weapons, 'simple', source);
    else removeProf(prof.weapons, 'simple', source.source);
  }
  if (profs[1] === true) {
    if (addIt) addProf(prof.weapons, 'martial', source);
    else removeProf(prof.weapons, 'martial', source.source);
  }
  if (Array.isArray(profs[2])) {
    for (const weapon of profs[2]) {
      if (addIt) addProf(prof.weapons, weapon, source);
      else removeProf(prof.weapons, weapon, source.source);
    }
  }
}

function processToolProfs(
  toolProfs: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  // Format: (string | [string, number])[]
  if (!Array.isArray(toolProfs)) return;
  
  for (const tool of toolProfs) {
    const toolName = typeof tool === 'string' ? tool : tool[0];
    if (addIt) addProf(prof.tools, toolName, source);
    else removeProf(prof.tools, toolName, source.source);
  }
}

function processLanguageProfs(
  languageProfs: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  // Format: (string | number)[] - number means "X languages of choice"
  if (!Array.isArray(languageProfs)) return;
  
  for (const lang of languageProfs) {
    if (typeof lang === 'string') {
      if (addIt) addProf(prof.languages, lang, source);
      else removeProf(prof.languages, lang, source.source);
    }
    // Numbers represent choices - would need UI handling
  }
}

function processVision(
  vision: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  // Format: [["darkvision", 60], ["blindsight", 10]]
  if (!Array.isArray(vision)) return;
  
  for (const v of vision) {
    if (Array.isArray(v) && v.length >= 2) {
      const [type, distance] = v;
      const visionSource = { ...source, value: distance as number };
      if (addIt) addProf(prof.vision, type as string, visionSource);
      else removeProf(prof.vision, type as string, source.source);
    }
  }
}

function processSpeed(
  speed: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  // Format: { walk: { spd: 30, enc: 20 }, fly: { spd: 30, enc: 0 }, ... }
  if (typeof speed !== 'object' || speed === null) return;
  
  const speedObj = speed as Record<string, { spd?: number; enc?: number } | number>;
  
  for (const [type, value] of Object.entries(speedObj)) {
    let distance: number;
    if (typeof value === 'number') {
      distance = value;
    } else if (typeof value === 'object' && value !== null) {
      distance = value.spd ?? 0;
    } else {
      continue;
    }
    
    const speedSource = { ...source, value: distance };
    if (addIt) addProf(prof.speed, type, speedSource);
    else removeProf(prof.speed, type, source.source);
  }
}

function processResistance(
  dmgres: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  // Format: (string | [string, string])[] - second element is conditional
  if (!Array.isArray(dmgres)) return;
  
  for (const res of dmgres) {
    let type: string;
    let conditional: string | undefined;
    
    if (typeof res === 'string') {
      type = res;
    } else if (Array.isArray(res)) {
      type = res[0];
      conditional = res[1];
    } else {
      continue;
    }
    
    const resSource = { ...source, conditional };
    if (addIt) addProf(prof.resistances, type, resSource);
    else removeProf(prof.resistances, type, source.source);
  }
}

function processSaveTxt(
  savetxt: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  if (typeof savetxt !== 'object' || savetxt === null) return;
  
  const txt = savetxt as { text?: string[]; adv_vs?: string[]; immune?: string[] };
  
  if (txt.text) {
    for (const t of txt.text) {
      if (addIt) prof.saveTxt.text.add(t);
      else prof.saveTxt.text.delete(t);
    }
  }
  
  if (txt.adv_vs) {
    for (const adv of txt.adv_vs) {
      if (addIt) addProf(prof.saveTxt.adv_vs, adv, source);
      else removeProf(prof.saveTxt.adv_vs, adv, source.source);
    }
  }
  
  if (txt.immune) {
    for (const imm of txt.immune) {
      if (addIt) addProf(prof.saveTxt.immune, imm, source);
      else removeProf(prof.saveTxt.immune, imm, source.source);
    }
  }
}

function processAdvantages(
  advantages: unknown,
  source: ProficiencySource,
  prof: ProficiencyTracker,
  addIt: boolean
): void {
  // Format: [["initiative", true], ["stealth", false]]
  if (!Array.isArray(advantages)) return;
  
  for (const adv of advantages) {
    if (Array.isArray(adv) && adv.length >= 2 && adv[1] === true) {
      const [type] = adv;
      if (addIt) addProf(prof.advantages, type as string, source);
      else removeProf(prof.advantages, type as string, source.source);
    }
  }
}

function processActions(
  feature: ClassFeature,
  sourceName: string,
  sourceType: 'class' | 'subclass' | 'race' | 'background' | 'feat' | 'item',
  actions: TrackedAction[],
  addIt: boolean
): void {
  if (!feature.action) return;
  
  // Format: [["action", "Feature Name"], ["bonus action"]]
  const featureActions = feature.action as ([string] | [string, string])[];
  
  for (const act of featureActions) {
    const actionType = parseActionType(act[0]);
    const actionName = act[1] ?? feature.name;
    
    if (addIt) {
      actions.push({
        name: actionName,
        type: actionType,
        source: sourceName,
        sourceType,
        description: feature.description,
      });
    }
  }
}

function processUsages(
  feature: ClassFeature,
  sourceName: string,
  sourceType: 'class' | 'subclass' | 'race' | 'background' | 'feat' | 'item',
  level: number,
  resources: Map<string, TrackedResource>,
  abilityScores: AbilityScores,
  totalLevel: number,
  addIt: boolean
): void {
  const resourceKey = `${sourceType}|${sourceName}|${feature.name}`;
  
  if (addIt) {
    const maxUses = resolveUsages(feature.usages, level, abilityScores, totalLevel);
    const recovery = parseRecovery(feature.recovery);
    
    resources.set(resourceKey, {
      id: resourceKey,
      name: feature.name,
      source: sourceName,
      sourceType,
      maxUses,
      maxUsesFormula: typeof feature.usages === 'string' ? feature.usages : undefined,
      currentUses: maxUses ?? 0,
      recovery,
      description: feature.description,
    });
  } else {
    resources.delete(resourceKey);
  }
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function parseActionType(type: string): ActionType {
  const normalized = type.toLowerCase().trim();
  if (normalized.includes('bonus')) return 'bonus action';
  if (normalized.includes('reaction')) return 'reaction';
  if (normalized.includes('free')) return 'free action';
  if (normalized.includes('action')) return 'action';
  return 'special';
}

function parseActionTypes(actions: ([string] | [string, string])[]): ActionType[] {
  return actions.map(a => parseActionType(a[0]));
}

function parseRecovery(recovery: string | undefined): RecoveryType {
  if (!recovery) return 'long rest';
  
  const normalized = recovery.toLowerCase();
  if (normalized.includes('short')) return 'short rest';
  if (normalized.includes('long')) return 'long rest';
  if (normalized.includes('dawn')) return 'dawn';
  if (normalized.includes('dusk')) return 'dusk';
  if (normalized.includes('never')) return 'never';
  return 'special';
}

/** Ability name → index in AbilityScores tuple [Str, Dex, Con, Int, Wis, Cha] */
const ABILITY_INDEX: Record<string, number> = {
  str: 0, strength: 0,
  dex: 1, dexterity: 1,
  con: 2, constitution: 2,
  int: 3, intelligence: 3,
  wis: 4, wisdom: 4,
  cha: 5, charisma: 5,
};

function resolveUsages(
  usages: number | number[] | string | undefined,
  level: number,
  abilityScores: AbilityScores,
  totalLevel: number
): number | null {
  if (usages === undefined) return null;
  if (typeof usages === 'number') return usages;
  if (Array.isArray(usages)) {
    const idx = Math.min(level, usages.length) - 1;
    return usages[idx] ?? null;
  }

  // String usages — parse ability modifier, proficiency bonus, or numeric strings
  const s = usages.toLowerCase().trim();

  // Pure numeric string (e.g. "3")
  const num = Number(s);
  if (!isNaN(num) && s !== '') return num;

  // Multiplier prefix, e.g. "2× Int mod per "
  let multiplier = 1;
  const multMatch = s.match(/^(\d+)\s*[×x]\s*/);
  if (multMatch) {
    multiplier = parseInt(multMatch[1], 10);
  }
  const rest = multMatch ? s.slice(multMatch[0].length) : s;

  // Ability modifier patterns: "Wisdom modifier per ", "Wis mod per "
  for (const [key, index] of Object.entries(ABILITY_INDEX)) {
    if (rest.startsWith(key)) {
      const mod = abilityMod(abilityScores[index]);
      return Math.max(1, mod * multiplier);
    }
  }

  // Proficiency bonus patterns
  if (rest.includes('half proficiency') || rest.includes('half prof')) {
    return Math.max(1, Math.ceil(profBonus(totalLevel) / 2) * multiplier);
  }
  if (rest.includes('proficiency') || rest.includes('prof b') || rest.includes('prof bonus')) {
    // "Proficiency Bonus × 2 per " — check for trailing multiplier too
    const trailingMult = rest.match(/[×x]\s*(\d+)/);
    const pbMult = trailingMult ? parseInt(trailingMult[1], 10) : 1;
    return Math.max(1, profBonus(totalLevel) * multiplier * pbMult);
  }

  // Unresolvable string (dice expressions, special text) — store formula, show null
  return null;
}

function resolveAdditional(
  additional: string[] | undefined,
  level: number
): string | undefined {
  if (!additional || !Array.isArray(additional)) return undefined;
  const idx = Math.min(level, additional.length) - 1;
  return additional[idx] || undefined;
}

// ─── Process Class/Race/Background ───────────────────────────────────────────

/**
 * Process all features from a class at a given level
 */
export function processClassFeatures(
  classData: DndClass,
  level: number,
  ctx: FeatureProcessorContext,
  addIt: boolean
): void {
  // Process class-level proficiencies (first level only for multiclass)
  if (level >= 1 && addIt) {
    // Process saves (only from primary class - handled elsewhere)
    
    // Process armor proficiencies
    if (classData.armorProfs?.primary) {
      processArmorProfs(
        classData.armorProfs.primary,
        { source: classData.name, sourceType: 'class' },
        ctx.proficiencies,
        true
      );
    }
    
    // Process weapon proficiencies
    if (classData.weaponProfs?.primary) {
      processWeaponProfs(
        classData.weaponProfs.primary,
        { source: classData.name, sourceType: 'class' },
        ctx.proficiencies,
        true
      );
    }
    
    // Process tool proficiencies
    if (classData.toolProfs?.primary) {
      processToolProfs(
        classData.toolProfs.primary,
        { source: classData.name, sourceType: 'class' },
        ctx.proficiencies,
        true
      );
    }
  }
  
  // Process features at or below level
  for (const [_featureKey, feature] of Object.entries(classData.features)) {
    if (feature.minlevel <= level) {
      processFeatureAttributes(
        feature,
        classData.name,
        'class',
        level,
        addIt,
        ctx
      );
    }
  }
}

/**
 * Process all features from a subclass at a given level
 */
export function processSubclassFeatures(
  subclassData: DndSubclass,
  level: number,
  ctx: FeatureProcessorContext,
  addIt: boolean
): void {
  for (const [_featureKey, feature] of Object.entries(subclassData.features)) {
    if (feature.minlevel <= level) {
      processFeatureAttributes(
        feature,
        subclassData.subname,
        'subclass',
        level,
        addIt,
        ctx
      );
    }
  }
}

/**
 * Process all features from a race
 */
export function processRaceFeatures(
  raceData: DndRace,
  ctx: FeatureProcessorContext,
  addIt: boolean
): void {
  const source: ProficiencySource = { source: raceData.name, sourceType: 'race' };
  
  if (addIt) {
    // Vision
    if (raceData.vision) {
      processVision(raceData.vision, source, ctx.proficiencies, true);
    }
    
    // Speed
    if (raceData.speed) {
      processSpeed(raceData.speed, source, ctx.proficiencies, true);
    }
    
    // Languages
    if (raceData.languageProfs) {
      processLanguageProfs(raceData.languageProfs, source, ctx.proficiencies, true);
    }
    
    // Skills
    if (raceData.skills) {
      for (const skill of raceData.skills) {
        addProf(ctx.proficiencies.skills, skill as Skill, source);
      }
    }
    
    // Damage resistance
    if (raceData.dmgres) {
      processResistance(raceData.dmgres, source, ctx.proficiencies, true);
    }
    
    // Save text
    if (raceData.savetxt) {
      processSaveTxt(raceData.savetxt, source, ctx.proficiencies, true);
    }
    
    // Armor proficiencies
    if (raceData.armorProfs) {
      processArmorProfs(raceData.armorProfs, source, ctx.proficiencies, true);
    }
    
    // Weapon proficiencies
    if (raceData.weaponProfs) {
      processWeaponProfs(raceData.weaponProfs, source, ctx.proficiencies, true);
    }
    
    // Tool proficiencies
    if (raceData.toolProfs) {
      processToolProfs(raceData.toolProfs, source, ctx.proficiencies, true);
    }
    
    // Advantages
    if (raceData.advantages) {
      processAdvantages(raceData.advantages, source, ctx.proficiencies, true);
    }
  }
  
  // Process race features
  if (raceData.features) {
    for (const [_featureKey, feature] of Object.entries(raceData.features)) {
      processFeatureAttributes(
        feature,
        raceData.name,
        'race',
        1, // Race features are always active
        addIt,
        ctx
      );
    }
  }
}

/**
 * Process background features
 */
export function processBackgroundFeatures(
  background: DndBackground,
  ctx: FeatureProcessorContext,
  addIt: boolean
): void {
  const source: ProficiencySource = { source: background.name, sourceType: 'background' };
  
  if (addIt) {
    // Skills
    if (background.skills) {
      for (const skill of background.skills) {
        addProf(ctx.proficiencies.skills, skill as Skill, source);
      }
    }
    
    // Tool proficiencies
    if (background.toolProfs) {
      processToolProfs(background.toolProfs, source, ctx.proficiencies, true);
    }
    
    // Language proficiencies
    if (background.languageProfs) {
      processLanguageProfs(background.languageProfs, source, ctx.proficiencies, true);
    }
  } else {
    // Remove skills
    if (background.skills) {
      for (const skill of background.skills) {
        removeProf(ctx.proficiencies.skills, skill as Skill, background.name);
      }
    }
  }
}

/**
 * Process feat
 */
export function processFeat(
  feat: DndFeat,
  ctx: FeatureProcessorContext,
  addIt: boolean
): void {
  const source: ProficiencySource = { source: feat.name, sourceType: 'feat' };
  
  if (addIt) {
    // Skills
    if (feat.skills) {
      for (const skill of feat.skills) {
        addProf(ctx.proficiencies.skills, skill as Skill, source);
      }
    }
  }
  
  // Process as a feature for actions/usages/calcChanges
  const asFeature: ClassFeature = {
    name: feat.name,
    minlevel: 1,
    description: feat.description,
    action: feat.action,
    usages: feat.usages as number | string | undefined,
    recovery: feat.recovery,
    calcChanges: feat.calcChanges as MpmbValue,
  };
  
  processFeatureAttributes(asFeature, feat.name, 'feat', 1, addIt, ctx);
}
