import { useEffect, useState } from 'react';
import type { DndRace, DndRaceVariant } from '../../../types/data';
import DataService from '../../../services/data.service';
import { useCharacterStore } from '../../../store/character.store';
import { EntityBrowser } from '../shared/EntityBrowser';
import { EntityCard }    from '../shared/EntityCard';
import { TraitBlock }    from '../shared/TraitBlock';
import { Divider }       from '../../ui/Divider';
import { Badge }         from '../../ui/Badge';
import { ABILITY_ABBR, ABILITY_NAMES, type AbilityScores } from '../../../types/character';

const SIZE_LABELS: Record<number, string> = { 3: 'Medium', 4: 'Small', 5: 'Tiny', 2: 'Large' };

function raceBadges(race: DndRace) {
  const badges: { label: string; color?: 'gold' | 'stone' | 'crimson' | 'green' | 'blue' }[] = [];
  const size = Array.isArray(race.size) ? race.size : [race.size];
  badges.push({ label: size.map(s => SIZE_LABELS[s] ?? '?').join('/') });
  const walk = race.speed?.walk?.spd;
  if (walk) badges.push({ label: `${walk} ft`, color: 'stone' });
  if (race.vision?.length) badges.push({ label: race.vision[0][0], color: 'blue' });
  if (race.scoresGeneric) badges.push({ label: '+2/+1 ASI', color: 'green' });
  return badges;
}

function RaceDetail({ race, variants, selectedVariant, onVariant }: {
  race: DndRace;
  variants: DndRaceVariant[];
  selectedVariant: string | null;
  onVariant: (key: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-display-md text-dark-ink">{race.name}</h3>
        <div className="flex flex-wrap gap-1 mt-1">{raceBadges(race).map((b,i) => <Badge key={i} color={b.color ?? 'gold'}>{b.label}</Badge>)}</div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-body">
        <Stat label="Speed" value={`${race.speed?.walk?.spd ?? '?'} ft`} />
        <Stat label="Size"  value={SIZE_LABELS[Array.isArray(race.size) ? race.size[0] : race.size] ?? '?'} />
        {race.vision?.length ? <Stat label={race.vision[0][0]} value={`${race.vision[0][1]} ft`} /> : null}
        {race.languageProfs?.length ? <Stat label="Languages" value={race.languageProfs.filter(l => typeof l === 'string').join(', ')} /> : null}
      </div>

      {/* Variants (e.g., Dragonborn colour) */}
      {variants.length > 0 && (
        <>
          <Divider label="Choose Variant" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onVariant(null)}
              className={`px-2 py-1 rounded text-xs font-display border transition-colors ${!selectedVariant ? 'bg-gold/20 border-gold text-gold' : 'border-gold/30 text-stone hover:border-gold/50'}`}
            >None</button>
            {variants.map(v => (
              <button
                key={v._key}
                onClick={() => onVariant(v._key)}
                className={`px-2 py-1 rounded text-xs font-display border transition-colors ${selectedVariant === v._key ? 'bg-gold/20 border-gold text-gold' : 'border-gold/30 text-stone hover:border-gold/50'}`}
              >{v.name}</button>
            ))}
          </div>
        </>
      )}

      <Divider label="Traits" />
      <TraitBlock trait={race.trait} />

      {race.age    && <p className="text-xs font-body text-stone italic">Age:{race.age}</p>}
      {race.height && <p className="text-xs font-body text-stone italic">Height:{race.height}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] font-display uppercase tracking-wider text-stone">{label}</div>
      <div className="text-dark-ink text-sm">{value}</div>
    </div>
  );
}

// ─── Generic ASI picker (+2 to one ability, +1 to another) ──────────────────
function GenericAsiPicker({
  asi,
  onChange,
}: {
  asi: AbilityScores;
  onChange: (asi: AbilityScores) => void;
}) {
  const totalPoints = asi.reduce((s, v) => s + v, 0);
  const plusTwo  = asi.indexOf(2);
  const plusOne  = asi.findIndex((v, i) => v === 1 && i !== plusTwo);

  function selectBonus(abilityIdx: number, bonus: 2 | 1) {
    const next = [0, 0, 0, 0, 0, 0] as AbilityScores;
    // Assign the bonus; keep the other bonus if it was on a different ability
    if (bonus === 2) {
      next[abilityIdx] = 2;
      if (plusOne >= 0 && plusOne !== abilityIdx) next[plusOne] = 1;
    } else {
      next[abilityIdx] = 1;
      if (plusTwo >= 0 && plusTwo !== abilityIdx) next[plusTwo] = 2;
    }
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-body text-stone">
        Assign <span className="text-gold font-display">+2</span> to one ability and{' '}
        <span className="text-gold font-display">+1</span> to another.
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ABILITY_ABBR.map((abbr, idx) => {
          const val = asi[idx];
          return (
            <div key={abbr} className="flex flex-col items-center gap-1">
              <div className="text-[9px] font-display uppercase tracking-wider text-stone">{abbr}</div>
              <div className={`
                w-10 h-10 rounded border-2 flex items-center justify-center font-display text-lg transition-colors
                ${val === 2 ? 'bg-gold/30 border-gold text-gold' :
                  val === 1 ? 'bg-gold/10 border-gold/50 text-gold/80' :
                  'bg-parchment/50 border-gold/20 text-stone'}
              `}>
                {val > 0 ? `+${val}` : '—'}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => selectBonus(idx, 2)}
                  title="+2"
                  className={`w-5 h-5 rounded text-[9px] font-display border transition-colors
                    ${val === 2 ? 'bg-gold border-gold text-dark-ink' : 'border-gold/40 text-stone hover:border-gold/70'}`}
                >+2</button>
                <button
                  onClick={() => selectBonus(idx, 1)}
                  title="+1"
                  className={`w-5 h-5 rounded text-[9px] font-display border transition-colors
                    ${val === 1 ? 'bg-gold/60 border-gold text-dark-ink' : 'border-gold/40 text-stone hover:border-gold/70'}`}
                >+1</button>
              </div>
            </div>
          );
        })}
      </div>
      {totalPoints > 0 && (
        <div className="text-[10px] font-display text-gold/70 uppercase tracking-wider">
          {ABILITY_NAMES.map((_, i) => asi[i] > 0 ? `${ABILITY_ABBR[i]} +${asi[i]}` : null).filter(Boolean).join('  ·  ')}
        </div>
      )}
    </div>
  );
}

export function Step1Race() {
  const [races,    setRaces]    = useState<DndRace[]>([]);
  const [variants, setVariants] = useState<DndRaceVariant[]>([]);
  const [loading,  setLoading]  = useState(true);
  const { draft, setRace, setRaceAsiGeneric } = useCharacterStore();

  useEffect(() => {
    Promise.all([DataService.getRaces(), DataService.getRaceVariants()])
      .then(([r, v]) => { setRaces(r); setVariants(v); })
      .finally(() => setLoading(false));
  }, []);

  // Standard player races only (exclude huge lists of duplicates/legacy)
  const playerRaces = races.filter(r =>
    !r.name?.includes('(L)') &&
    !['Werebear','Wereboar','Wererat','Weretiger','Werewolf'].includes(r.name)
  );

  function variantsFor(raceKey: string) {
    return variants.filter(v => v._key.startsWith(raceKey + '-'));
  }

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div>
        <h2 className="font-display text-display-lg text-gold text-shadow">Choose Your Race</h2>
        <p className="text-sm font-body text-stone mt-1">
          Your race shapes your body, heritage, and innate abilities.
        </p>
      </div>

      <EntityBrowser<DndRace>
        context="race"
        items={playerRaces}
        loading={loading}
        selectedKey={draft.race}
        onSelect={race => setRace(race._key, draft.raceVariant)}
        getKey={r => r._key}
        getName={r => r.name}
        filterFn={(r, q) => r.name.toLowerCase().includes(q) || (r.trait ?? '').toLowerCase().includes(q)}
        placeholder="Search races…"
        columns={3}
        renderCard={(race, selected, onClick) => (
          <EntityCard
            name={race.name}
            source={race.source}
            badges={raceBadges(race)}
            selected={selected}
            onClick={onClick}
            preview={race.trait?.split('\n').find(l => l.startsWith('•'))?.slice(1).trim()}
          />
        )}
        renderDetail={race => (
          <>
            <RaceDetail
              race={race}
              variants={variantsFor(race._key)}
              selectedVariant={draft.raceVariant}
              onVariant={vKey => setRace(race._key, vKey)}
            />
            {race.scoresGeneric && draft.race === race._key && (
              <>
                <Divider label="Ability Score Increase" />
                <GenericAsiPicker
                  asi={draft.raceAsiGeneric}
                  onChange={setRaceAsiGeneric}
                />
              </>
            )}
          </>
        )}
      />
    </div>
  );
}
