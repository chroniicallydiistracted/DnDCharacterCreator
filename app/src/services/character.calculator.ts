import type { Character, DerivedStats, AbilityScores, AbilityIndex, Skill } from '../types/character';
import type { DndArmor, DndClass } from '../types/data';
import { SKILL_ABILITY } from '../types/character';

// ─── Core math ────────────────────────────────────────────────────────────────
export const abilityMod = (score: number) => Math.floor((score - 10) / 2);
export const profBonus  = (totalLevel: number) => Math.ceil(totalLevel / 4) + 1;

// ─── Cantrip die by total character level ────────────────────────────────────
/** Returns the cantrip damage die size (d6/d8/d10/d12) based on total character level */
export function cantripDieByLevel(totalLevel: number): number {
  if (totalLevel >= 17) return 12;
  if (totalLevel >= 11) return 10;
  if (totalLevel >= 5)  return 8;
  return 6;
}

// ─── Class saving throw proficiencies ─────────────────────────────────────────
const CLASS_SAVES: Record<string, string[]> = {
  barbarian:  ['Str', 'Con'],
  bard:       ['Dex', 'Cha'],
  cleric:     ['Wis', 'Cha'],
  druid:      ['Int', 'Wis'],
  fighter:    ['Str', 'Con'],
  monk:       ['Str', 'Dex'],
  paladin:    ['Wis', 'Cha'],
  ranger:     ['Str', 'Dex'],
  rogue:      ['Dex', 'Int'],
  sorcerer:   ['Con', 'Cha'],
  warlock:    ['Wis', 'Cha'],
  wizard:     ['Int', 'Wis'],
  artificer:  ['Con', 'Int'],
};

// ─── Classes that grant Jack of All Trades at a certain level ─────────────────
const JACK_OF_ALL_TRADES: Record<string, number> = { bard: 2 };

// ─── Classes that grant Remarkable Athlete at a certain level ─────────────────
const REMARKABLE_ATHLETE: Record<string, number> = { fighter: 7 };

// ─── Reliable Talent: Rogue L11+ — proficient skill checks treat d20 < 10 as 10 ─
const RELIABLE_TALENT: Record<string, number> = { rogue: 11 };

// ─── Spellcasting tiers ───────────────────────────────────────────────────────
/** Returns caster level fraction: 1 = full, 0.5 = half, 0.33 = third */
const CASTER_TIERS: Record<string, number> = {
  bard: 1, cleric: 1, druid: 1, sorcerer: 1, wizard: 1,
  artificer: 0.5, paladin: 0.5, ranger: 0.5,
  warlock: 0,  // uses Pact Magic (separate)
  'eldritch knight': 0.33, 'arcane trickster': 0.33,
};

/** D&D 5e multiclass spell slot table (PHB p.165).
 *  Index = combined caster level (1–20), value = slots per spell level [l1..l9] */
const MULTICLASS_SLOTS: number[][] = [
  [],                                        // 0
  [2,0,0,0,0,0,0,0,0],                      // 1
  [3,0,0,0,0,0,0,0,0],                      // 2
  [4,2,0,0,0,0,0,0,0],                      // 3
  [4,3,0,0,0,0,0,0,0],                      // 4
  [4,3,2,0,0,0,0,0,0],                      // 5
  [4,3,3,0,0,0,0,0,0],                      // 6
  [4,3,3,1,0,0,0,0,0],                      // 7
  [4,3,3,2,0,0,0,0,0],                      // 8
  [4,3,3,3,1,0,0,0,0],                      // 9
  [4,3,3,3,2,0,0,0,0],                      // 10
  [4,3,3,3,2,1,0,0,0],                      // 11
  [4,3,3,3,2,1,0,0,0],                      // 12
  [4,3,3,3,2,1,1,0,0],                      // 13
  [4,3,3,3,2,1,1,0,0],                      // 14
  [4,3,3,3,2,1,1,1,0],                      // 15
  [4,3,3,3,2,1,1,1,0],                      // 16
  [4,3,3,3,2,1,1,1,1],                      // 17
  [4,3,3,3,3,1,1,1,1],                      // 18
  [4,3,3,3,3,2,1,1,1],                      // 19
  [4,3,3,3,3,2,2,1,1],                      // 20
];

/** Warlock Pact Magic slots: [slots, slot_level] */
const WARLOCK_PACT: [number, number][] = [
  [1,1],[2,1],[2,2],[2,2],[2,3],
  [2,3],[2,4],[2,4],[2,5],[2,5],
  [3,5],[3,5],[3,5],[3,5],[3,5],
  [3,5],[4,5],[4,5],[4,5],[4,5],
];

function computeSpellSlots(char: Character): number[] {
  const slots = [0,0,0,0,0,0,0,0,0,0]; // index 0 unused, 1-9 = spell levels

  let combinedLevel = 0;
  let warlockLevel  = 0;

  for (const cc of char.classes) {
    if (cc.classKey === 'warlock') {
      warlockLevel = cc.level;
      continue;
    }
    const tier = CASTER_TIERS[cc.classKey] ?? 0;
    combinedLevel += Math.floor(cc.level * tier);
  }

  // Multiclass spell slots from table
  if (combinedLevel > 0) {
    const row = MULTICLASS_SLOTS[Math.min(combinedLevel, 20)];
    row.forEach((n, i) => { slots[i + 1] += n; });
  }

  // Warlock Pact Magic (added on top)
  if (warlockLevel > 0) {
    const [count, level] = WARLOCK_PACT[Math.min(warlockLevel, 20) - 1];
    slots[level] += count;
  }

  return slots;
}

// ─── Primary caster ability (per class) ──────────────────────────────────────
const CASTING_ABILITY: Record<string, number> = {
  bard: 5, cleric: 4, druid: 4, sorcerer: 5, warlock: 5, wizard: 3,
  artificer: 3, paladin: 5, ranger: 4, psion: 3,
};

// ─── Multiclass prerequisite ability scores ───────────────────────────────────
export const MULTICLASS_PREREQS: Record<string, Partial<Record<string, number>>> = {
  barbarian:  { Strength: 13 },
  bard:       { Charisma: 13 },
  cleric:     { Wisdom: 13 },
  druid:      { Wisdom: 13 },
  fighter:    { Strength: 13 },
  monk:       { Dexterity: 13, Wisdom: 13 },
  paladin:    { Strength: 13, Charisma: 13 },
  ranger:     { Dexterity: 13, Wisdom: 13 },
  rogue:      { Dexterity: 13 },
  sorcerer:   { Charisma: 13 },
  warlock:    { Charisma: 13 },
  wizard:     { Intelligence: 13 },
  artificer:  { Intelligence: 13 },
};

const ABILITY_MAP: Record<string, number> = {
  Strength:0, Dexterity:1, Constitution:2, Intelligence:3, Wisdom:4, Charisma:5,
};

export function meetsMulticlassPrereq(classKey: string, scores: AbilityScores): boolean {
  const req = MULTICLASS_PREREQS[classKey];
  if (!req) return true;
  return Object.entries(req).every(([ability, min]) => scores[ABILITY_MAP[ability] ?? 0] >= (min ?? 0));
}

// ─── ASI levels — uses class improvements[] array when provided ───────────────
/**
 * Returns true if the given class level grants an ASI/feat.
 * When an improvements array is supplied (from class data), uses it directly.
 * The improvements array is cumulative: an ASI occurs when improvements[level-1] > improvements[level-2].
 */
export function isAsiLevel(classKey: string, classLevel: number, improvements?: number[]): boolean {
  if (improvements && improvements.length >= classLevel) {
    if (classLevel === 1) return improvements[0] > 0;
    return improvements[classLevel - 1] > improvements[classLevel - 2];
  }
  // Fallback: hardcoded schedules
  const standard = [4, 8, 12, 16, 19];
  const fighter  = [4, 6, 8, 12, 14, 16, 19];
  const rogue    = [4, 8, 10, 12, 16, 19];
  if (classKey === 'fighter') return fighter.includes(classLevel);
  if (classKey === 'rogue')   return rogue.includes(classLevel);
  return standard.includes(classLevel);
}

// ─── Subclass level per class ─────────────────────────────────────────────────
export const SUBCLASS_LEVEL: Record<string, number> = {
  barbarian: 3, bard: 3, cleric: 1, druid: 2, fighter: 3,
  monk: 3, paladin: 3, ranger: 3, rogue: 3, sorcerer: 1,
  warlock: 1, wizard: 2, artificer: 3, default: 3,
};

// ─── Classes with Fighting Style feature ─────────────────────────────────────
export const FIGHTING_STYLE_CLASSES = ['fighter', 'paladin', 'ranger'];
export const FIGHTING_STYLE_LEVEL: Record<string, number> = {
  fighter: 1, paladin: 2, ranger: 2,
};

// ─── Classes with Expertise feature ──────────────────────────────────────────
export const EXPERTISE_CLASSES = ['rogue', 'bard'];

// ─── AC from armor ────────────────────────────────────────────────────────────
/**
 * Compute AC from equipped armor, shield, and class Unarmored Defense features.
 * allArmor is the full armor.json dataset; equippedArmorKey is the _key of worn armor.
 */
export function computeAc(
  mods: AbilityScores,
  equippedArmorKey: string | undefined,
  hasShield: boolean,
  classKeys: string[],
  allArmor: DndArmor[],
): number {
  let ac: number;
  const armor = equippedArmorKey ? allArmor.find(a => a._key === equippedArmorKey) : undefined;

  if (armor) {
    const baseAc = typeof armor.ac === 'number' ? armor.ac : 10;
    switch (armor.type) {
      case 'light':   ac = baseAc + mods[1];                      break; // +full DEX
      case 'medium':  ac = baseAc + Math.min(mods[1], 2);          break; // +DEX max 2
      case 'heavy':   ac = baseAc;                                  break; // fixed
      default:        ac = armor.addMod ? baseAc + mods[1] : baseAc;
    }
  } else {
    // Unarmored base
    ac = 10 + mods[1];
    // Unarmored Defense: Barbarian (10 + DEX + CON), Monk (10 + DEX + WIS)
    if (classKeys.includes('barbarian')) {
      ac = Math.max(ac, 10 + mods[1] + mods[2]);
    } else if (classKeys.includes('monk')) {
      ac = Math.max(ac, 10 + mods[1] + mods[4]);
    }
  }

  if (hasShield) ac += 2;
  return ac;
}

// ─── Feature usage resolver ───────────────────────────────────────────────────
/** Resolve max uses for a feature at the given class level. Returns null for string-based expressions. */
export function resolveMaxUses(usages: number | number[] | string | undefined, classLevel: number): number | null {
  if (usages == null) return null;
  if (typeof usages === 'number') return usages;
  if (Array.isArray(usages)) {
    const val = usages[Math.min(classLevel, usages.length) - 1];
    return (typeof val === 'number' && val > 0) ? val : null;
  }
  return null; // string expression — needs runtime eval
}

// ─── Derived stats ────────────────────────────────────────────────────────────
export function computeDerivedStats(
  char: Character,
  allArmor?: DndArmor[],
  allClasses?: DndClass[],
): DerivedStats {
  const scores = char.abilityScores;
  const mods   = scores.map(abilityMod) as AbilityScores;
  const pb     = profBonus(char.totalLevel);

  // Saving throws: multiclass — union of all class save proficiencies
  const allClassSaves = new Set<string>();
  for (const cc of char.classes) {
    (CLASS_SAVES[cc.classKey] ?? []).forEach(s => allClassSaves.add(s));
  }
  const savingThrows: Record<string, number> = {};
  ['Str','Dex','Con','Int','Wis','Cha'].forEach((s, i) => {
    savingThrows[s] = mods[i] + (allClassSaves.has(s) ? pb : 0);
  });

  // Determine special abilities from class levels
  const hasJackOfAllTrades = char.classes.some(cc =>
    (JACK_OF_ALL_TRADES[cc.classKey] ?? 999) <= cc.level
  );
  const hasRemarkableAthlete = char.classes.some(cc =>
    (REMARKABLE_ATHLETE[cc.classKey] ?? 999) <= cc.level
  );
  const hasReliableTalent = char.classes.some(cc =>
    (RELIABLE_TALENT[cc.classKey] ?? 999) <= cc.level
  );

  // Skill bonuses
  const skillBonuses = {} as Record<Skill, number>;
  for (const skill of Object.keys(SKILL_ABILITY) as Skill[]) {
    const abilityIdx = SKILL_ABILITY[skill];
    const isProf     = char.skills.includes(skill);
    const isExpert   = char.expertise.includes(skill);

    let bonus: number;
    if (isExpert) {
      bonus = mods[abilityIdx] + pb * 2;
    } else if (isProf) {
      bonus = mods[abilityIdx] + pb;
    } else if (hasJackOfAllTrades) {
      // Bard: Jack of All Trades — add half proficiency (round down) to any skill check not already proficient
      bonus = mods[abilityIdx] + Math.floor(pb / 2);
    } else if (hasRemarkableAthlete && (abilityIdx === 0 || abilityIdx === 1 || abilityIdx === 2)) {
      // Fighter L7: Remarkable Athlete — add half proficiency (round up) to STR/DEX/CON checks
      bonus = mods[abilityIdx] + Math.ceil(pb / 2);
    } else {
      bonus = mods[abilityIdx];
    }
    skillBonuses[skill] = bonus;
  }

  const spellSlots = computeSpellSlots(char);

  // Primary caster ability
  const primaryClass = char.classes[0]?.classKey;
  const castingAbilityIdx = CASTING_ABILITY[primaryClass ?? ''] as AbilityIndex | undefined;

  // HP
  const maxHp = char.classes.reduce((sum, cc) =>
    sum + cc.hpPerLevel.reduce((a, b) => a + b, 0), 0);

  // AC — use full armor computation when data available
  const classKeys = char.classes.map(c => c.classKey);
  const ac = allArmor
    ? computeAc(mods, char.equippedArmorKey, char.hasShield ?? false, classKeys, allArmor)
    : (() => {
        // Fallback unarmored with Unarmored Defense
        let base = 10 + mods[1];
        if (classKeys.includes('barbarian')) base = Math.max(base, 10 + mods[1] + mods[2]);
        else if (classKeys.includes('monk')) base = Math.max(base, 10 + mods[1] + mods[4]);
        if (char.hasShield) base += 2;
        return base;
      })();

  // Speed — affected by exhaustion and conditions
  const exhaustion  = char.exhaustion ?? 0;
  const conditions  = char.conditions ?? [];
  let speed = char.raceSpeed ?? 30;
  if (exhaustion >= 5) speed = 0;
  else if (exhaustion >= 2) speed = Math.floor(speed / 2);
  // Grappled, Restrained, Paralyzed, Stunned, Unconscious, Petrified → speed = 0
  if (conditions.some(c => ['Grappled','Restrained','Paralyzed','Stunned','Unconscious','Petrified'].includes(c))) {
    speed = 0;
  }

  // Condition disadvantage / advantage flags
  const DISADV_ATTACKS = ['Blinded', 'Frightened', 'Poisoned', 'Prone', 'Restrained', 'Paralyzed', 'Stunned', 'Unconscious'];
  const DISADV_CHECKS  = ['Poisoned'];
  const disadvantageOnAttacks = exhaustion >= 3 || conditions.some(c => DISADV_ATTACKS.includes(c));
  const disadvantageOnChecks  = exhaustion >= 1 || conditions.some(c => DISADV_CHECKS.includes(c));
  const advantageOnAttacks    = conditions.includes('Invisible');

  // Max HP — affected by exhaustion level 4+ (halved)
  const effectiveMaxHp = exhaustion >= 4 ? Math.floor(maxHp / 2) : maxHp;

  // Attacks per action — use class data attacks[] array if available
  const primaryCls = char.classes[0];
  let attacksPerAction = 1;
  if (primaryCls) {
    if (allClasses) {
      const cls = allClasses.find(c => c._key === primaryCls.classKey);
      if (cls?.attacks?.length) {
        const idx = Math.min(primaryCls.level, cls.attacks.length) - 1;
        attacksPerAction = cls.attacks[idx] ?? 1;
      }
    } else {
      // Hardcoded fallback
      const lvl = primaryCls.level;
      if (primaryCls.classKey === 'fighter') {
        if (lvl >= 20) attacksPerAction = 4;
        else if (lvl >= 11) attacksPerAction = 3;
        else if (lvl >= 5)  attacksPerAction = 2;
      } else if (lvl >= 5 && ['barbarian','monk','paladin','ranger'].includes(primaryCls.classKey)) {
        attacksPerAction = 2;
      }
    }
  }

  // Carrying capacity = STR score × 15
  const carryingCapacity = scores[0] * 15;

  return {
    proficiencyBonus:      pb,
    abilityModifiers:      mods,
    savingThrows,
    skillBonuses,
    passivePerception:     10 + skillBonuses.Perception,
    passiveInvestigation:  10 + skillBonuses.Investigation,
    passiveInsight:        10 + skillBonuses.Insight,
    maxHp:                 effectiveMaxHp,
    currentHp:             char.currentHp ?? effectiveMaxHp,
    initiative:            mods[1],
    ac,
    speed,
    carryingCapacity,
    spellSlots,
    spellcastingAbility:   castingAbilityIdx,
    spellSaveDc:           castingAbilityIdx != null ? 8 + pb + mods[castingAbilityIdx] : undefined,
    spellAttackBonus:      castingAbilityIdx != null ? pb + mods[castingAbilityIdx] : undefined,
    attacksPerAction,
    cantripDie:            cantripDieByLevel(char.totalLevel),
    reliableTalent:        hasReliableTalent,
    disadvantageOnAttacks,
    disadvantageOnChecks,
    advantageOnAttacks,
  };
}
