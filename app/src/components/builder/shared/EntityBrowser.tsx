import React, { useState } from 'react';
import { FilterBar } from './FilterBar';
import { Spinner } from '../../ui/Spinner';
import { useUiStore } from '../../../store/ui.store';

interface EntityBrowserProps<T> {
  context: string;
  items: T[];
  loading?: boolean;
  selectedKey?: string | null;
  onSelect: (item: T) => void;
  getKey:     (item: T) => string;
  getName:    (item: T) => string;
  filterFn:   (item: T, query: string) => boolean;
  renderCard: (item: T, selected: boolean, onClick: () => void) => React.ReactNode;
  renderDetail?: (item: T) => React.ReactNode;
  placeholder?: string;
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
}

export function EntityBrowser<T>({
  context, items, loading, selectedKey, onSelect,
  getKey, filterFn, renderCard, renderDetail,
  placeholder, columns = 3, emptyMessage = 'No results found.',
}: EntityBrowserProps<T>) {
  const { searchText } = useUiStore();
  const query = (searchText[context] ?? '').toLowerCase().trim();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const filtered = query ? items.filter(i => filterFn(i, query)) : items;
  const activeItem = activeKey ? items.find(i => getKey(i) === activeKey) : null;

  const colClass = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[columns];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <span className="font-display text-sm text-stone uppercase tracking-wider">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterBar context={context} placeholder={placeholder} />

      <div className={`flex gap-4 ${activeItem && renderDetail ? 'flex-col lg:flex-row' : ''}`}>
        {/* Grid */}
        <div className={`
          grid grid-cols-1 ${colClass} gap-3
          ${activeItem && renderDetail ? 'lg:flex-1' : 'w-full'}
        `}>
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-8 text-stone font-display uppercase tracking-wider text-sm">
              {emptyMessage}
            </div>
          ) : (
            filtered.map(item => {
              const key      = getKey(item);
              const isActive = key === activeKey;
              const isSel    = key === selectedKey;
              return (
                <div key={key}>
                  {renderCard(item, isSel, () => {
                    setActiveKey(isActive ? null : key);
                    onSelect(item);
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {activeItem && renderDetail && (
          <aside className="
            lg:w-80 flex-shrink-0
            rounded border-2 border-gold/40
            bg-parchment-texture shadow-card
            overflow-y-auto max-h-[60vh] lg:max-h-full
            animate-slide-in
          ">
            <div className="p-4">{renderDetail(activeItem)}</div>
          </aside>
        )}
      </div>

      {/* Result count */}
      {query && (
        <div className="text-xs text-stone font-display uppercase tracking-wider text-center">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
