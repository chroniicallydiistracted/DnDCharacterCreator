import React, { useState, useEffect } from 'react';
import type { Character, AttackEntry, DerivedStats } from '../../../types/character';
import type { DndWeapon } from '../../../types/data';
import { abilityMod } from '../../../services/character.calculator';
import DataService from '../../../services/data.service';
import { Spinner } from '../../ui/Spinner';

/** Engine's calculateAttack function signature */
type EngineCalculateAttack = (attack: AttackEntry, weapon: DndWeapon | null) => {
  toHit: number;
  damage: string;
  damageType: string;
  attackStr: string;
  notes: string[];
};

interface Props {
  char: Character;
  derived: DerivedStats;
  onUpdate: (updates: Partial<Character>) => void;
  /** Engine attack calculator with calcChanges hooks applied */
  engineCalculateAttack?: EngineCalculateAttack | null;
}

const ABILITY_OPTS = ['STR', 'DEX', 'INT', 'WIS', 'CHA', 'spellcasting'] as const;
type AbilityOpt = typeof ABILITY_OPTS[number];

const ABILITY_IDX: Record<string, number> = { STR:0, DEX:1, CON:2, INT:3, WIS:4, CHA:5 };

/** Sneak Attack dice by rogue level (index = level - 1) */
const SNEAK_ATTACK_DICE = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10];

/** Extract all fighting style names from all classes */
function getFightingStyles(char: Character): string[] {
  return char.classes.flatMap(cc => {
    const styles: string[] = [];
    if (cc.fightingStyle) styles.push(cc.fightingStyle.toLowerCase());
    if (cc.additionalFightingStyles) styles.push(...cc.additionalFightingStyles.map(s => s.toLowerCase()));
    return styles;
  });
}

/** Compute the to-hit bonus for an attack entry */
function calcToHit(entry: AttackEntry, char: Character, derived: DerivedStats): number {
  // Manual override wins
  if (entry.toHitBonus !== undefined) return entry.toHitBonus;

  const pb     = derived.proficiencyBonus;
  const profBonus = entry.proficient !== false ? pb : 0;
  const magic  = entry.magicBonus ?? 0;

  // Fighting Style: Archery grants +2 to ranged weapon attack rolls only (PHB p.72)
  const styles = getFightingStyles(char);
  const archeryBonus = (entry.attackType === 'ranged' && entry.abilityUsed !== 'spellcasting' && styles.includes('archery')) ? 2 : 0;

  let abilityBonus = 0;
  if (entry.abilityUsed === 'spellcasting') {
    return (derived.spellAttackBonus ?? 0) + magic + archeryBonus;
  } else if (entry.abilityUsed && ABILITY_IDX[entry.abilityUsed] !== undefined) {
    // Finesse weapons: use whichever of STR or DEX gives a higher modifier
    if (entry.abilityUsed === 'STR' && entry.notes?.toLowerCase().includes('finesse')) {
      const strMod = abilityMod(char.abilityScores[ABILITY_IDX['STR']]);
      const dexMod = abilityMod(char.abilityScores[ABILITY_IDX['DEX']]);
      abilityBonus = Math.max(strMod, dexMod);
    } else {
      abilityBonus = abilityMod(char.abilityScores[ABILITY_IDX[entry.abilityUsed]]);
    }
  }

  return abilityBonus + profBonus + magic + archeryBonus;
}

/** Compute damage formula including ability bonus */
function calcDamage(entry: AttackEntry, char: Character): string {
  if (!entry.damageFormula) return '—';
  const magic = entry.magicBonus ?? 0;

  // Fighting Style: Dueling grants +2 to melee damage (one weapon, no off-hand)
  const styles = getFightingStyles(char);
  const duelingBonus = (entry.attackType === 'melee' && !entry.isOffHand && styles.includes('dueling')) ? 2 : 0;
  
  // Two-Weapon Fighting style: off-hand attacks add ability modifier
  const hasTwoWeaponFighting = styles.includes('two-weapon fighting');

  let modBonus = 0;
  if (entry.abilityUsed === 'spellcasting') {
    // spells: don't add ability bonus to damage by default
  } else if (entry.abilityUsed && ABILITY_IDX[entry.abilityUsed] !== undefined) {
    // Off-hand attacks don't add ability modifier unless you have Two-Weapon Fighting style
    if (entry.isOffHand && !hasTwoWeaponFighting) {
      modBonus = 0;
    } else if (entry.abilityUsed === 'STR' && entry.notes?.toLowerCase().includes('finesse')) {
      // Finesse weapons: use whichever of STR or DEX gives a higher modifier
      const strMod = abilityMod(char.abilityScores[ABILITY_IDX['STR']]);
      const dexMod = abilityMod(char.abilityScores[ABILITY_IDX['DEX']]);
      modBonus = Math.max(strMod, dexMod);
    } else {
      modBonus = abilityMod(char.abilityScores[ABILITY_IDX[entry.abilityUsed]]);
    }
  }

  const total = modBonus + magic + duelingBonus;
  // Always add ability mod + bonuses on top of the formula.
  // If formula already has a modifier (e.g. "1d6+3"), strip it and add total.
  // If it's just dice (e.g. "1d6"), append total.
  const hasPlus = /[+\-]\d+$/.test(entry.damageFormula);
  if (hasPlus) {
    const base = entry.damageFormula.replace(/([+\-]\d+)$/, '');
    const existing = parseInt(entry.damageFormula.replace(/.*([+\-]\d+)$/, '$1'));
    const finalMod = (existing || 0) + total;
    return finalMod !== 0 ? `${base}${finalMod >= 0 ? '+' : ''}${finalMod}` : base;
  }
  return total !== 0 ? `${entry.damageFormula}${total >= 0 ? '+' : ''}${total}` : entry.damageFormula;
}

/** Format a number as a signed string */
function signed(n: number): string { return (n >= 0 ? '+' : '') + n; }

// ─── Empty attack entry factory ───────────────────────────────────────────────
function newAttack(): AttackEntry {
  return {
    id: Math.random().toString(36).slice(2),
    name: '',
    attackType: 'melee',
    abilityUsed: 'STR',
    proficient: true,
    magicBonus: 0,
    damageFormula: '',
    damageType: '',
    notes: '',
  };
}

// ─── Weapon quick-add from weapons.json ───────────────────────────────────────
function weaponToAttack(w: DndWeapon): AttackEntry {
  // MPMB ability: 1=STR, 2=DEX, 3=STR or DEX (finesse)
  // For finesse (ability===3), we set abilityUsed to 'STR' and mark notes with 'finesse'
  // so that calcToHit/calcDamage can resolve to max(STR, DEX) at runtime.
  const isFinesse = w.ability === 3;
  const abilityUsed: AbilityOpt = w.list === 'ranged' ? 'DEX' : w.ability === 2 ? 'DEX' : 'STR';
  const [count, die, dmgType] = w.damage;
  const formula = die && typeof die === 'number' ? `${count}d${die}` : '';

  return {
    id: Math.random().toString(36).slice(2),
    name: w.name,
    weaponKey: w._key,
    attackType: w.list === 'ranged' ? 'ranged' : 'melee',
    abilityUsed,
    proficient: true,
    magicBonus: 0,
    damageFormula: formula,
    damageType: String(dmgType ?? ''),
    notes: isFinesse
      ? (w.description ? `Finesse. ${w.description}` : 'Finesse')
      : (w.description ?? ''),
  };
}

export const AttacksPanel = React.memo(function AttacksPanel({ char, derived, onUpdate, engineCalculateAttack }: Props) {
  const [weapons, setWeapons]     = useState<DndWeapon[]>([]);
  const [showBrowser, setBrowser] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<AttackEntry | null>(null);
  const [weaponQuery, setWQ]      = useState('');
  const [loadingWeapons, setLW]   = useState(false);

  // Sneak Attack (Rogue)
  const rogueEntry  = char.classes.find(cc => cc.classKey === 'rogue');
  const sneakDice   = rogueEntry ? (SNEAK_ATTACK_DICE[rogueEntry.level - 1] ?? 0) : 0;

  // Improved Divine Smite (Paladin L11+) - adds 1d8 radiant to all melee weapon hits
  const paladinEntry = char.classes.find(cc => cc.classKey === 'paladin');
  const hasImprovedDivineSmite = paladinEntry && paladinEntry.level >= 11;

  // Active fighting style indicators
  const fightingStyles = getFightingStyles(char);

  useEffect(() => {
    if (showBrowser && weapons.length === 0) {
      setLW(true);
      DataService.getWeapons().then(w => { setWeapons(w); setLW(false); });
    }
  }, [showBrowser, weapons.length]);

  const attacks = char.attacks ?? [];

  function saveAttacks(updated: AttackEntry[]) {
    onUpdate({ attacks: updated });
  }

  function startEdit(entry: AttackEntry) {
    setEditId(entry.id);
    setEditEntry({ ...entry });
  }

  function commitEdit() {
    if (!editEntry) return;
    const updated = attacks.map(a => a.id === editEntry.id ? editEntry : a);
    saveAttacks(updated);
    setEditId(null);
    setEditEntry(null);
  }

  function cancelEdit() { setEditId(null); setEditEntry(null); }

  function deleteAttack(id: string) {
    saveAttacks(attacks.filter(a => a.id !== id));
  }

  function addBlankAttack() {
    const a = newAttack();
    saveAttacks([...attacks, a]);
    startEdit(a);
  }

  function addWeaponAttack(w: DndWeapon) {
    const a = weaponToAttack(w);
    saveAttacks([...attacks, a]);
    setBrowser(false);
    startEdit(a);
  }

  const filteredWeapons = weapons.filter(w =>
    !weaponQuery || w.name.toLowerCase().includes(weaponQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Condition warnings */}
      {(derived.disadvantageOnAttacks || derived.advantageOnAttacks) && (
        <div className="flex flex-wrap gap-2">
          {derived.disadvantageOnAttacks && (
            <span className="text-[10px] font-display uppercase tracking-wider text-crimson bg-crimson/10 border border-crimson/30 rounded px-2 py-0.5">
              ⚠ Disadvantage on Attacks
            </span>
          )}
          {derived.advantageOnAttacks && (
            <span className="text-[10px] font-display uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 rounded px-2 py-0.5">
              ★ Advantage on Attacks (Invisible)
            </span>
          )}
        </div>
      )}

      {/* Sneak Attack panel — Rogue only */}
      {sneakDice > 0 && (
        <div className="surface-parchment rounded border border-gold/30 px-3 py-2 flex items-center gap-3">
          <span className="text-xs font-display text-gold uppercase tracking-wider flex-shrink-0">Sneak Attack</span>
          <span className="font-display text-dark-ink text-sm">{sneakDice}d6</span>
          <span className="text-[10px] font-body text-stone italic">Once per turn · advantage or ally adjacent to target</span>
        </div>
      )}

      {/* Improved Divine Smite panel — Paladin L11+ */}
      {hasImprovedDivineSmite && (
        <div className="surface-parchment rounded border border-gold/30 px-3 py-2 flex items-center gap-3">
          <span className="text-xs font-display text-gold uppercase tracking-wider flex-shrink-0">Improved Divine Smite</span>
          <span className="font-display text-dark-ink text-sm">+1d8 radiant</span>
          <span className="text-[10px] font-body text-stone italic">Automatically added to all melee weapon attacks</span>
        </div>
      )}

      {/* Fighting Style info chips */}
      {fightingStyles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fightingStyles.map(style => (
            <span key={style} className="text-[9px] font-display uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 rounded px-2 py-0.5">
              {style === 'archery' ? 'Archery +2 ranged' :
               style === 'dueling' ? 'Dueling +2 melee dmg' :
               style === 'defense' ? 'Defense +1 AC' :
               style === 'great weapon fighting' ? 'Great Weapon Fighting' :
               style === 'protection' ? 'Protection' :
               style === 'two-weapon fighting' ? 'Two-Weapon Fighting' :
               style}
            </span>
          ))}
        </div>
      )}

      {/* Attack rows */}
      {attacks.length === 0 ? (
        <div className="text-center py-8 text-stone/60 font-display uppercase tracking-wider text-xs">
          No attacks added yet
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_5rem_5rem_6rem_1fr_3rem] gap-2 px-3 py-1">
            <span className="text-[9px] font-display uppercase tracking-wider text-stone">Name</span>
            <span className="text-[9px] font-display uppercase tracking-wider text-stone text-center">To Hit</span>
            <span className="text-[9px] font-display uppercase tracking-wider text-stone text-center">Damage</span>
            <span className="text-[9px] font-display uppercase tracking-wider text-stone">Type</span>
            <span className="text-[9px] font-display uppercase tracking-wider text-stone">Notes</span>
            <span />
          </div>

          {attacks.map(entry => {
            const isEditing = editId === entry.id && editEntry;
            // Prefer engine-computed attack values (includes calcChanges hooks)
            const engineResult = engineCalculateAttack
              ? engineCalculateAttack(entry, weapons.find(w => w._key === entry.weaponKey) ?? null)
              : null;
            const toHit  = engineResult ? engineResult.toHit : calcToHit(entry, char, derived);
            const damage = engineResult ? engineResult.damage : calcDamage(entry, char);

            if (isEditing && editEntry) {
              return (
                <div key={entry.id} className="surface-parchment rounded border border-gold/40 p-3 space-y-2">
                  <div className="text-[9px] font-display uppercase tracking-wider text-stone mb-1">Edit Attack</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-display uppercase text-stone">Name</label>
                      <input
                        type="text"
                        value={editEntry.name}
                        onChange={e => setEditEntry({ ...editEntry, name: e.target.value })}
                        className="mt-0.5 w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-display uppercase text-stone">Type</label>
                      <select
                        value={editEntry.attackType ?? 'melee'}
                        onChange={e => setEditEntry({ ...editEntry, attackType: e.target.value as AttackEntry['attackType'] })}
                        className="mt-0.5 w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink focus:outline-none focus:border-gold"
                      >
                        <option value="melee">Melee</option>
                        <option value="ranged">Ranged</option>
                        <option value="spell">Spell</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-display uppercase text-stone">Ability</label>
                      <select
                        value={editEntry.abilityUsed ?? 'STR'}
                        onChange={e => setEditEntry({ ...editEntry, abilityUsed: e.target.value as AbilityOpt })}
                        className="mt-0.5 w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink focus:outline-none focus:border-gold"
                      >
                        {ABILITY_OPTS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-display uppercase text-stone">Damage Dice</label>
                      <input
                        type="text"
                        value={editEntry.damageFormula ?? ''}
                        onChange={e => setEditEntry({ ...editEntry, damageFormula: e.target.value })}
                        placeholder="1d6"
                        className="mt-0.5 w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-display uppercase text-stone">Damage Type</label>
                      <input
                        type="text"
                        value={editEntry.damageType ?? ''}
                        onChange={e => setEditEntry({ ...editEntry, damageType: e.target.value })}
                        placeholder="slashing"
                        className="mt-0.5 w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-display uppercase text-stone">Magic Bonus</label>
                      <input
                        type="number"
                        value={editEntry.magicBonus ?? 0}
                        onChange={e => setEditEntry({ ...editEntry, magicBonus: parseInt(e.target.value) || 0 })}
                        className="mt-0.5 w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-display uppercase text-stone">Notes</label>
                    <input
                      type="text"
                      value={editEntry.notes ?? ''}
                      onChange={e => setEditEntry({ ...editEntry, notes: e.target.value })}
                      placeholder="e.g. Versatile, Thrown 20/60"
                      className="mt-0.5 w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editEntry.proficient !== false}
                        onChange={e => setEditEntry({ ...editEntry, proficient: e.target.checked })}
                        className="w-3 h-3"
                      />
                      <span className="text-[10px] font-display text-stone">Proficient (+{derived.proficiencyBonus})</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editEntry.isOffHand === true}
                        onChange={e => setEditEntry({ ...editEntry, isOffHand: e.target.checked })}
                        className="w-3 h-3"
                      />
                      <span className="text-[10px] font-display text-stone">Off-Hand (Bonus Action)</span>
                    </label>
                    <div className="ml-auto flex gap-2">
                      <button onClick={cancelEdit} className="px-3 py-1 text-xs font-display text-stone border border-stone/30 rounded hover:border-gold/50 transition-colors">
                        Cancel
                      </button>
                      <button onClick={commitEdit} className="px-3 py-1 text-xs font-display bg-gold/20 border border-gold rounded text-gold hover:bg-gold/30 transition-colors">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={entry.id}
                className="surface-parchment rounded border border-gold/10 hover:border-gold/30 transition-colors"
              >
                <div className="grid grid-cols-[1fr_5rem_5rem_6rem_1fr_3rem] gap-2 px-3 py-2 items-center">
                  <div>
                    <div className="font-display text-sm text-dark-ink flex items-center gap-1.5">
                      {entry.name || '(Unnamed)'}
                      {entry.isOffHand && (
                        <span className="text-[8px] font-display uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 rounded px-1 py-0.5">
                          Off-Hand
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] font-display uppercase tracking-wider text-stone">
                      {entry.attackType}
                      {entry.abilityUsed && ` · ${entry.abilityUsed}`}
                      {entry.isOffHand && ` · Bonus Action`}
                    </div>
                  </div>
                  <div className="text-center font-display text-gold text-sm">
                    {entry.toHitBonus !== undefined
                      ? signed(entry.toHitBonus)
                      : signed(toHit)}
                  </div>
                  <div className="text-center font-display text-dark-ink text-sm">
                    {damage}
                  </div>
                  <div className="text-xs font-body text-stone truncate" title={entry.damageType}>
                    {entry.damageType || '—'}
                  </div>
                  <div className="text-[10px] font-body text-stone/70 truncate" title={entry.notes}>
                    {entry.notes || '—'}
                  </div>
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => startEdit(entry)}
                      className="text-[9px] font-display text-stone hover:text-gold uppercase tracking-wider transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAttack(entry.id)}
                      className="text-[9px] font-display text-stone/50 hover:text-crimson uppercase tracking-wider transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {entry.notes && (
                  <div className="px-3 pb-2 text-[10px] font-body text-stone/70 italic">{entry.notes}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 pt-1">
        <button
          onClick={addBlankAttack}
          className="text-xs font-display uppercase tracking-wider text-stone hover:text-gold transition-colors"
        >
          + Custom Attack
        </button>
        <button
          onClick={() => setBrowser(true)}
          className="text-xs font-display uppercase tracking-wider text-stone hover:text-gold transition-colors"
        >
          ⚔ Add from Weapon List
        </button>
      </div>

      {/* Weapon Browser Modal */}
      {showBrowser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-shadow/70" onClick={() => setBrowser(false)}>
          <div
            className="surface-parchment rounded-lg border border-gold/40 shadow-2xl w-[28rem] max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20">
              <h3 className="font-display text-gold uppercase tracking-wider text-sm">Weapon List</h3>
              <button onClick={() => setBrowser(false)} className="text-stone hover:text-gold text-sm">✕</button>
            </div>
            <div className="px-3 py-2 border-b border-gold/10">
              <input
                type="text"
                value={weaponQuery}
                onChange={e => setWQ(e.target.value)}
                placeholder="Search weapons…"
                autoFocus
                className="w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink placeholder:text-stone/50 focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingWeapons && <div className="flex justify-center py-8"><Spinner /></div>}
              {filteredWeapons.map(w => {
                const [count, die, dmgType] = w.damage;
                const formula = die && typeof die === 'number' ? `${count}d${die}` : '—';
                return (
                  <button
                    key={w._key}
                    onClick={() => addWeaponAttack(w)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gold/10 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-body text-dark-ink group-hover:text-gold transition-colors">{w.name}</div>
                        <div className="text-[9px] font-display uppercase tracking-wider text-stone">
                          {w.type} · {w.list}
                          {w.ability === 2 && ' · Finesse'}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display text-gold text-sm">{formula}</div>
                        <div className="text-[9px] text-stone font-body">{String(dmgType)}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
})
