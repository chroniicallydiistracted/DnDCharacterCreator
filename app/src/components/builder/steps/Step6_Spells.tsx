import { useEffect, useState } from 'react';
import type { DndSpell, DndClass, DndWarlockInvocation } from '../../../types/data';
import DataService from '../../../services/data.service';
import { useCharacterStore } from '../../../store/character.store';
import { SpellBrowser } from '../shared/SpellBrowser';
import { Divider } from '../../ui/Divider';

// Number of known invocations per warlock level (index 0 = lvl 1, 19 = lvl 20)
const WARLOCK_INVOCATIONS_KNOWN = [0,2,2,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8];

/** Extract minimum warlock level from submenu strings like "[warlock 5]" */
function invocationMinLevel(inv: DndWarlockInvocation): number {
  const match = (inv.submenu ?? '').match(/warlock[^\d]*(\d+)/i);
  return match ? Number(match[1]) : 1;
}

export function Step6Spells() {
  const [spells, setSpells]             = useState<DndSpell[]>([]);
  const [cls, setCls]                   = useState<DndClass | null>(null);
  const [invocations, setInvocations]   = useState<DndWarlockInvocation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isCaster, setIsCaster]         = useState(false);
  const {
    draft,
    setChosenCantrips,
    setChosenSpells,
    setChosenInvocations,
  } = useCharacterStore();
  const classKey     = draft.classKey ?? '';
  const startingLevel = draft.startingLevel;

  useEffect(() => {
    async function load() {
      const caster = await DataService.isSpellcaster(classKey);
      setIsCaster(caster);
      if (caster) {
        const [s, classes] = await Promise.all([
          DataService.getSpellsForClass(classKey),
          DataService.getClasses(),
        ]);
        setSpells(s);
        setCls(classes.find(c => c._key === classKey) ?? null);
      }
      // Load invocations for warlocks
      if (classKey === 'warlock') {
        const invs = await DataService.getWarlockInvocations();
        setInvocations(invs);
      }
      setLoading(false);
    }
    if (classKey) load();
    else setLoading(false);
  }, [classKey]);

  if (!classKey || (!loading && !isCaster)) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-display-lg text-gold text-shadow">Spells</h2>
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⚔️</div>
          <p className="font-display text-stone uppercase tracking-wider">
            {!classKey ? 'Select a class first.' : 'Your class does not cast spells.'}
          </p>
          <p className="text-xs text-stone/60 mt-2 font-body">You can skip this step.</p>
        </div>
      </div>
    );
  }

  const cantrips = spells.filter(s => s.level === 0);
  const lvl1Plus = spells.filter(s => s.level > 0 && s.level <= Math.ceil(startingLevel / 2));

  // Read spell counts from class data using startingLevel as index, fall back to level 1
  const levelIdx      = Math.max(0, startingLevel - 1);
  const maxCantrips   = cls?.spellcastingKnown?.cantrips?.[levelIdx]
                        ?? cls?.spellcastingKnown?.cantrips?.[0]
                        ?? (cantrips.length > 0 ? 2 : 0);
  const maxSpells     = cls?.spellcastingKnown?.spells?.[levelIdx]
                        ?? cls?.spellcastingKnown?.spells?.[0]
                        ?? (lvl1Plus.length > 0 ? 2 : 0);

  const isKnownCaster = cls?.spellcastingKnown?.prepared === false;
  const spellLabel    = isKnownCaster ? 'Known Spells' : 'Prepared Spells';

  // Warlock invocations
  const isWarlock       = classKey === 'warlock';
  const maxInvocations  = isWarlock ? (WARLOCK_INVOCATIONS_KNOWN[startingLevel - 1] ?? 0) : 0;
  const availableInvocs = invocations.filter(inv => invocationMinLevel(inv) <= startingLevel);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-display-lg text-gold text-shadow">Choose Your Spells</h2>
        <p className="text-sm font-body text-stone mt-1">
          Select cantrips (at-will) and {isKnownCaster ? 'known' : 'prepared'} spells
          {startingLevel > 1 ? ` for level ${startingLevel}` : ' for level 1'}.
        </p>
      </div>

      {/* Cantrips */}
      {cantrips.length > 0 && maxCantrips > 0 && (
        <section>
          <SpellBrowser
            context="cantrips"
            spells={cantrips}
            loading={loading}
            selected={draft.chosenCantrips}
            maxSelect={maxCantrips}
            filterLevel={0}
            onToggle={key => {
              const next = draft.chosenCantrips.includes(key)
                ? draft.chosenCantrips.filter(k => k !== key)
                : [...draft.chosenCantrips, key];
              setChosenCantrips(next);
            }}
            label={`Cantrips — choose ${maxCantrips}`}
          />
        </section>
      )}

      {lvl1Plus.length > 0 && maxSpells > 0 && (
        <>
          <Divider />
          <section>
            <SpellBrowser
              context="spells"
              spells={lvl1Plus}
              loading={loading}
              selected={draft.chosenSpells}
              maxSelect={maxSpells}
              onToggle={key => {
                const next = draft.chosenSpells.includes(key)
                  ? draft.chosenSpells.filter(k => k !== key)
                  : [...draft.chosenSpells, key];
                setChosenSpells(next);
              }}
              label={`${spellLabel} — choose ${maxSpells}`}
            />
          </section>
        </>
      )}

      {/* Warlock Eldritch Invocations */}
      {isWarlock && maxInvocations > 0 && (
        <>
          <Divider label="Eldritch Invocations" />
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-body text-stone">
                Choose {maxInvocations} invocation{maxInvocations > 1 ? 's' : ''} from the list below.
              </p>
              <span className={`text-xs font-display uppercase tracking-wider ${
                draft.chosenInvocations.length >= maxInvocations ? 'text-gold' : 'text-stone'
              }`}>
                {draft.chosenInvocations.length}/{maxInvocations}
              </span>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {availableInvocs.map(inv => {
                const selected = draft.chosenInvocations.includes(inv._key);
                const atMax    = !selected && draft.chosenInvocations.length >= maxInvocations;
                return (
                  <button
                    key={inv._key}
                    disabled={atMax}
                    onClick={() => {
                      const next = selected
                        ? draft.chosenInvocations.filter(k => k !== inv._key)
                        : [...draft.chosenInvocations, inv._key];
                      setChosenInvocations(next);
                    }}
                    className={`
                      w-full text-left px-3 py-2 rounded border text-xs font-body transition-colors
                      ${selected
                        ? 'bg-gold/20 border-gold text-dark-ink'
                        : atMax
                          ? 'border-gold/10 text-stone/40 cursor-not-allowed'
                          : 'border-gold/20 text-stone hover:border-gold/40 hover:text-dark-ink'}
                    `}
                  >
                    <div className="font-display text-sm">{inv._displayName ?? inv.name}</div>
                    {inv.submenu && (
                      <div className="text-[10px] text-stone/60 font-display uppercase tracking-wider mt-0.5">
                        {inv.submenu}
                      </div>
                    )}
                    {inv.description && (
                      <div className="mt-1 text-[11px] leading-snug line-clamp-2">{inv.description}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
