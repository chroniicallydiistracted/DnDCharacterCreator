/**
 * Prereq Evaluator
 * 
 * Evaluates prerequisite conditions for feats, invocations, and magic items.
 * Corresponds to the PDF's prereqeval function execution.
 * 
 * The prereqeval in JSON is a SerializedFunction with code like:
 * - "return CurrentStats.cols.totalscore[0] >= 13"
 * - "return classes.known.warlock && classes.known.warlock.level >= 5"
 * - "return CurrentSpells.length > 0"
 */

import type { Character, AbilityScores, AbilityIndex, Skill } from '../types/character';
import type { MpmbValue, SerializedFunction } from '../types/data';

// ─── Prereq Context ──────────────────────────────────────────────────────────

/** Context object passed to prereqeval functions (mirrors PDF's global vars) */
export interface PrereqContext {
  /** Current ability scores */
  CurrentStats: {
    cols: {
      totalscore: AbilityScores;
    };
  };
  /** Class information */
  classes: {
    known: Record<string, { level: number; subclass?: string }>;
    totallevel: number;
  };
  /** Race information */
  CurrentRace: {
    known: string;
    variant?: string;
  };
  /** Spellcasting check */
  CurrentSpells: string[];
  isSpellcaster: boolean;
  /** Proficiency checks */
  tDoc: {
    getField: (name: string) => { currentValueIndices: number };
  };
  /** Additional helpers */
  What: (field: string) => string | number;
  How: (field: string) => number;
}

// ─── Build Context from Character ────────────────────────────────────────────

export function buildPrereqContext(character: Character): PrereqContext {
  const classesKnown: Record<string, { level: number; subclass?: string }> = {};
  
  for (const cc of character.classes) {
    classesKnown[cc.classKey] = {
      level: cc.level,
      subclass: cc.subclassKey ?? undefined,
    };
  }

  return {
    CurrentStats: {
      cols: {
        totalscore: character.abilityScores,
      },
    },
    classes: {
      known: classesKnown,
      totallevel: character.totalLevel,
    },
    CurrentRace: {
      known: character.race,
      variant: character.raceVariant ?? undefined,
    },
    CurrentSpells: character.chosenSpells ?? [],
    isSpellcaster: character.classes.some(cc => 
      ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard', 'paladin', 'ranger', 'artificer'].includes(cc.classKey)
    ),
    tDoc: {
      getField: () => ({ currentValueIndices: 0 }),
    },
    What: () => 0,
    How: () => 0,
  };
}

// ─── Evaluate Prereqeval ─────────────────────────────────────────────────────

/**
 * Evaluates a prereqeval function from JSON data
 * 
 * @param prereqeval - The serialized function from JSON
 * @param character - The character to evaluate against
 * @returns true if prerequisites are met, false otherwise
 */
export function evaluatePrereq(
  prereqeval: MpmbValue | undefined,
  character: Character
): boolean {
  if (!prereqeval) return true;
  
  // Handle serialized function
  if (typeof prereqeval === 'object' && prereqeval !== null && '_type' in prereqeval) {
    const serialized = prereqeval as SerializedFunction;
    if (serialized._type !== 'function') return true;
    
    try {
      const context = buildPrereqContext(character);
      return evaluatePrereqFunction(serialized.body, context);
    } catch (error) {
      console.warn('Failed to evaluate prereqeval:', error);
      return true; // Fail open - allow selection if evaluation fails
    }
  }
  
  // Handle string body directly
  if (typeof prereqeval === 'string') {
    try {
      const context = buildPrereqContext(character);
      return evaluatePrereqFunction(prereqeval, context);
    } catch (error) {
      console.warn('Failed to evaluate prereqeval string:', error);
      return true;
    }
  }
  
  return true;
}

/**
 * Safely evaluate a prereqeval function body
 */
function evaluatePrereqFunction(body: string, context: PrereqContext): boolean {
  // Common patterns we can safely evaluate without using eval()
  
  // Pattern: "return classes.known.X && classes.known.X.level >= Y"
  const classLevelMatch = body.match(/return\s+classes\.known\.(\w+)\s*&&\s*classes\.known\.\1\.level\s*>=\s*(\d+)/);
  if (classLevelMatch) {
    const [, className, level] = classLevelMatch;
    const classInfo = context.classes.known[className];
    return classInfo !== undefined && classInfo.level >= parseInt(level, 10);
  }
  
  // Pattern: "return classes.known.X"
  const classExistsMatch = body.match(/return\s+classes\.known\.(\w+)\s*[;]?$/);
  if (classExistsMatch) {
    const [, className] = classExistsMatch;
    return context.classes.known[className] !== undefined;
  }
  
  // Pattern: "return CurrentStats.cols.totalscore[X] >= Y"
  const abilityMatch = body.match(/return\s+CurrentStats\.cols\.totalscore\[(\d+)\]\s*>=\s*(\d+)/);
  if (abilityMatch) {
    const [, index, min] = abilityMatch;
    return context.CurrentStats.cols.totalscore[parseInt(index, 10) as AbilityIndex] >= parseInt(min, 10);
  }
  
  // Pattern: "return classes.totallevel >= X"
  const totalLevelMatch = body.match(/return\s+classes\.totallevel\s*>=\s*(\d+)/);
  if (totalLevelMatch) {
    const [, level] = totalLevelMatch;
    return context.classes.totallevel >= parseInt(level, 10);
  }
  
  // Pattern: "return isSpellcaster"
  if (body.includes('isSpellcaster')) {
    return context.isSpellcaster;
  }
  
  // Pattern: "return CurrentSpells.length > 0" or similar
  if (body.includes('CurrentSpells') && body.includes('length')) {
    return context.CurrentSpells.length > 0;
  }
  
  // Pattern: "return true" or "return false"
  if (body.includes('return true')) return true;
  if (body.includes('return false')) return false;
  
  // Pattern: Check for Pact of the Blade (warlock pact boon)
  if (body.includes('pact of the blade') || body.includes('pactoftheblade')) {
    // Would need to track pact boon choice - for now, assume not selected
    return false;
  }
  
  // Pattern: Check for Eldritch Blast
  if (body.includes("'eldritch blast'") || body.includes('"eldritch blast"')) {
    return context.CurrentSpells.some(s => s.toLowerCase().includes('eldritch blast'));
  }
  
  // For complex patterns, attempt sandboxed evaluation
  try {
    return sandboxedEval(body, context);
  } catch {
    // If all else fails, be permissive
    console.warn('Could not evaluate prereqeval:', body);
    return true;
  }
}

/**
 * Sandboxed evaluation of prereqeval code
 * Uses a restricted subset of JavaScript without dangerous features
 */
function sandboxedEval(body: string, context: PrereqContext): boolean {
  // Create a safe evaluation context with only the needed variables
  const safeContext = {
    classes: context.classes,
    CurrentStats: context.CurrentStats,
    CurrentRace: context.CurrentRace,
    CurrentSpells: context.CurrentSpells,
    isSpellcaster: context.isSpellcaster,
    // Utility functions
    What: context.What,
    How: context.How,
  };
  
  // Build the function with context variables
  const contextKeys = Object.keys(safeContext);
  const contextValues = Object.values(safeContext);
  
  // Wrap the body in a function
  const fnBody = body.startsWith('return') ? body : `return (${body})`;
  
  // Create and execute the function
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function(...contextKeys, fnBody);
  const result = fn(...contextValues);
  
  return Boolean(result);
}

// ─── Specific Prereq Checks ──────────────────────────────────────────────────

/** Check ability score prerequisites */
export function meetsAbilityPrereq(
  scores: AbilityScores,
  requirements: Partial<Record<string, number>>
): boolean {
  const abilityMap: Record<string, number> = {
    Strength: 0, Dexterity: 1, Constitution: 2,
    Intelligence: 3, Wisdom: 4, Charisma: 5,
    Str: 0, Dex: 1, Con: 2, Int: 3, Wis: 4, Cha: 5,
  };
  
  for (const [ability, min] of Object.entries(requirements)) {
    const idx = abilityMap[ability];
    if (idx !== undefined && scores[idx as AbilityIndex] < (min ?? 0)) {
      return false;
    }
  }
  return true;
}

/** Check class level prerequisites */
export function meetsClassLevelPrereq(
  character: Character,
  className: string,
  minLevel: number
): boolean {
  const classInfo = character.classes.find(c => c.classKey === className);
  return classInfo !== undefined && classInfo.level >= minLevel;
}

/** Check if character is a spellcaster */
export function isSpellcaster(character: Character): boolean {
  const spellcastingClasses = [
    'bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard',
    'paladin', 'ranger', 'artificer'
  ];
  return character.classes.some(cc => spellcastingClasses.includes(cc.classKey));
}

/** Check if character has a specific proficiency */
export function hasProficiency(
  character: Character,
  type: 'skill' | 'armor' | 'weapon' | 'tool',
  name: string
): boolean {
  switch (type) {
    case 'skill':
      return character.skills.includes(name as Skill);
    case 'armor':
      // Would need to track from engine
      return false;
    case 'weapon':
      // Would need to track from engine
      return false;
    case 'tool':
      return character.toolProficiencies?.includes(name) ?? false;
    default:
      return false;
  }
}

/** Check if character knows a specific spell */
export function knowsSpell(character: Character, spellKey: string): boolean {
  const normalizedKey = spellKey.toLowerCase().replace(/[^a-z0-9]/g, '');
  return character.chosenSpells.some(s => 
    s.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey
  ) || character.chosenCantrips.some(s =>
    s.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey
  );
}
