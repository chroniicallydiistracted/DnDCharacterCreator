/**
 * CalcChanges Evaluator
 * 
 * Evaluates and executes calcChanges hooks from features.
 * These hooks modify calculations for attacks, spells, HP, etc.
 * 
 * Corresponds to the PDF's CurrentEvals system:
 * - atkCalc: Modify attack to-hit and damage
 * - atkAdd: Add attack properties/text
 * - spellCalc: Modify spell DC and attack
 * - spellAdd: Modify spell properties
 * - spellList: Modify available spell list
 * - hp: Modify HP calculation
 */

import type { Character } from '../types/character';
import type { SerializedFunction } from '../types/data';
import type {
  AttackCalcContext,
  SpellCalcContext,
  HpCalcContext,
  CalcChangesRegistry,
} from '../types/engine';

// ─── Registry Management ─────────────────────────────────────────────────────

/** Create an empty CalcChanges registry */
export function createCalcChangesRegistry(): CalcChangesRegistry {
  return {
    atkCalc: new Map(),
    atkAdd: new Map(),
    spellList: new Map(),
    spellAdd: new Map(),
    spellCalc: new Map(),
    hp: new Map(),
  };
}

// ─── Register/Unregister Hooks ───────────────────────────────────────────────

/**
 * Register calcChanges hooks from a feature
 */
export function registerCalcChanges(
  registry: CalcChangesRegistry,
  featureKey: string,
  calcChanges: unknown,
  character: Character
): void {
  if (!calcChanges || typeof calcChanges !== 'object') return;
  
  const changes = calcChanges as Record<string, unknown>;
  
  // atkCalc - attack calculation hook
  if (changes.atkCalc) {
    const hook = parseCalcHook(changes.atkCalc);
    if (hook) {
      registry.atkCalc.set(featureKey, {
        fn: (ctx) => executeAtkCalcHook(hook.body, ctx, character),
        description: hook.description,
      });
    }
  }
  
  // atkAdd - attack property hook
  if (changes.atkAdd) {
    const hook = parseCalcHook(changes.atkAdd);
    if (hook) {
      registry.atkAdd.set(featureKey, {
        fn: (ctx) => executeAtkAddHook(hook.body, ctx, character),
        description: hook.description,
      });
    }
  }
  
  // spellCalc - spell DC/attack hook
  if (changes.spellCalc) {
    const hook = parseCalcHook(changes.spellCalc);
    if (hook) {
      registry.spellCalc.set(featureKey, {
        fn: (ctx) => executeSpellCalcHook(hook.body, ctx, character),
        description: hook.description,
      });
    }
  }
  
  // spellAdd - spell property hook
  if (changes.spellAdd) {
    const hook = parseCalcHook(changes.spellAdd);
    if (hook) {
      registry.spellAdd.set(featureKey, {
        fn: (ctx) => executeSpellAddHook(hook.body, ctx, character),
        description: hook.description,
      });
    }
  }
  
  // spellList - spell list modification
  if (changes.spellList) {
    const hook = parseCalcHook(changes.spellList);
    if (hook) {
      registry.spellList.set(featureKey, {
        fn: (spellList, className, level) => 
          executeSpellListHook(hook.body, spellList, className, level, character),
        description: hook.description,
      });
    }
  }
  
  // hp - HP modification
  if (changes.hp) {
    const hook = parseCalcHook(changes.hp);
    if (hook) {
      registry.hp.set(featureKey, {
        fn: (ctx) => executeHpHook(hook.body, ctx, character),
        description: hook.description,
      });
    }
  }
}

/**
 * Unregister calcChanges hooks for a feature
 */
export function unregisterCalcChanges(
  registry: CalcChangesRegistry,
  featureKey: string
): void {
  registry.atkCalc.delete(featureKey);
  registry.atkAdd.delete(featureKey);
  registry.spellCalc.delete(featureKey);
  registry.spellAdd.delete(featureKey);
  registry.spellList.delete(featureKey);
  registry.hp.delete(featureKey);
}

// ─── Parse Hook ──────────────────────────────────────────────────────────────

interface ParsedHook {
  body: string;
  description: string;
}

function parseCalcHook(hook: unknown): ParsedHook | null {
  // Format: [function, "description"] or just function
  if (Array.isArray(hook)) {
    const [fn, desc] = hook;
    const body = extractFunctionBody(fn);
    if (body) {
      return { body, description: typeof desc === 'string' ? desc : '' };
    }
  } else {
    const body = extractFunctionBody(hook);
    if (body) {
      return { body, description: '' };
    }
  }
  return null;
}

function extractFunctionBody(fn: unknown): string | null {
  if (typeof fn === 'string') return fn;
  if (typeof fn === 'object' && fn !== null && '_type' in fn) {
    const serialized = fn as SerializedFunction;
    if (serialized._type === 'function') {
      return serialized.body;
    }
  }
  return null;
}

// ─── Execute Hooks ───────────────────────────────────────────────────────────

/**
 * Execute atkCalc hook - modifies attack to-hit and damage
 * 
 * PDF signature: function(fields, v, output)
 * - fields.Weapon_Attack_Bonus, fields.Weapon_Damage_Bonus
 * - v = { WeaponText, WeaponName, isMeleeWeapon, isRangedWeapon, ... }
 * - output = { extraDmg, extraHit }
 */
function executeAtkCalcHook(
  body: string,
  ctx: AttackCalcContext,
  _character: Character
): void {
  try {
    // Common pattern: Add bonus to attack/damage
    // Example: "output.extraDmg += 2"
    const extraDmgMatch = body.match(/output\.extraDmg\s*\+=\s*(\d+)/);
    if (extraDmgMatch) {
      ctx.fields.Weapon_Damage_Bonus += parseInt(extraDmgMatch[1], 10);
    }
    
    const extraHitMatch = body.match(/output\.extraHit\s*\+=\s*(\d+)/);
    if (extraHitMatch) {
      ctx.fields.Weapon_Attack_Bonus += parseInt(extraHitMatch[1], 10);
    }
    
    // Pattern: Conditional bonus (e.g., melee only)
    if (body.includes('isMeleeWeapon') && ctx.isMelee) {
      const meleeDmg = body.match(/isMeleeWeapon[^}]*extraDmg\s*\+=\s*(\d+)/);
      if (meleeDmg) {
        ctx.fields.Weapon_Damage_Bonus += parseInt(meleeDmg[1], 10);
      }
    }
    
    if (body.includes('isRangedWeapon') && ctx.isRanged) {
      const rangedDmg = body.match(/isRangedWeapon[^}]*extraDmg\s*\+=\s*(\d+)/);
      if (rangedDmg) {
        ctx.fields.Weapon_Damage_Bonus += parseInt(rangedDmg[1], 10);
      }
    }
    
    // Pattern: Great Weapon Fighting reroll 1s and 2s (can't really calculate, just note)
    if (body.includes('reroll') || body.includes('Great Weapon Fighting')) {
      ctx.fields.attackStr += ' (reroll 1-2)';
    }
    
    // Pattern: Dueling (+2 damage with one-handed weapon, no other weapon in other hand)
    if (body.includes('Dueling')) {
      ctx.fields.Weapon_Damage_Bonus += 2;
    }
    
    // Pattern: Archery (+2 to ranged attacks)
    if (body.includes('Archery') && ctx.isRanged) {
      ctx.fields.Weapon_Attack_Bonus += 2;
    }
    
  } catch (error) {
    console.warn('Error executing atkCalc hook:', error);
  }
}

/**
 * Execute atkAdd hook - adds attack properties/text
 * 
 * PDF signature: function(fields, v)
 * - fields.Description, fields.Damage_Type, etc.
 */
function executeAtkAddHook(
  body: string,
  ctx: AttackCalcContext,
  _character: Character
): void {
  try {
    // Pattern: Add text to description
    const addTextMatch = body.match(/fields\.Description\s*\+=\s*["']([^"']+)["']/);
    if (addTextMatch) {
      ctx.fields.damageStr += ` ${addTextMatch[1]}`;
    }
    
    // Pattern: Change damage type
    const damageTypeMatch = body.match(/fields\.Damage_Type\s*=\s*["']([^"']+)["']/);
    if (damageTypeMatch) {
      // Would need to track this
    }
    
  } catch (error) {
    console.warn('Error executing atkAdd hook:', error);
  }
}

/**
 * Execute spellCalc hook - modifies spell DC and attack bonus
 * 
 * PDF signature: function(type, spellcasters, ability)
 * - type = "dc" | "attack" | "prepare"
 * - Returns number to add
 */
function executeSpellCalcHook(
  body: string,
  ctx: SpellCalcContext,
  _character: Character
): void {
  try {
    // Pattern: Add to DC
    const dcMatch = body.match(/type\s*===?\s*["']dc["'][^}]*return\s*(\d+)/);
    if (dcMatch) {
      ctx.fields.spellDc += parseInt(dcMatch[1], 10);
    }
    
    // Pattern: Add to attack
    const attackMatch = body.match(/type\s*===?\s*["']attack["'][^}]*return\s*(\d+)/);
    if (attackMatch) {
      ctx.fields.spellAttack += parseInt(attackMatch[1], 10);
    }
    
    // Pattern: Generic return
    const returnMatch = body.match(/return\s*(\d+)\s*[;]?$/);
    if (returnMatch) {
      const bonus = parseInt(returnMatch[1], 10);
      ctx.fields.spellDc += bonus;
      ctx.fields.spellAttack += bonus;
    }
    
  } catch (error) {
    console.warn('Error executing spellCalc hook:', error);
  }
}

/**
 * Execute spellAdd hook - modifies spell properties
 * 
 * PDF signature: function(spellKey, spellObj, spName)
 */
function executeSpellAddHook(
  body: string,
  ctx: SpellCalcContext,
  _character: Character
): void {
  try {
    // Pattern: Modify cantrip damage die
    if (body.includes('cantripDie') && ctx.isCantrip) {
      // Usually handled by level scaling, not hooks
    }
    
    // Pattern: Add damage
    const addDmgMatch = body.match(/description\s*\+=\s*["']([^"']+)["']/);
    if (addDmgMatch) {
      ctx.fields.description += ` ${addDmgMatch[1]}`;
    }
    
  } catch (error) {
    console.warn('Error executing spellAdd hook:', error);
  }
}

/**
 * Execute spellList hook - modifies available spell list
 * 
 * PDF signature: function(spellList, class, level)
 * - Returns modified spell list
 */
function executeSpellListHook(
  body: string,
  spellList: string[],
  _className: string,
  _level: number,
  _character: Character
): string[] {
  try {
    // Most spellList hooks add spells conditionally
    // Pattern: Add specific spells
    const addSpellMatches = body.matchAll(/spells\.push\(["']([^"']+)["']\)/g);
    for (const match of addSpellMatches) {
      const spellKey = match[1];
      if (!spellList.includes(spellKey)) {
        spellList.push(spellKey);
      }
    }
    
    // Pattern: Domain/subclass spells (usually already handled via spellcastingExtra)
    
    return spellList;
  } catch (error) {
    console.warn('Error executing spellList hook:', error);
    return spellList;
  }
}

/**
 * Execute hp hook - modifies HP calculation
 * 
 * PDF signature: function(totalHD, HDobj, prefix)
 * - totalHD = total hit dice
 * - HDobj = { d6: 0, d8: 5, d10: 0, d12: 0 }
 * - Returns extra HP
 */
function executeHpHook(
  body: string,
  ctx: HpCalcContext,
  _character: Character
): void {
  try {
    // Pattern: Tough feat - +2 HP per level
    if (body.includes('totalHD * 2') || body.includes('totalHD*2')) {
      ctx.extraHp += ctx.totalHD * 2;
      return;
    }
    
    // Pattern: Dwarven Toughness - +1 HP per level
    if (body.includes('totalHD * 1') || body.includes('totalHD*1') || body.includes('totalHD')) {
      const multiplierMatch = body.match(/totalHD\s*\*\s*(\d+)/);
      if (multiplierMatch) {
        ctx.extraHp += ctx.totalHD * parseInt(multiplierMatch[1], 10);
        return;
      }
    }
    
    // Pattern: Hill Dwarf - +1 HP per level
    if (body.includes('Hill Dwarf') || (body.includes('+') && body.includes('totalHD'))) {
      ctx.extraHp += ctx.totalHD;
      return;
    }
    
    // Pattern: Flat bonus
    const flatMatch = body.match(/return\s*(\d+)/);
    if (flatMatch) {
      ctx.extraHp += parseInt(flatMatch[1], 10);
    }
    
  } catch (error) {
    console.warn('Error executing hp hook:', error);
  }
}

// ─── Execute All Hooks ───────────────────────────────────────────────────────

/**
 * Run all registered atkCalc hooks
 */
export function runAtkCalcHooks(
  registry: CalcChangesRegistry,
  ctx: AttackCalcContext
): string[] {
  const descriptions: string[] = [];
  
  for (const [key, hook] of registry.atkCalc) {
    try {
      hook.fn(ctx);
      if (hook.description) {
        descriptions.push(hook.description);
      }
    } catch (error) {
      console.warn(`Error in atkCalc hook ${key}:`, error);
    }
  }
  
  for (const [key, hook] of registry.atkAdd) {
    try {
      hook.fn(ctx);
      if (hook.description) {
        descriptions.push(hook.description);
      }
    } catch (error) {
      console.warn(`Error in atkAdd hook ${key}:`, error);
    }
  }
  
  return descriptions;
}

/**
 * Run all registered spellCalc hooks
 */
export function runSpellCalcHooks(
  registry: CalcChangesRegistry,
  ctx: SpellCalcContext
): string[] {
  const descriptions: string[] = [];
  
  for (const [key, hook] of registry.spellCalc) {
    try {
      hook.fn(ctx);
      if (hook.description) {
        descriptions.push(hook.description);
      }
    } catch (error) {
      console.warn(`Error in spellCalc hook ${key}:`, error);
    }
  }
  
  for (const [key, hook] of registry.spellAdd) {
    try {
      hook.fn(ctx);
      if (hook.description) {
        descriptions.push(hook.description);
      }
    } catch (error) {
      console.warn(`Error in spellAdd hook ${key}:`, error);
    }
  }
  
  return descriptions;
}

/**
 * Run all registered HP hooks
 */
export function runHpHooks(
  registry: CalcChangesRegistry,
  ctx: HpCalcContext
): string[] {
  const descriptions: string[] = [];
  
  for (const [key, hook] of registry.hp) {
    try {
      hook.fn(ctx);
      if (hook.description) {
        descriptions.push(hook.description);
      }
    } catch (error) {
      console.warn(`Error in hp hook ${key}:`, error);
    }
  }
  
  return descriptions;
}

/**
 * Run spellList hooks to get modified spell list
 */
export function runSpellListHooks(
  registry: CalcChangesRegistry,
  baseSpellList: string[],
  className: string,
  level: number
): string[] {
  let spellList = [...baseSpellList];
  
  for (const [key, hook] of registry.spellList) {
    try {
      spellList = hook.fn(spellList, className, level);
    } catch (error) {
      console.warn(`Error in spellList hook ${key}:`, error);
    }
  }
  
  return spellList;
}
