import { useState, useEffect } from 'react';
import type { DndSpell, SpellSchool } from '../../../types/data';
import { Badge } from '../../ui/Badge';
import { FilterBar } from './FilterBar';
import { Spinner } from '../../ui/Spinner';
import { useUiStore } from '../../../store/ui.store';

const SCHOOL_LABELS: Record<SpellSchool, string> = {
  Abjur: 'Abjuration', Conj: 'Conjuration', Div: 'Divination',
  Ench: 'Enchantment', Evoc: 'Evocation', Illus: 'Illusion',
  Necro: 'Necromancy', Trans: 'Transmutation',
};

const SCHOOL_COLORS: Partial<Record<SpellSchool, 'gold' | 'crimson' | 'green' | 'blue' | 'stone'>> = {
  Necro: 'crimson', Evoc: 'crimson', Abjur: 'blue',
  Div: 'gold', Ench: 'green', Conj: 'stone', Illus: 'blue', Trans: 'gold',
};

function formatTime(t: string): string {
  return t.replace('1 a','1 Action').replace('1 ba','1 Bonus Action')
    .replace('1 rea','1 Reaction').replace('1 min','1 Minute').replace('1 h','1 Hour');
}

interface SpellBrowserProps {
  spells: DndSpell[];
  loading?: boolean;
  selected: string[];
  maxSelect?: number;
  filterLevel?: number | null;     // null = all levels
  onToggle: (key: string) => void;
  context: string;
  label?: string;
}

export function SpellBrowser({
  spells, loading, selected, maxSelect, filterLevel, onToggle, context, label,
}: SpellBrowserProps) {
  const { searchText } = useUiStore();
  const query = (searchText[context] ?? '').toLowerCase().trim();
  const [levelFilter, setLevelFilter] = useState<number | 'all'>(filterLevel ?? 'all');
  const [preview, setPreview] = useState<DndSpell | null>(null);

  useEffect(() => { if (filterLevel != null) setLevelFilter(filterLevel); }, [filterLevel]);

  const levels = [...new Set(spells.map(s => s.level))].sort((a, b) => a - b);

  const filtered = spells.filter(s => {
    if (levelFilter !== 'all' && s.level !== levelFilter) return false;
    if (!query) return true;
    return s.name.toLowerCase().includes(query) ||
           s.school.toLowerCase().includes(query) ||
           s.description.toLowerCase().includes(query);
  });

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <div className="font-display text-display-sm text-gold text-shadow">{label}</div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <FilterBar context={context} placeholder="Search spells…" />
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-2 py-1 rounded text-[10px] font-display uppercase tracking-wider border transition-colors ${levelFilter === 'all' ? 'bg-gold/20 border-gold text-gold' : 'border-gold/30 text-stone hover:border-gold/60'}`}
          >All</button>
          {levels.map(l => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-2 py-1 rounded text-[10px] font-display uppercase tracking-wider border transition-colors ${levelFilter === l ? 'bg-gold/20 border-gold text-gold' : 'border-gold/30 text-stone hover:border-gold/60'}`}
            >{l === 0 ? 'Cantrip' : `L${l}`}</button>
          ))}
        </div>
      </div>

      {maxSelect && (
        <div className="text-xs text-stone font-display">
          Selected: {selected.length} / {maxSelect}
        </div>
      )}

      <div className="flex gap-4">
        {/* Spell list */}
        <div className="flex-1 space-y-1 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.map(spell => {
            const isSel     = selected.includes(spell._key);
            const canSelect = !maxSelect || isSel || selected.length < maxSelect;
            return (
              <div
                key={spell._key}
                onClick={() => { if (canSelect || isSel) { onToggle(spell._key); setPreview(spell); } }}
                onMouseEnter={() => setPreview(spell)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded
                  border cursor-pointer transition-all duration-150
                  ${isSel    ? 'bg-gold/20 border-gold'
                    : canSelect ? 'bg-aged-paper/60 border-gold/20 hover:border-gold/50 hover:bg-gold/10'
                    : 'bg-aged-paper/30 border-gold/10 opacity-50 cursor-not-allowed'}
                `}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSel ? 'bg-gold border-gold' : 'border-stone/50'}`}>
                  {isSel && <span className="text-shadow text-[8px]">✓</span>}
                </span>
                <span className="flex-1 text-sm font-body text-dark-ink truncate">{spell.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge color={SCHOOL_COLORS[spell.school] ?? 'stone'}>
                    {spell.school}
                  </Badge>
                  {spell.ritual && <span className="text-[9px] text-gold font-display">R</span>}
                  {spell.duration.includes('Conc') && <span className="text-[9px] text-crimson font-display">C</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-6 text-stone font-display uppercase tracking-wider text-xs">
              No spells found
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <aside className="w-72 flex-shrink-0 rounded border border-gold/30 bg-parchment-texture p-3 space-y-2 max-h-[50vh] overflow-y-auto animate-slide-in">
            <div>
              <h4 className="font-display text-display-sm text-dark-ink">{preview.name}</h4>
              <div className="text-[10px] font-display uppercase tracking-wider text-stone mt-0.5">
                {preview.level === 0 ? 'Cantrip' : `Level ${preview.level}`} {SCHOOL_LABELS[preview.school]}
                {preview.ritual && ' · Ritual'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-body">
              <SpellStat label="Casting" value={formatTime(preview.time)} />
              <SpellStat label="Range"   value={preview.range} />
              <SpellStat label="Duration" value={preview.duration} />
              <SpellStat label="Components" value={preview.components} />
              {preview.save && <SpellStat label="Save" value={preview.save} />}
            </div>
            {preview.compMaterial && preview.components.includes('M') && (
              <p className="text-[11px] font-body italic text-stone">{preview.compMaterial}</p>
            )}
            <p className="text-xs font-body text-dark-ink leading-relaxed">{preview.description}</p>
          </aside>
        )}
      </div>
    </div>
  );
}

function SpellStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] font-display uppercase tracking-wider text-stone">{label}</div>
      <div className="text-dark-ink">{value}</div>
    </div>
  );
}
