import React, { useState, useEffect } from 'react';
import type { Character, DerivedStats } from '../../../types/character';
import type { DndSpell, DndClass } from '../../../types/data';
import DataService from '../../../services/data.service';
import { abilityMod } from '../../../services/character.calculator';
import { Badge } from '../../ui/Badge';
import { Spinner } from '../../ui/Spinner';

interface Props {
  char: Character;
  derived: DerivedStats;
  onUpdate: (updates: Partial<Character>) => void;
  /** Engine-computed spell save DC, attack bonus, ability — includes calcChanges hooks */
  engineGetSpellStats?: ((className: string) => { dc: number; attack: number; ability: number } | null) | null;
}

export const SpellsPanel = React.memo(function SpellsPanel({ char, derived, onUpdate, engineGetSpellStats }: Props) {
  const [loading, setLoading]   = useState(true);
  const [spells, setSpells]     = useState<DndSpell[]>([]);
  const [cls, setCls]           = useState<DndClass | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Initialise from persisted value
  const slotsUsed = char.slotsUsed ?? Array(10).fill(0);

  useEffect(() => {
    const allKeys = [...char.chosenCantrips, ...char.chosenSpells];

    const primaryClassKey = char.classes[0]?.classKey ?? '';

    Promise.all([
      DataService.getSpells(),
      DataService.getClasses(),
    ]).then(([allSpells, allClasses]) => {
      setSpells(allSpells.filter(s => allKeys.includes(s._key)));
      setCls(allClasses.find(c => c._key === primaryClassKey) ?? null);
      setLoading(false);
    });
  }, [char.chosenCantrips, char.chosenSpells, char.classes]);

  // Determine if character has warlock pact magic for visual distinction
  const hasWarlockPact = char.classes.some(cc => cc.classKey === 'warlock');

  const hasSpells = derived.spellSlots.some((n, i) => i > 0 && n > 0);

  // Determine if this is a prepared caster (wizard, cleric, druid, paladin, artificer)
  // prepared === true or prepared field absent but class is a full caster with prep
  const isPreparedCaster = cls?.spellcastingKnown?.prepared === true;

  // Max prepared spells = casting ability mod + class level (min 1)
  // Half-casters (paladin, artificer) use half their class level (rounded down, min 1)
  const HALF_CASTER_PREPPERS = ['paladin', 'artificer'];
  const primaryClassKey = char.classes[0]?.classKey ?? '';
  const primaryClassLevel = char.classes[0]?.level ?? 0;
  const casterLevelForPrep = HALF_CASTER_PREPPERS.includes(primaryClassKey)
    ? Math.max(1, Math.floor(primaryClassLevel / 2))
    : primaryClassLevel;
  const castingAbilityIdx = derived.spellcastingAbility;
  const maxPrepared = isPreparedCaster && castingAbilityIdx != null
    ? Math.max(1, abilityMod(char.abilityScores[castingAbilityIdx]) + casterLevelForPrep)
    : Infinity;

  const preparedSpells = char.preparedSpells ?? [];

  function toggleSlot(level: number, idx: number) {
    const next = [...slotsUsed];
    next[level] = idx < next[level] ? idx : idx + 1;
    onUpdate({ slotsUsed: next });
  }

  function resetSlots() {
    onUpdate({ slotsUsed: Array(10).fill(0) });
  }

  function toggleConcentration(spellKey: string) {
    if (char.concentratingOn === spellKey) {
      onUpdate({ concentratingOn: undefined });
    } else {
      onUpdate({ concentratingOn: spellKey });
    }
  }

  function togglePrepared(spellKey: string) {
    const alreadyPrepared = preparedSpells.includes(spellKey);
    if (!alreadyPrepared && preparedSpells.length >= maxPrepared) return; // at cap
    const next = alreadyPrepared
      ? preparedSpells.filter(k => k !== spellKey)
      : [...preparedSpells, spellKey];
    onUpdate({ preparedSpells: next });
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  if (char.chosenCantrips.length === 0 && char.chosenSpells.length === 0) {
    return (
      <div className="text-center py-8 text-stone font-display uppercase tracking-wider text-xs">
        No spells prepared — non-caster or spells not yet assigned
      </div>
    );
  }

  const cantrips = spells.filter(s => s.level === 0);
  const prepared = spells.filter(s => s.level > 0);
  const anyUsed  = slotsUsed.some(n => n > 0);

  // Prefer engine-computed spell stats (includes calcChanges hooks) over legacy derived
  const engineStats = engineGetSpellStats ? engineGetSpellStats(primaryClassKey) : null;
  const displaySpellDc      = engineStats?.dc ?? derived.spellSaveDc;
  const displaySpellAttack  = engineStats?.attack ?? derived.spellAttackBonus;
  const displaySpellAbility = engineStats?.ability ?? derived.spellcastingAbility;

  return (
    <div className="space-y-4">
      {/* Casting stats */}
      {displaySpellAbility != null && (
        <div className="surface-parchment rounded p-3 flex gap-4 text-center">
          <div className="flex-1">
            <div className="text-[9px] font-display uppercase tracking-wider text-stone">Save DC</div>
            <div className="font-display text-dark-ink text-lg">{displaySpellDc ?? '—'}</div>
          </div>
          <div className="w-px bg-gold/20" />
          <div className="flex-1">
            <div className="text-[9px] font-display uppercase tracking-wider text-stone">Attack</div>
            <div className="font-display text-dark-ink text-lg">
              {displaySpellAttack != null ? (displaySpellAttack >= 0 ? '+' : '') + displaySpellAttack : '—'}
            </div>
          </div>
          <div className="w-px bg-gold/20" />
          <div className="flex-1">
            <div className="text-[9px] font-display uppercase tracking-wider text-stone">Ability</div>
            <div className="font-display text-dark-ink text-lg uppercase">
              {['STR','DEX','CON','INT','WIS','CHA'][displaySpellAbility]}
            </div>
          </div>
        </div>
      )}

      {/* Concentration indicator */}
      {char.concentratingOn && (() => {
        const concSpell = spells.find(s => s._key === char.concentratingOn);
        return (
        <div className="surface-parchment rounded border border-crimson/40 p-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-display uppercase tracking-wider text-crimson">Concentrating On</div>
            <div className="font-body text-sm text-dark-ink italic mt-0.5">{concSpell?.name ?? char.concentratingOn}</div>
          </div>
          <button
            onClick={() => onUpdate({ concentratingOn: undefined })}
            className="text-[10px] font-display uppercase tracking-wider text-stone hover:text-crimson transition-colors"
          >
            End ✕
          </button>
        </div>
        );
      })()}

      {/* Spell slots */}
      {hasSpells && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-display uppercase tracking-wider text-stone">Spell Slots</div>
            {hasWarlockPact && (
              <Badge color="crimson">Pact Magic (short rest)</Badge>
            )}
            {anyUsed && (
              <button
                onClick={resetSlots}
                className="text-[9px] font-display uppercase tracking-wider text-gold hover:text-gold/70 transition-colors"
              >
                Long Rest ↺
              </button>
            )}
          </div>
          <div className="surface-parchment rounded p-3 grid grid-cols-3 gap-2">
            {derived.spellSlots.map((total, level) => {
              if (level === 0 || total === 0) return null;
              const used = slotsUsed[level] ?? 0;
              const ordinal = level === 1 ? '1st' : level === 2 ? '2nd' : level === 3 ? '3rd' : `${level}th`;
              return (
                <div key={level} className="text-center">
                  <div className="text-[9px] font-display uppercase tracking-wider text-stone">{ordinal}</div>
                  <div className="flex gap-1 justify-center mt-1 flex-wrap">
                    {Array.from({ length: total }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => toggleSlot(level, i)}
                        className={`
                          w-5 h-5 rounded-full border-2 transition-colors
                          ${i < used
                            ? 'bg-stone/40 border-stone/40'
                            : 'bg-gold/20 border-gold hover:bg-gold/40'}
                        `}
                        title={i < used ? 'Expended (click to restore)' : 'Available (click to expend)'}
                      />
                    ))}
                  </div>
                  <div className="text-[8px] text-stone font-display mt-0.5">{total - used}/{total}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cantrips */}
      {cantrips.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[10px] font-display uppercase tracking-wider text-stone">Cantrips</div>
            <span className="text-[10px] font-display text-gold/70 uppercase tracking-wider">
              d{derived.cantripDie} damage die
            </span>
          </div>
          <div className="space-y-1">
            {cantrips.map(spell => (
              <SpellRow
                key={spell._key}
                spell={spell}
                expanded={expanded === spell._key}
                onExpand={() => setExpanded(expanded === spell._key ? null : spell._key)}
                isConcentrating={char.concentratingOn === spell._key}
                onToggleConcentration={() => toggleConcentration(spell._key)}
                showPrepToggle={false}
                isPrepared={false}
                onTogglePrepared={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prepared spells */}
      {prepared.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-display uppercase tracking-wider text-stone">
              {isPreparedCaster ? `Prepared Spells (${preparedSpells.length}/${maxPrepared === Infinity ? '∞' : maxPrepared})` : `Spells Known (${prepared.length})`}
            </div>
            {isPreparedCaster && (
              <div className="text-[9px] text-stone/60 font-display uppercase tracking-wider">
                Tap ✦ to prepare
              </div>
            )}
          </div>
          <div className="space-y-1">
            {prepared.map(spell => (
              <SpellRow
                key={spell._key}
                spell={spell}
                expanded={expanded === spell._key}
                onExpand={() => setExpanded(expanded === spell._key ? null : spell._key)}
                isConcentrating={char.concentratingOn === spell._key}
                onToggleConcentration={() => toggleConcentration(spell._key)}
                showPrepToggle={isPreparedCaster}
                isPrepared={preparedSpells.includes(spell._key)}
                onTogglePrepared={() => togglePrepared(spell._key)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

function SpellRow({
  spell, expanded, onExpand,
  isConcentrating, onToggleConcentration,
  showPrepToggle, isPrepared, onTogglePrepared,
}: {
  spell: DndSpell;
  expanded: boolean;
  onExpand: () => void;
  isConcentrating: boolean;
  onToggleConcentration: () => void;
  showPrepToggle: boolean;
  isPrepared: boolean;
  onTogglePrepared: () => void;
}) {
  const isConc = spell.duration.includes('Conc') || spell.duration.includes('conc');

  return (
    <div className={`surface-parchment rounded border transition-colors ${
      isConcentrating ? 'border-crimson/50' : 'border-gold/20'
    }`}>
      <button onClick={onExpand} className="w-full flex items-center gap-2 px-3 py-2 text-left">
        <span className="text-[10px] font-display text-gold w-8 flex-shrink-0 text-center">
          {spell.level === 0 ? 'C' : `L${spell.level}`}
        </span>
        <span className="flex-1 text-sm font-body text-dark-ink">{spell.name}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {spell.ritual    && <span className="text-[9px] text-gold font-display">R</span>}
          {isConc && (
            <button
              onClick={e => { e.stopPropagation(); onToggleConcentration(); }}
              title={isConcentrating ? 'End concentration' : 'Start concentrating'}
              className={`text-[9px] font-display px-1 rounded transition-colors ${
                isConcentrating
                  ? 'text-crimson bg-crimson/10 hover:bg-crimson/20'
                  : 'text-stone hover:text-crimson'
              }`}
            >
              C
            </button>
          )}
          {showPrepToggle && (
            <button
              onClick={e => { e.stopPropagation(); onTogglePrepared(); }}
              title={isPrepared ? 'Unprepare spell' : 'Prepare spell'}
              className={`text-[10px] font-display px-1 rounded transition-colors ${
                isPrepared
                  ? 'text-gold bg-gold/10 hover:bg-gold/20'
                  : 'text-stone/40 hover:text-gold'
              }`}
            >
              ✦
            </button>
          )}
          <Badge color="stone">{spell.school}</Badge>
        </div>
        <span className="text-stone text-xs ml-1">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-gold/10 space-y-1 pt-2">
          <div className="grid grid-cols-2 gap-x-3 text-xs font-body text-stone">
            <span><strong>Casting:</strong> {spell.time}</span>
            <span><strong>Range:</strong> {spell.range}</span>
            <span><strong>Duration:</strong> {spell.duration}</span>
            <span><strong>Components:</strong> {spell.components}</span>
            {spell.save && <span><strong>Save:</strong> {spell.save}</span>}
          </div>
          {spell.compMaterial && spell.components.includes('M') && (
            <p className="text-[11px] font-body italic text-stone">{spell.compMaterial}</p>
          )}
          {spell.descriptionCantripDie ? (
            <p className="text-xs font-body text-dark-ink leading-relaxed">{spell.descriptionCantripDie}</p>
          ) : (
            <p className="text-xs font-body text-dark-ink leading-relaxed">{spell.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
