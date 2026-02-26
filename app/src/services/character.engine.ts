/**
 * Character Engine
 * 
 * Central orchestrator for character state and calculations.
 * This is the main entry point that mirrors the PDF's global state management:
 * - CurrentClasses, CurrentRace, CurrentBackground
 * - CurrentProfs, CurrentEvals, CurrentVars
 * 
 * The engine:
 * 1. Resolves all character data (classes, race, background, feats)
 * 2. Processes all feature attributes
 * 3. Manages proficiency tracking
 * 4. Executes calcChanges hooks for calculations
 * 5. Tracks limited-use resourcess
 */

import type { Character, AbilityIndex, AttackEntry } from '../types/character';
import type {
  DndClass, DndSubclass, DndRaceVariant, DndBackground,
  DndFeat, DndWeapon, DndArmor, ClassFeature, MpmbValue
} from '../types/data';
import type {
  CharacterEngine,
  CharacterEngineOptions,
  CreateCharacterEngineResult,
  ResolvedClass,
  ResolvedRace,
  ProficiencyTracker,
  CalcChangesRegistry,
  ResourceTracker,
  TrackedResource,
  TrackedAction,
  ActiveFeature,
  SpellcastingState,
  SpellcastingEntry,
  AttackCalcContext,
  SpellCalcContext,
  HpCalcContext,
} from '../types/engine';
import type { FeatureProcessorContext } from './feature.processor';

import { abilityMod, profBonus, cantripDieByLevel } from './character.calculator';
import { createCalcChangesRegistry, runAtkCalcHooks, runHpHooks, runSpellCalcHooks } from './calcChanges.evaluator';
import { evaluatePrereq } from './prereq.evaluator';
import {
  createProficiencyTracker,
  processClassFeatures,
  processSubclassFeatures,
  processRaceFeatures,
  processBackgroundFeatures,
  processFeat,
  processFeatureAttributes,
} from './feature.processor';

// ─── Spellcasting Tables ─────────────────────────────────────────────────────

const MULTICLASS_SLOTS: number[][] = [
  [],
  [2,0,0,0,0,0,0,0,0],
  [3,0,0,0,0,0,0,0,0],
  [4,2,0,0,0,0,0,0,0],
  [4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],
  [4,3,3,0,0,0,0,0,0],
  [4,3,3,1,0,0,0,0,0],
  [4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],
  [4,3,3,3,2,0,0,0,0],
  [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,1,0,0],
  [4,3,3,3,2,1,1,0,0],
  [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,1],
  [4,3,3,3,3,1,1,1,1],
  [4,3,3,3,3,2,1,1,1],
  [4,3,3,3,3,2,2,1,1],
];

const WARLOCK_PACT: [number, number][] = [
  [1,1],[2,1],[2,2],[2,2],[2,3],
  [2,3],[2,4],[2,4],[2,5],[2,5],
  [3,5],[3,5],[3,5],[3,5],[3,5],
  [3,5],[4,5],[4,5],[4,5],[4,5],
];

// ─── Engine Implementation ───────────────────────────────────────────────────

class CharacterEngineImpl implements CharacterEngine {
  readonly character: Character;
  readonly classes: Map<string, ResolvedClass> = new Map();
  race: ResolvedRace | null = null;
  background: DndBackground | null = null;
  readonly feats: DndFeat[] = [];
  
  readonly proficiencies: ProficiencyTracker;
  readonly calcChanges: CalcChangesRegistry;
  readonly resources: ResourceTracker;
  actions: TrackedAction[] = [];
  activeFeatures: ActiveFeature[] = [];
  spellcasting: SpellcastingState;
  
  private _resourceMap: Map<string, TrackedResource> = new Map();
  private data: CharacterEngineOptions['data'];
  private warnings: string[] = [];
  
  constructor(character: Character, options: CharacterEngineOptions) {
    this.character = character;
    this.data = options.data;
    
    // Initialize trackers
    this.proficiencies = createProficiencyTracker();
    this.calcChanges = createCalcChangesRegistry();
    this.spellcasting = {
      entries: new Map(),
      slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      pactSlots: null,
      bonusSpells: new Map(),
    };
    
    // Initialize resource tracker
    this.resources = {
      resources: this._resourceMap,
      shortRest: () => this.shortRest(),
      longRest: () => this.longRest(),
    };
    
    // Build initial state
    this.rebuild();
  }
  
  // ─── Rebuild All State ─────────────────────────────────────────────────────
  
  rebuild(): void {
    // Clear existing state
    this.classes.clear();
    this.race = null;
    this.background = null;
    this.feats.length = 0;
    this._resourceMap.clear();
    this.actions = [];
    this.activeFeatures = [];
    this.spellcasting.entries.clear();
    this.spellcasting.bonusSpells.clear();
    this.warnings = [];
    
    // Reset proficiency tracker
    Object.assign(this.proficiencies, createProficiencyTracker());
    
    // Reset calcChanges
    Object.assign(this.calcChanges, createCalcChangesRegistry());
    
    const ctx = this.createProcessorContext();
    
    // ─── Resolve Classes ─────────────────────────────────────────────────────
    for (const cc of this.character.classes) {
      const classData = this.data.classes.find(c => c._key === cc.classKey);
      if (!classData) {
        this.warnings.push(`Class not found: ${cc.classKey}`);
        continue;
      }
      
      let subclassData: DndSubclass | null = null;
      if (cc.subclassKey) {
        subclassData = this.data.subclasses.find(s => s._key === cc.subclassKey) ?? null;
        if (!subclassData) {
          this.warnings.push(`Subclass not found: ${cc.subclassKey}`);
        }
      }
      
      // Merge features
      const activeFeatures = new Map<string, ClassFeature & { fromSubclass: boolean }>();
      
      // Class features at or below level
      for (const [key, feature] of Object.entries(classData.features)) {
        if (feature.minlevel <= cc.level) {
          activeFeatures.set(key, { ...feature, fromSubclass: false });
        }
      }
      
      // Subclass features
      if (subclassData) {
        for (const [key, feature] of Object.entries(subclassData.features)) {
          if (feature.minlevel <= cc.level) {
            activeFeatures.set(key, { ...feature, fromSubclass: true });
          }
        }
      }
      
      const resolved: ResolvedClass = {
        classData,
        subclassData,
        level: cc.level,
        activeFeatures,
      };
      
      this.classes.set(cc.classKey, resolved);
      
      // Process class features
      processClassFeatures(classData, cc.level, ctx, true);
      
      // Process subclass features
      if (subclassData) {
        processSubclassFeatures(subclassData, cc.level, ctx, true);
      }
      
      // Setup spellcasting entry
      this.setupSpellcastingEntry(classData, subclassData, cc.level);
    }
    
    // ─── Resolve Race ────────────────────────────────────────────────────────
    const raceData = this.data.races.find(r => r._key === this.character.race);
    if (raceData) {
      let variantData: DndRaceVariant | null = null;
      if (this.character.raceVariant) {
        variantData = this.data.raceVariants.find(v => v._key === this.character.raceVariant) ?? null;
      }
      
      // Merge race + variant features
      const activeFeatures = new Map<string, ClassFeature>();
      if (raceData.features) {
        for (const [key, feature] of Object.entries(raceData.features)) {
          activeFeatures.set(key, feature);
        }
      }
      
      this.race = { raceData, variantData, activeFeatures };
      
      // Process race features
      processRaceFeatures(raceData, ctx, true);
    } else {
      this.warnings.push(`Race not found: ${this.character.race}`);
    }
    
    // ─── Resolve Background ──────────────────────────────────────────────────
    const backgroundData = this.data.backgrounds.find(b => b._key === this.character.background);
    if (backgroundData) {
      this.background = backgroundData;
      processBackgroundFeatures(backgroundData, ctx, true);
    } else {
      this.warnings.push(`Background not found: ${this.character.background}`);
    }
    
    // ─── Resolve Feats ───────────────────────────────────────────────────────
    if (this.character.feats) {
      for (const featKey of this.character.feats) {
        const featData = this.data.feats.find(f => f._key === featKey);
        if (featData) {
          this.feats.push(featData);
          processFeat(featData, ctx, true);
        } else {
          this.warnings.push(`Feat not found: ${featKey}`);
        }
      }
    }
    
    // ─── Calculate Spell Slots ───────────────────────────────────────────────
    this.calculateSpellSlots();
  }
  
  private createProcessorContext(): FeatureProcessorContext {
    return {
      character: this.character,
      proficiencies: this.proficiencies,
      calcChanges: this.calcChanges,
      resources: this._resourceMap,
      actions: this.actions,
      activeFeatures: this.activeFeatures,
    };
  }
  
  // ─── Apply Feature Attributes ──────────────────────────────────────────────
  
  applyFeatureAttributes(
    feature: ClassFeature,
    sourceName: string,
    sourceType: 'class' | 'subclass' | 'race' | 'background' | 'feat' | 'item',
    level: number,
    addIt: boolean
  ): void {
    const ctx = this.createProcessorContext();
    processFeatureAttributes(feature, sourceName, sourceType, level, addIt, ctx);
  }
  
  // ─── Spellcasting Setup ────────────────────────────────────────────────────
  
  private setupSpellcastingEntry(
    classData: DndClass,
    subclassData: DndSubclass | null,
    level: number
  ): void {
    const factor = classData.spellcastingFactor;
    if (!factor) return;
    
    const castingAbility = classData.spellcastingAbility as AbilityIndex | undefined;
    if (castingAbility === undefined) return;
    
    let spellcastingFactor: number;
    if (typeof factor === 'number') {
      spellcastingFactor = factor;
    } else if (typeof factor === 'string') {
      // Parse string factor like "warlock1" or "half"
      if (factor === 'warlock1') spellcastingFactor = 0;
      else if (factor.includes('half')) spellcastingFactor = 0.5;
      else if (factor.includes('third')) spellcastingFactor = 0.33;
      else spellcastingFactor = 1;
    } else {
      spellcastingFactor = 1;
    }
    
    // Determine cantrips and spells known
    let cantripsKnown = 0;
    let spellsKnown = 0;
    if (classData.spellcastingKnown) {
      if (classData.spellcastingKnown.cantrips) {
        cantripsKnown = classData.spellcastingKnown.cantrips[Math.min(level, classData.spellcastingKnown.cantrips.length) - 1] ?? 0;
      }
      if (classData.spellcastingKnown.spells) {
        spellsKnown = classData.spellcastingKnown.spells[Math.min(level, classData.spellcastingKnown.spells.length) - 1] ?? 0;
      }
    }
    
    // Get base spell list
    const spellList = this.data.spells
      .filter(s => s.classes.includes(classData._key))
      .map(s => s._key);
    
    // Get extra spells from subclass
    const extraSpells: string[] = [];
    if (subclassData?.spellcastingExtra) {
      extraSpells.push(...subclassData.spellcastingExtra);
    }
    
    const entry: SpellcastingEntry = {
      className: classData._key,
      subclassName: subclassData?.subname,
      castingAbility,
      spellcastingFactor,
      classLevel: level,
      cantripsKnown,
      spellsKnown,
      prepared: classData.spellcastingKnown?.prepared ?? false,
      spellList,
      extraSpells,
      ritualOnly: false,
      pactMagic: classData._key === 'warlock',
    };
    
    this.spellcasting.entries.set(classData._key, entry);
  }
  
  private calculateSpellSlots(): void {
    // Reset slots
    this.spellcasting.slots = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.spellcasting.pactSlots = null;
    
    let combinedLevel = 0;
    let warlockLevel = 0;
    
    for (const entry of this.spellcasting.entries.values()) {
      if (entry.pactMagic) {
        warlockLevel = entry.classLevel;
        continue;
      }
      combinedLevel += Math.floor(entry.classLevel * entry.spellcastingFactor);
    }
    
    // Standard multiclass slots
    if (combinedLevel > 0) {
      const row = MULTICLASS_SLOTS[Math.min(combinedLevel, 20)];
      row.forEach((n, i) => { this.spellcasting.slots[i + 1] += n; });
    }
    
    // Warlock pact slots (separate)
    if (warlockLevel > 0) {
      const [count, level] = WARLOCK_PACT[Math.min(warlockLevel, 20) - 1];
      this.spellcasting.pactSlots = { count, level };
    }
  }
  
  // ─── Attack Calculation ────────────────────────────────────────────────────
  
  calculateAttack(
    attack: AttackEntry,
    weapon: DndWeapon | null
  ): {
    toHit: number;
    damage: string;
    damageType: string;
    attackStr: string;
    notes: string[];
  } {
    const pb = profBonus(this.character.totalLevel);
    const mods = this.character.abilityScores.map(s => abilityMod(s));
    
    // Determine ability modifier
    let abilityIdx: number;
    if (weapon) {
      // Use weapon's ability
      abilityIdx = weapon.ability - 1; // weapon ability is 1-indexed
      // Finesse: use higher of STR/DEX
      if (weapon.description?.toLowerCase().includes('finesse')) {
        abilityIdx = mods[0] >= mods[1] ? 0 : 1;
      }
    } else if (attack.abilityUsed) {
      const abilityMap: Record<string, number> = { STR: 0, DEX: 1, INT: 3, WIS: 4, CHA: 5 };
      abilityIdx = abilityMap[attack.abilityUsed] ?? 0;
    } else {
      abilityIdx = 0; // Default to STR
    }
    
    const abilityMod_ = mods[abilityIdx];
    const isProficient = attack.proficient ?? this.isProficientWithWeapon(weapon);
    const magicBonus = attack.magicBonus ?? 0;
    
    // Build calc context
    const ctx: AttackCalcContext = {
      weaponKey: attack.weaponKey ?? '',
      weapon,
      attackType: attack.attackType ?? (weapon?.list === 'ranged' ? 'ranged' : 'melee'),
      isMelee: (attack.attackType ?? weapon?.list) === 'melee',
      isRanged: (attack.attackType ?? weapon?.list) === 'ranged',
      isSpell: attack.attackType === 'spell',
      baseAbility: abilityIdx,
      abilityMod: abilityMod_,
      proficient: isProficient,
      profBonus: pb,
      magicBonus,
      isOffHand: attack.isOffHand ?? false,
      fields: {
        Weapon_Attack_Bonus: 0,
        Weapon_Damage_Bonus: 0,
        Weapon_Attack_Dc: 0,
        attackStr: '',
        damageStr: '',
      },
    };
    
    // Run calcChanges hooks
    const hookNotes = runAtkCalcHooks(this.calcChanges, ctx);
    
    // Calculate final to-hit
    let toHit = abilityMod_ + magicBonus + ctx.fields.Weapon_Attack_Bonus;
    if (isProficient) toHit += pb;
    
    // Calculate damage
    let damageDice = '';
    let damageType = attack.damageType ?? 'bludgeoning';
    
    if (weapon) {
      const [count, die, type] = weapon.damage;
      damageDice = `${count}d${die}`;
      damageType = type;
    } else if (attack.damageFormula) {
      damageDice = attack.damageFormula;
    }
    
    let damageBonus = magicBonus + ctx.fields.Weapon_Damage_Bonus;
    if (weapon?.abilitytodamage !== false && !attack.isOffHand) {
      damageBonus += abilityMod_;
    }
    
    const bonusStr = damageBonus >= 0 ? `+${damageBonus}` : damageBonus.toString();
    const damage = damageDice ? `${damageDice}${bonusStr}` : '';
    
    // Build attack string
    const toHitStr = toHit >= 0 ? `+${toHit}` : toHit.toString();
    const attackStr = `${toHitStr} to hit${ctx.fields.attackStr}`;
    
    return {
      toHit,
      damage,
      damageType,
      attackStr,
      notes: hookNotes,
    };
  }
  
  private isProficientWithWeapon(weapon: DndWeapon | null): boolean {
    if (!weapon) return false;
    
    // Check specific weapon proficiency
    if (this.proficiencies.weapons.has(weapon._key)) return true;
    if (this.proficiencies.weapons.has(weapon.name.toLowerCase())) return true;
    
    // Check type proficiency
    if (weapon.type === 'Simple' && this.proficiencies.weapons.has('simple')) return true;
    if (weapon.type === 'Martial' && this.proficiencies.weapons.has('martial')) return true;
    
    return false;
  }
  
  // ─── HP Calculation ────────────────────────────────────────────────────────
  
  calculateHp(): { baseHp: number; bonusHp: number; totalHp: number; sources: string[] } {
    const conMod = abilityMod(this.character.abilityScores[2]);
    
    // Calculate base HP from hit dice
    let baseHp = 0;
    const hdObject: Record<number, number> = {};
    
    for (const cc of this.character.classes) {
      const classData = this.data.classes.find(c => c._key === cc.classKey);
      if (!classData) continue;
      
      const die = classData.die ?? 8;
      hdObject[die] = (hdObject[die] ?? 0) + cc.level;
      
      // Add HP from hpPerLevel (actual rolls/max values stored on character)
      baseHp += cc.hpPerLevel.reduce((sum, hp) => sum + hp, 0);
    }
    
    // Add CON modifier per level
    baseHp += conMod * this.character.totalLevel;
    
    // Run HP hooks
    const ctx: HpCalcContext = {
      totalHD: this.character.totalLevel,
      hdObject,
      constitutionMod: conMod,
      level: this.character.totalLevel,
      baseHp,
      extraHp: 0,
    };
    
    const sources = runHpHooks(this.calcChanges, ctx);
    
    return {
      baseHp,
      bonusHp: ctx.extraHp,
      totalHp: baseHp + ctx.extraHp,
      sources,
    };
  }
  
  // ─── AC Calculation ────────────────────────────────────────────────────────
  
  calculateAc(armor: DndArmor | null, hasShield: boolean): { ac: number; sources: string[] } {
    const mods = this.character.abilityScores.map(s => abilityMod(s));
    const dexMod = mods[1];
    const sources: string[] = [];
    
    let ac: number;
    
    if (armor) {
      const baseAc = typeof armor.ac === 'number' ? armor.ac : 10;
      switch (armor.type) {
        case 'light':
          ac = baseAc + dexMod;
          sources.push(`${armor.name} (${baseAc} + DEX)`);
          break;
        case 'medium':
          ac = baseAc + Math.min(dexMod, 2);
          sources.push(`${armor.name} (${baseAc} + DEX max 2)`);
          break;
        case 'heavy':
          ac = baseAc;
          sources.push(`${armor.name} (${baseAc})`);
          break;
        default:
          ac = armor.addMod ? baseAc + dexMod : baseAc;
          sources.push(armor.name);
      }
    } else {
      // Unarmored
      ac = 10 + dexMod;
      sources.push('Unarmored (10 + DEX)');
      
      // Check for Unarmored Defense
      const classKeys = this.character.classes.map(c => c.classKey);
      
      if (classKeys.includes('barbarian')) {
        const barbarianAc = 10 + dexMod + mods[2];
        if (barbarianAc > ac) {
          ac = barbarianAc;
          sources.length = 0;
          sources.push('Unarmored Defense (10 + DEX + CON)');
        }
      }
      
      if (classKeys.includes('monk')) {
        const monkAc = 10 + dexMod + mods[4];
        if (monkAc > ac) {
          ac = monkAc;
          sources.length = 0;
          sources.push('Unarmored Defense (10 + DEX + WIS)');
        }
      }
    }
    
    if (hasShield) {
      ac += 2;
      sources.push('Shield (+2)');
    }
    
    return { ac, sources };
  }
  
  // ─── Spell Stats ───────────────────────────────────────────────────────────
  
  getSpellStats(className: string): { dc: number; attack: number; ability: AbilityIndex } | null {
    const entry = this.spellcasting.entries.get(className);
    if (!entry) return null;
    
    const pb = profBonus(this.character.totalLevel);
    const abilityMod_ = abilityMod(this.character.abilityScores[entry.castingAbility]);
    
    // Build context and run hooks
    const ctx: SpellCalcContext = {
      spellKey: '',
      spell: null,
      casterClass: className,
      castingAbility: entry.castingAbility,
      spellLevel: 0,
      isCantrip: false,
      fields: {
        spellDc: 8 + pb + abilityMod_,
        spellAttack: pb + abilityMod_,
        cantripDie: cantripDieByLevel(this.character.totalLevel),
        description: '',
      },
    };
    
    runSpellCalcHooks(this.calcChanges, ctx);
    
    return {
      dc: ctx.fields.spellDc,
      attack: ctx.fields.spellAttack,
      ability: entry.castingAbility,
    };
  }
  
  // ─── Prerequisite Check ────────────────────────────────────────────────────
  
  meetsPrerequisites(prereqeval: MpmbValue): boolean {
    return evaluatePrereq(prereqeval, this.character);
  }
  
  // ─── Resource Management ───────────────────────────────────────────────────
  
  useResource(resourceId: string): boolean {
    const resource = this._resourceMap.get(resourceId);
    if (!resource || resource.currentUses <= 0) return false;
    
    resource.currentUses--;
    return true;
  }
  
  shortRest(): void {
    for (const resource of this._resourceMap.values()) {
      if (resource.recovery === 'short rest') {
        resource.currentUses = resource.maxUses ?? 0;
      }
    }
  }
  
  longRest(): void {
    for (const resource of this._resourceMap.values()) {
      if (resource.recovery === 'short rest' || resource.recovery === 'long rest' || resource.recovery === 'dawn') {
        resource.currentUses = resource.maxUses ?? 0;
      }
    }
  }
  
  // ─── Getters for computed values ───────────────────────────────────────────
  
  getWarnings(): string[] {
    return [...this.warnings];
  }
}

// ─── Factory Function ────────────────────────────────────────────────────────

/**
 * Create a new CharacterEngine for a character
 */
export function createCharacterEngine(
  character: Character,
  options: CharacterEngineOptions
): CreateCharacterEngineResult {
  const engine = new CharacterEngineImpl(character, options);
  
  return {
    engine,
    warnings: engine.getWarnings(),
  };
}

// ─── React Hook Integration ──────────────────────────────────────────────────

/**
 * Get all active features with their resolved additional text
 */
export function getActiveFeatures(engine: CharacterEngine): ActiveFeature[] {
  return engine.activeFeatures;
}

/**
 * Get all tracked resources
 */
export function getTrackedResources(engine: CharacterEngine): TrackedResource[] {
  return Array.from(engine.resources.resources.values());
}

/**
 * Get all tracked actions
 */
export function getTrackedActions(engine: CharacterEngine): TrackedAction[] {
  return engine.actions;
}

/**
 * Check if a feat's prerequisites are met
 */
export function canSelectFeat(engine: CharacterEngine, feat: DndFeat): boolean {
  if (!feat.prereqeval) return true;
  return engine.meetsPrerequisites(feat.prereqeval as MpmbValue);
}

/**
 * Check if an invocation's prerequisites are met
 */
export function canSelectInvocation(
  engine: CharacterEngine,
  invocation: { prereqeval?: MpmbValue }
): boolean {
  if (!invocation.prereqeval) return true;
  return engine.meetsPrerequisites(invocation.prereqeval);
}

/**
 * Get spell list for a class, with all modifications applied
 */
export function getSpellListForClass(
  engine: CharacterEngine,
  className: string
): string[] {
  const entry = engine.spellcasting.entries.get(className);
  if (!entry) return [];
  
  // Start with base spell list + extra spells
  let spellList = [...entry.spellList, ...entry.extraSpells];
  
  // Add bonus spells from race/feats/items
  for (const [_key, bonus] of engine.spellcasting.bonusSpells) {
    if (!spellList.includes(bonus.spellKey)) {
      spellList.push(bonus.spellKey);
    }
  }
  
  return spellList;
}
