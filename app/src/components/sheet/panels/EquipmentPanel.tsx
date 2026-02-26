import { useState, useEffect } from 'react';
import type { Character, EquipmentItem, Currency, DerivedStats } from '../../../types/character';
import type { DndArmor, DndMagicItem } from '../../../types/data';
import DataService from '../../../services/data.service';
import { Spinner } from '../../ui/Spinner';

interface Props {
  char: Character;
  derived: DerivedStats;
  onUpdate: (updates: Partial<Character>) => void;
}

const DEFAULT_CURRENCY: Currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

const CURRENCY_LABELS: { key: keyof Currency; label: string; color: string }[] = [
  { key: 'pp', label: 'PP', color: 'text-purple-400' },
  { key: 'gp', label: 'GP', color: 'text-gold' },
  { key: 'ep', label: 'EP', color: 'text-stone' },
  { key: 'sp', label: 'SP', color: 'text-stone' },
  { key: 'cp', label: 'CP', color: 'text-amber-700' },
];

// Max attuned items in D&D 5e
const MAX_ATTUNED = 3;

export function EquipmentPanel({ char, derived, onUpdate }: Props) {
  const [editing, setEditing]           = useState(false);
  const [newItem, setNewItem]           = useState('');
  const [newQty, setNewQty]             = useState('1');
  const [showArmorPicker, setArmorPicker]   = useState(false);
  const [showMagicBrowser, setMagicBrowser] = useState(false);
  const [allArmor, setAllArmor]         = useState<DndArmor[]>([]);
  const [loadingArmor, setLoadingArmor] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<keyof Currency | null>(null);
  const [currencyInput, setCurrencyInput] = useState('');

  // Load armor data when armor picker opens
  useEffect(() => {
    if (showArmorPicker && allArmor.length === 0) {
      setLoadingArmor(true);
      DataService.getArmor().then(a => { setAllArmor(a); setLoadingArmor(false); });
    }
  }, [showArmorPicker, allArmor.length]);

  const currency = char.currency ?? DEFAULT_CURRENCY;
  const attuned  = char.attuned ?? [];

  const totalWeight = char.equipment.reduce((sum, item) => {
    return sum + (item.weight ?? 0) * item.quantity;
  }, 0);

  const encumbrance      = derived.carryingCapacity;
  const overEncumbered   = totalWeight > encumbrance;
  const heavyEncumbered  = totalWeight > Math.floor(encumbrance * 2 / 3);

  function updateCurrency(key: keyof Currency, val: number) {
    onUpdate({ currency: { ...currency, [key]: Math.max(0, val) } });
  }

  function startCurrencyEdit(key: keyof Currency) {
    setEditingCurrency(key);
    setCurrencyInput(String(currency[key]));
  }

  function commitCurrencyEdit() {
    if (!editingCurrency) return;
    const val = parseInt(currencyInput);
    if (!isNaN(val)) updateCurrency(editingCurrency, val);
    setEditingCurrency(null);
  }

  function addItem() {
    const name = newItem.trim();
    if (!name) return;
    const qty = parseInt(newQty) || 1;
    const updated = [...char.equipment, { name, quantity: qty, source: 'custom' as const }];
    onUpdate({ equipment: updated });
    setNewItem('');
    setNewQty('1');
  }

  function updateQty(idx: number, qty: number) {
    if (qty < 1) return;
    const updated = char.equipment.map((item, i) => i === idx ? { ...item, quantity: qty } : item);
    onUpdate({ equipment: updated });
  }

  function removeItem(idx: number) {
    onUpdate({ equipment: char.equipment.filter((_, i) => i !== idx) });
  }

  function equipArmor(key: string | undefined) {
    onUpdate({ equippedArmorKey: key });
    setArmorPicker(false);
  }

  function addMagicItem(item: DndMagicItem) {
    const updated = [...char.equipment, {
      name: item.name,
      quantity: 1,
      weight: item.weight,
      source: 'custom' as const,
    }];
    onUpdate({ equipment: updated });
    setMagicBrowser(false);
  }

  function toggleAttuned(name: string) {
    if (attuned.includes(name)) {
      onUpdate({ attuned: attuned.filter(a => a !== name) });
    } else if (attuned.length < MAX_ATTUNED) {
      onUpdate({ attuned: [...attuned, name] });
    }
  }

  const bySource: Record<string, EquipmentItem[]> = {};
  for (const item of char.equipment) {
    const src = item.source ?? 'custom';
    if (!bySource[src]) bySource[src] = [];
    bySource[src].push(item);
  }

  const sourceLabels: Record<string, string> = {
    class:      'Class Equipment',
    background: 'Background Equipment',
    pack:       'Pack',
    custom:     'Other Items',
  };

  const wearableArmor = allArmor.filter(a => ['light', 'medium', 'heavy'].includes(a.type));

  return (
    <div className="space-y-4">
      {/* Currency */}
      <div className="surface-parchment rounded p-3">
        <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">Currency</div>
        <div className="grid grid-cols-5 gap-2">
          {CURRENCY_LABELS.map(({ key, label, color }) => (
            <div key={key} className="text-center">
              <div className={`text-[9px] font-display uppercase tracking-wider ${color} mb-1`}>{label}</div>
              {editingCurrency === key ? (
                <input
                  autoFocus
                  type="number"
                  min={0}
                  value={currencyInput}
                  onChange={e => setCurrencyInput(e.target.value)}
                  onBlur={commitCurrencyEdit}
                  onKeyDown={e => { if (e.key === 'Enter') commitCurrencyEdit(); if (e.key === 'Escape') setEditingCurrency(null); }}
                  className="w-full text-center font-display text-sm bg-parchment border border-gold/40 rounded px-1 py-1 text-dark-ink focus:outline-none"
                />
              ) : (
                <button
                  onClick={() => startCurrencyEdit(key)}
                  className="w-full font-display text-dark-ink text-sm border border-gold/20 rounded px-1 py-1 hover:border-gold/50 transition-colors"
                >
                  {currency[key]}
                </button>
              )}
              <div className="flex gap-0.5 justify-center mt-1">
                <button onClick={() => updateCurrency(key, currency[key] + 1)} className="text-[9px] text-stone hover:text-gold px-1">+</button>
                <button onClick={() => updateCurrency(key, currency[key] - 1)} className="text-[9px] text-stone hover:text-crimson px-1">−</button>
              </div>
            </div>
          ))}
        </div>
        {/* Legacy gold field */}
        {char.gold > 0 && (
          <div className="mt-2 pt-2 border-t border-gold/10 text-[10px] font-body text-stone/60">
            Starting gold: {char.gold} gp (add to GP above)
          </div>
        )}
      </div>

      {/* Armor & Shield */}
      <div className="surface-parchment rounded p-3 space-y-2">
        <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">Armor & Defense</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-body text-dark-ink">
              {char.equippedArmorKey
                ? (allArmor.find(a => a._key === char.equippedArmorKey)?.name ?? char.equippedArmorKey)
                : 'Unarmored'}
            </span>
            {char.equippedArmorKey && (
              <button
                onClick={() => equipArmor(undefined)}
                className="text-[9px] font-display text-crimson/70 hover:text-crimson uppercase tracking-wider"
              >
                Remove
              </button>
            )}
          </div>
          <button
            onClick={() => setArmorPicker(true)}
            className="text-[10px] font-display uppercase tracking-wider text-gold hover:text-gold/70 transition-colors"
          >
            {char.equippedArmorKey ? '⚔ Change' : '⚔ Equip Armor'}
          </button>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-gold/10">
          <span className="text-xs font-body text-dark-ink">Shield</span>
          <button
            onClick={() => onUpdate({ hasShield: !char.hasShield })}
            className={`
              w-10 h-5 rounded-full border-2 transition-colors relative
              ${char.hasShield ? 'border-gold bg-gold/30' : 'border-stone/40 bg-transparent'}
            `}
          >
            <span className={`
              absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all
              ${char.hasShield ? 'right-0.5 bg-gold' : 'left-0.5 bg-stone/40'}
            `} />
          </button>
        </div>
      </div>

      {/* Attunement Slots */}
      <div className="surface-parchment rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-display uppercase tracking-wider text-stone">Attunement</div>
          <span className={`text-[10px] font-display ${attuned.length >= MAX_ATTUNED ? 'text-crimson' : 'text-stone'}`}>
            {attuned.length}/{MAX_ATTUNED}
          </span>
        </div>
        {attuned.length === 0 ? (
          <div className="text-[10px] font-body text-stone/50 italic">No items attuned</div>
        ) : (
          <div className="space-y-1">
            {attuned.map((name, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs font-body text-dark-ink">{name}</span>
                <button
                  onClick={() => toggleAttuned(name)}
                  className="text-[9px] text-stone/50 hover:text-crimson transition-colors font-display uppercase tracking-wider"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Encumbrance */}
      <div className="surface-parchment rounded px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display uppercase tracking-wider text-stone">Carrying Capacity</span>
          <span className={`font-display text-sm ${overEncumbered ? 'text-crimson' : heavyEncumbered ? 'text-amber-500' : 'text-dark-ink'}`}>
            {totalWeight.toFixed(1)} / {encumbrance} lb
          </span>
        </div>
        {totalWeight > 0 && (
          <div className="w-full h-1 bg-shadow/30 rounded-full mt-1">
            <div
              className={`h-1 rounded-full transition-all ${overEncumbered ? 'bg-crimson' : heavyEncumbered ? 'bg-amber-500' : 'bg-gold/50'}`}
              style={{ width: `${Math.min(100, (totalWeight / encumbrance) * 100)}%` }}
            />
          </div>
        )}
        {overEncumbered && (
          <div className="text-[9px] text-crimson font-body mt-0.5">Encumbered — speed reduced, disadvantage on checks</div>
        )}
      </div>

      {/* Equipment by source */}
      {char.equipment.length === 0 ? (
        <div className="text-center py-6 text-stone font-display uppercase tracking-wider text-xs">
          No equipment recorded
        </div>
      ) : (
        Object.entries(bySource).map(([src, items]) => (
          <div key={src}>
            <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">
              {sourceLabels[src] ?? src}
            </div>
            <div className="surface-parchment rounded divide-y divide-gold/10">
              {items.map((item, idx) => {
                const globalIdx = char.equipment.indexOf(item);
                const isAttuned = attuned.includes(item.name);
                return (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2">
                    <span className="flex-1 text-sm font-body text-dark-ink">{item.name}</span>
                    {item.weight != null && (
                      <span className="text-[10px] text-stone font-body">{item.weight * item.quantity} lb</span>
                    )}
                    {/* Attunement toggle */}
                    <button
                      onClick={() => toggleAttuned(item.name)}
                      title={isAttuned ? 'Attuned (click to remove)' : attuned.length >= MAX_ATTUNED ? 'Max 3 attuned items' : 'Attune to this item'}
                      disabled={!isAttuned && attuned.length >= MAX_ATTUNED}
                      className={`text-[9px] font-display uppercase tracking-wider transition-colors px-1 ${
                        isAttuned ? 'text-gold' : 'text-stone/30 hover:text-stone/60 disabled:opacity-20 disabled:cursor-not-allowed'
                      }`}
                    >
                      ✦
                    </button>
                    {editing ? (
                      <>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => updateQty(globalIdx, parseInt(e.target.value) || 1)}
                          className="w-12 text-center text-xs font-body bg-parchment border border-gold/30 rounded px-1 py-0.5 text-dark-ink"
                        />
                        <button
                          onClick={() => removeItem(globalIdx)}
                          className="text-crimson/60 hover:text-crimson text-xs font-display ml-1"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-display text-stone">×{item.quantity}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Add item */}
      {editing && (
        <div className="surface-parchment rounded p-3 space-y-2">
          <div className="text-[10px] font-display uppercase tracking-wider text-stone">Add Item</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Item name…"
              className="flex-1 text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink placeholder:text-stone/50 focus:outline-none focus:border-gold"
            />
            <input
              type="number"
              min={1}
              value={newQty}
              onChange={e => setNewQty(e.target.value)}
              className="w-14 text-center text-sm font-body bg-parchment border border-gold/30 rounded px-1 py-1 text-dark-ink focus:outline-none focus:border-gold"
            />
            <button
              onClick={addItem}
              className="px-3 py-1 rounded bg-gold/20 border border-gold text-gold font-display text-xs uppercase tracking-wider hover:bg-gold/30 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setEditing(e => !e)}
          className="text-xs font-display uppercase tracking-wider text-stone hover:text-gold transition-colors"
        >
          {editing ? '✓ Done Editing' : '✎ Edit Equipment'}
        </button>
        <button
          onClick={() => setMagicBrowser(true)}
          className="text-xs font-display uppercase tracking-wider text-stone hover:text-gold transition-colors"
        >
          ✦ Browse Magic Items
        </button>
      </div>

      {/* Armor Picker Modal */}
      {showArmorPicker && (
        <ArmorPickerModal
          allArmor={wearableArmor}
          loading={loadingArmor}
          equippedKey={char.equippedArmorKey}
          onEquip={equipArmor}
          onClose={() => setArmorPicker(false)}
        />
      )}

      {/* Magic Item Browser Modal */}
      {showMagicBrowser && (
        <MagicItemBrowserModal
          onAdd={addMagicItem}
          onClose={() => setMagicBrowser(false)}
        />
      )}
    </div>
  );
}

// ─── Armor Picker Modal ───────────────────────────────────────────────────────
function ArmorPickerModal({
  allArmor, loading, equippedKey, onEquip, onClose,
}: {
  allArmor: DndArmor[];
  loading: boolean;
  equippedKey: string | undefined;
  onEquip: (key: string | undefined) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-shadow/70" onClick={onClose}>
      <div
        className="surface-parchment rounded-lg border border-gold/40 shadow-2xl w-80 max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20">
          <h3 className="font-display text-gold uppercase tracking-wider text-sm">Equip Armor</h3>
          <button onClick={onClose} className="text-stone hover:text-gold text-sm">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading && <div className="text-center py-4 text-stone text-xs">Loading…</div>}
          <button
            onClick={() => onEquip(undefined)}
            className={`w-full text-left px-3 py-2 rounded text-sm font-body transition-colors ${
              !equippedKey ? 'bg-gold/20 text-dark-ink border border-gold/40' : 'text-dark-ink hover:bg-gold/10'
            }`}
          >
            <span className="font-display text-xs text-gold mr-2">—</span>
            Unarmored
          </button>
          {allArmor.map(armor => (
            <button
              key={armor._key}
              onClick={() => onEquip(armor._key)}
              className={`w-full text-left px-3 py-2 rounded text-sm font-body transition-colors ${
                equippedKey === armor._key
                  ? 'bg-gold/20 text-dark-ink border border-gold/40'
                  : 'text-dark-ink hover:bg-gold/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{armor.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-display text-stone uppercase">{armor.type}</span>
                  <span className="font-display text-gold text-sm">AC {armor.ac}</span>
                </div>
              </div>
              {armor.stealthdis && (
                <div className="text-[9px] text-stone/70 font-body mt-0.5">Disadvantage on Stealth</div>
              )}
              {armor.strReq && (
                <div className="text-[9px] text-stone/70 font-body">Str {armor.strReq}+ required</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Magic Item Browser Modal ─────────────────────────────────────────────────
function MagicItemBrowserModal({
  onAdd, onClose,
}: {
  onAdd: (item: DndMagicItem) => void;
  onClose: () => void;
}) {
  const [items, setItems]     = useState<DndMagicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');
  const [rarity, setRarity]   = useState('');

  useEffect(() => {
    DataService.getMagicItems().then(all => { setItems(all); setLoading(false); });
  }, []);

  const RARITIES = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];

  const filtered = items.filter(item => {
    const matchQ = !query || item.name.toLowerCase().includes(query.toLowerCase());
    const matchR = !rarity || item.rarity === rarity;
    const hasDesc = !!item.description;
    return matchQ && matchR && hasDesc && item.rarity;
  });

  const RARITY_COLOR: Record<string, string> = {
    common: 'text-stone',
    uncommon: 'text-green-600',
    rare: 'text-blue-500',
    'very rare': 'text-purple-500',
    legendary: 'text-amber-500',
    artifact: 'text-red-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-shadow/70" onClick={onClose}>
      <div
        className="surface-parchment rounded-lg border border-gold/40 shadow-2xl w-[28rem] max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20">
          <h3 className="font-display text-gold uppercase tracking-wider text-sm">Magic Item Browser</h3>
          <button onClick={onClose} className="text-stone hover:text-gold text-sm">✕</button>
        </div>
        <div className="px-3 py-2 border-b border-gold/10 space-y-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search items…"
            autoFocus
            className="w-full text-sm font-body bg-parchment border border-gold/30 rounded px-2 py-1 text-dark-ink placeholder:text-stone/50 focus:outline-none focus:border-gold"
          />
          <div className="flex gap-1 flex-wrap">
            {['', ...RARITIES].map(r => (
              <button
                key={r}
                onClick={() => setRarity(r)}
                className={`text-[9px] font-display uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${
                  rarity === r
                    ? 'border-gold bg-gold/20 text-gold'
                    : 'border-stone/30 text-stone hover:border-gold/50'
                }`}
              >
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && <div className="text-center py-8"><Spinner /></div>}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-8 text-stone text-xs font-display uppercase tracking-wider">
              No items found
            </div>
          )}
          {filtered.slice(0, 100).map(item => (
            <button
              key={item._key}
              onClick={() => onAdd(item)}
              className="w-full text-left px-3 py-2 rounded hover:bg-gold/10 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-body text-dark-ink group-hover:text-gold transition-colors">
                  {item.name}
                </span>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-[9px] font-display uppercase tracking-wider ${RARITY_COLOR[item.rarity ?? ''] ?? 'text-stone'}`}>
                    {item.rarity}
                  </div>
                  {item.attunement && (
                    <div className="text-[8px] text-stone/60 font-display">Attunement</div>
                  )}
                </div>
              </div>
              {item.type && (
                <div className="text-[10px] text-stone font-body mt-0.5">{item.type}</div>
              )}
            </button>
          ))}
          {filtered.length > 100 && (
            <div className="text-center py-2 text-[10px] text-stone font-display uppercase tracking-wider">
              Showing first 100 of {filtered.length} — refine your search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
