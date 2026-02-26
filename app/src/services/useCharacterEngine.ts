/**
 * useCharacterEngine hook
 * 
 * React hook that provides access to the CharacterEngine for a character.
 * Integrates with the Zustand store and memoizes engine instances.
 */

import { useMemo, useCallback } from 'react';
import type { Character, Skill } from '../types/character';
import type { CharacterEngine, CharacterEngineOptions } from '../types/engine';
import type { DndClass, DndSubclass, DndRace, DndRaceVariant, DndBackground, DndSpell, DndFeat, DndWeapon, DndArmor, DndMagicItem } from '../types/data';
import { createCharacterEngine, getActiveFeatures, getTrackedResources, getTrackedActions } from './character.engine';

// ─── Data Loader Types ───────────────────────────────────────────────────────

interface DataBundle {
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
}

// ─── Hook Return Type ────────────────────────────────────────────────────────

export interface UseCharacterEngineResult {
  engine: CharacterEngine | null;
  isReady: boolean;
  warnings: string[];
  
  // Computed values
  activeFeatures: ReturnType<typeof getActiveFeatures>;
  resources: ReturnType<typeof getTrackedResources>;
  actions: ReturnType<typeof getTrackedActions>;
  
  // Helpers
  calculateAttack: CharacterEngine['calculateAttack'] | null;
  calculateHp: CharacterEngine['calculateHp'] | null;
  calculateAc: CharacterEngine['calculateAc'] | null;
  getSpellStats: CharacterEngine['getSpellStats'] | null;
  meetsPrerequisites: CharacterEngine['meetsPrerequisites'] | null;
  
  // Resource management
  useResource: CharacterEngine['useResource'] | null;
  shortRest: () => void;
  longRest: () => void;
  
  // Rebuild if needed
  rebuildEngine: () => void;
}

// ─── Hook Implementation ─────────────────────────────────────────────────────

/**
 * Hook to get the CharacterEngine for a character
 * 
 * @param character - The character to create an engine for
 * @param data - The data bundle containing all D&D data
 * @returns Engine and computed values
 */
export function useCharacterEngine(
  character: Character | null,
  data: DataBundle | null
): UseCharacterEngineResult {
  // Create engine when character or data changes
  const { engine, warnings } = useMemo(() => {
    if (!character || !data) {
      return { engine: null, warnings: [] };
    }
    
    const options: CharacterEngineOptions = { data };
    return createCharacterEngine(character, options);
  }, [character, data]);
  
  // Computed values
  const activeFeatures = useMemo(() => {
    if (!engine) return [];
    return getActiveFeatures(engine);
  }, [engine]);
  
  const resources = useMemo(() => {
    if (!engine) return [];
    return getTrackedResources(engine);
  }, [engine]);
  
  const actions = useMemo(() => {
    if (!engine) return [];
    return getTrackedActions(engine);
  }, [engine]);
  
  // Callbacks
  const rebuildEngine = useCallback(() => {
    if (engine) {
      engine.rebuild();
    }
  }, [engine]);
  
  const shortRest = useCallback(() => {
    if (engine) {
      engine.resources.shortRest();
    }
  }, [engine]);
  
  const longRest = useCallback(() => {
    if (engine) {
      engine.resources.longRest();
    }
  }, [engine]);
  
  return {
    engine,
    isReady: !!engine,
    warnings,
    
    activeFeatures,
    resources,
    actions,
    
    calculateAttack: engine?.calculateAttack.bind(engine) ?? null,
    calculateHp: engine?.calculateHp.bind(engine) ?? null,
    calculateAc: engine?.calculateAc.bind(engine) ?? null,
    getSpellStats: engine?.getSpellStats.bind(engine) ?? null,
    meetsPrerequisites: engine?.meetsPrerequisites.bind(engine) ?? null,
    
    useResource: engine?.useResource.bind(engine) ?? null,
    shortRest,
    longRest,
    
    rebuildEngine,
  };
}

// ─── Builder Hook ────────────────────────────────────────────────────────────

/**
 * Simplified hook for use during character creation wizard
 * Focuses on prerequisite checking and preview calculations
 */
export interface UseBuilderPreviewResult {
  // Preview calculations
  previewHp: number;
  previewAc: number;
  
  // Prerequisite checking
  canSelectFeat: (featKey: string) => boolean;
  canSelectInvocation: (invocationKey: string) => boolean;
  
  // Spell list building
  getAvailableSpells: (className: string, spellLevel: number) => string[];
}

export function useBuilderPreview(
  draftToCharacter: () => Character | null,
  data: DataBundle | null
): UseBuilderPreviewResult {
  // Convert draft to character for preview
  const character = useMemo(() => draftToCharacter(), [draftToCharacter]);
  
  const { engine, calculateHp, calculateAc, meetsPrerequisites } = useCharacterEngine(character, data);
  
  // Preview HP
  const previewHp = useMemo(() => {
    if (!calculateHp) return 0;
    return calculateHp().totalHp;
  }, [calculateHp]);
  
  // Preview AC (unarmored)
  const previewAc = useMemo(() => {
    if (!calculateAc) return 10;
    return calculateAc(null, false).ac;
  }, [calculateAc]);
  
  // Feat prerequisite check
  const canSelectFeat = useCallback((featKey: string): boolean => {
    if (!engine || !meetsPrerequisites || !data) return true;
    
    const feat = data.feats.find(f => f._key === featKey);
    if (!feat?.prereqeval) return true;
    
    return meetsPrerequisites(feat.prereqeval);
  }, [engine, meetsPrerequisites, data]);
  
  // Invocation prerequisite check
  const canSelectInvocation = useCallback((_invocationKey: string): boolean => {
    // Would need invocations data to be passed
    return true;
  }, [engine, meetsPrerequisites]);
  
  // Available spells for a class at a level
  const getAvailableSpells = useCallback((className: string, spellLevel: number): string[] => {
    if (!engine || !data) return [];
    
    const entry = engine.spellcasting.entries.get(className);
    if (!entry) return [];
    
    // Filter by spell level
    return data.spells
      .filter(s => {
        const level = s.level ?? 0;
        if (level !== spellLevel) return false;
        
        // Check if on class spell list or extra spells
        return entry.spellList.includes(s._key) || entry.extraSpells.includes(s._key);
      })
      .map(s => s._key);
  }, [engine, data]);
  
  return {
    previewHp,
    previewAc,
    canSelectFeat,
    canSelectInvocation,
    getAvailableSpells,
  };
}

// ─── Derived Stats Integration ───────────────────────────────────────────────

/**
 * Compute full derived stats using the engine
 * This replaces/enhances the existing computeDerivedStats function
 */
export interface FullDerivedStats {
  // Combat
  hp: { base: number; bonus: number; total: number; sources: string[] };
  ac: { base: number; total: number; sources: string[] };
  initiative: number;
  speed: number;
  
  // Proficiencies
  proficiencyBonus: number;
  savingThrows: { [key: string]: { bonus: number; proficient: boolean } };
  skills: { [key: string]: { bonus: number; proficient: boolean; expertise: boolean } };
  
  // Spellcasting
  spellcasting: {
    [className: string]: {
      dc: number;
      attack: number;
      ability: number;
      slots: number[];
    };
  };
  
  // Resources
  resources: { id: string; name: string; current: number; max: number; recovery: string }[];
  
  // Actions
  actions: { name: string; type: string; source: string; description?: string }[];
}

export function computeFullDerivedStats(
  engine: CharacterEngine,
  equippedArmor: DndArmor | null,
  hasShield: boolean
): FullDerivedStats {
  const character = engine.character;
  const { proficiencies, spellcasting, resources, actions } = engine;
  
  // HP
  const hpResult = engine.calculateHp();
  
  // AC
  const acResult = engine.calculateAc(equippedArmor, hasShield);
  
  // Initiative (DEX mod + any bonuses)
  const dexMod = Math.floor((character.abilityScores[1] - 10) / 2);
  const initiative = dexMod; // TODO: Add initiative bonuses from features
  
  // Speed (base + modifications)
  const walkSources = proficiencies.speed.get('walk');
  const baseSpeed = walkSources?.[0]?.value ?? 30;
  
  // Proficiency bonus
  const pb = Math.floor((character.totalLevel - 1) / 4) + 2;
  
  // Saving throws
  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  const savingThrows: FullDerivedStats['savingThrows'] = {};
  abilities.forEach((ability, i) => {
    const mod = Math.floor((character.abilityScores[i] - 10) / 2);
    const proficient = proficiencies.saves.has(ability.toLowerCase());
    savingThrows[ability] = {
      bonus: mod + (proficient ? pb : 0),
      proficient,
    };
  });
  
  // Skills
  const skillAbilities: Record<string, number> = {
    'acrobatics': 1, 'animal handling': 4, 'arcana': 3, 'athletics': 0,
    'deception': 5, 'history': 3, 'insight': 4, 'intimidation': 5,
    'investigation': 3, 'medicine': 4, 'nature': 3, 'perception': 4,
    'performance': 5, 'persuasion': 5, 'religion': 3, 'sleight of hand': 1,
    'stealth': 1, 'survival': 4,
  };
  
  const skills: FullDerivedStats['skills'] = {};
  Object.entries(skillAbilities).forEach(([skill, abilityIdx]) => {
    const mod = Math.floor((character.abilityScores[abilityIdx] - 10) / 2);
    const proficient = proficiencies.skills.has(skill as Skill);
    const expertise = proficiencies.expertise.has(skill as Skill);
    
    let bonus = mod;
    if (expertise) bonus += pb * 2;
    else if (proficient) bonus += pb;
    
    skills[skill] = { bonus, proficient, expertise };
  });
  
  // Spellcasting stats
  const spellcastingStats: FullDerivedStats['spellcasting'] = {};
  for (const [className] of spellcasting.entries) {
    const stats = engine.getSpellStats(className);
    if (stats) {
      spellcastingStats[className] = {
        dc: stats.dc,
        attack: stats.attack,
        ability: stats.ability,
        slots: [...spellcasting.slots],
      };
    }
  }
  
  // Resources
  const resourceList = Array.from(resources.resources.values()).map(r => ({
    id: r.id,
    name: r.name,
    current: r.currentUses ?? 0,
    max: r.maxUses ?? 0,
    recovery: r.recovery ?? 'long rest',
  }));
  
  // Actions
  const actionList = actions.map(a => ({
    name: a.name,
    type: a.type,
    source: a.source,
    description: a.description,
  }));
  
  return {
    hp: {
      base: hpResult.baseHp,
      bonus: hpResult.bonusHp,
      total: hpResult.totalHp,
      sources: hpResult.sources,
    },
    ac: {
      base: 10,
      total: acResult.ac,
      sources: acResult.sources,
    },
    initiative,
    speed: baseSpeed,
    proficiencyBonus: pb,
    savingThrows,
    skills,
    spellcasting: spellcastingStats,
    resources: resourceList,
    actions: actionList,
  };
}
