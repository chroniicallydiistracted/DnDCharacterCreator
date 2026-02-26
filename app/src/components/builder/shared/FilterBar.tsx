import { useUiStore } from '../../../store/ui.store';

interface FilterBarProps {
  context: string;
  placeholder?: string;
  sourceGroups?: string[];
}

export function FilterBar({ context, placeholder = 'Search…', sourceGroups }: FilterBarProps) {
  const { searchText, setSearchText } = useUiStore();
  const text = searchText[context] ?? '';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone text-sm">🔍</span>
        <input
          type="text"
          value={text}
          onChange={e => setSearchText(context, e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-9 pr-3 py-2 rounded
            bg-aged-paper border-2 border-gold/30
            font-body text-sm text-dark-ink placeholder:text-stone/50
            focus:border-gold focus:outline-none
            transition-colors duration-150
          "
        />
        {text && (
          <button
            onClick={() => setSearchText(context, '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-dark-ink"
          >✕</button>
        )}
      </div>

      {/* Source pills (placeholder — wired to store when needed) */}
      {sourceGroups && sourceGroups.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-display uppercase tracking-wider text-stone">Sources:</span>
          {sourceGroups.map(g => (
            <button key={g} className="
              px-2 py-0.5 rounded text-[10px] font-display uppercase tracking-wider
              border border-gold/30 text-stone hover:border-gold/60 hover:text-gold
              transition-colors duration-150
            ">{g}</button>
          ))}
        </div>
      )}
    </div>
  );
}
