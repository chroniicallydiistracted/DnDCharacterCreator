import { useEffect, useState } from 'react';
import type { DndClass, DndBackground, DndPack } from '../../../types/data';
import type { EquipmentItem } from '../../../types/character';
import DataService from '../../../services/data.service';
import { useCharacterStore } from '../../../store/character.store';
import { Divider } from '../../ui/Divider';
import { Badge }   from '../../ui/Badge';

export function Step5Equipment() {
  const [cls,    setCls]    = useState<DndClass | null>(null);
  const [bg,     setBg]     = useState<DndBackground | null>(null);
  const [packs,  setPacks]  = useState<DndPack[]>([]);
  const [loading,setLoading]= useState(true);
  const { draft, setChosenPack, setUseStartingGold, setCustomEquipment } = useCharacterStore();

  // Custom item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty,  setNewItemQty]  = useState('1');
  const [newItemWt,   setNewItemWt]   = useState('');

  useEffect(() => {
    Promise.all([
      DataService.getClasses(),
      DataService.getBackgrounds(),
      DataService.getPacks(),
    ]).then(([classes, backgrounds, p]) => {
      setCls(classes.find(c => c._key === draft.classKey) ?? null);
      setBg(backgrounds.find(b => b._key === draft.background) ?? null);
      setPacks(p);
    }).finally(() => setLoading(false));
  }, [draft.classKey, draft.background]);

  if (loading) return <div className="text-center py-8 text-stone font-display">Loading equipment…</div>;

  const bgEquip = [...(bg?.equipleft ?? []), ...(bg?.equipright ?? [])];

  function addCustomItem() {
    const name = newItemName.trim();
    if (!name) return;
    const qty    = Math.max(1, parseInt(newItemQty) || 1);
    const weight = newItemWt.trim() ? (parseFloat(newItemWt) || undefined) : undefined;
    const item: EquipmentItem = { name, quantity: qty, weight, source: 'custom' };
    setCustomEquipment([...draft.customEquipment, item]);
    setNewItemName('');
    setNewItemQty('1');
    setNewItemWt('');
  }

  function removeCustomItem(idx: number) {
    setCustomEquipment(draft.customEquipment.filter((_, i) => i !== idx));
  }

  function updateCustomQty(idx: number, qty: number) {
    if (qty < 1) return;
    setCustomEquipment(
      draft.customEquipment.map((item, i) => i === idx ? { ...item, quantity: qty } : item)
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-display-lg text-gold text-shadow">Starting Equipment</h2>
        <p className="text-sm font-body text-stone mt-1">
          Your class and background each grant starting gear. Add any additional items below.
        </p>
      </div>

      {/* Class equipment */}
      {cls?.equipment && (
        <section className="space-y-2">
          <h3 className="font-display text-display-sm text-dark-ink">Class Equipment — {cls.name}</h3>
          <div className="
            rounded border border-gold/30
            bg-aged-paper/50 p-4
            font-body text-sm text-dark-ink leading-relaxed
            whitespace-pre-line
          ">
            {cls.equipment}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-stone font-display uppercase tracking-wider">— or —</span>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={draft.useStartingGold}
                onChange={e => setUseStartingGold(e.target.checked)}
                className="w-4 h-4 rounded accent-gold"
              />
              <span className="text-xs font-body text-stone group-hover:text-dark-ink transition-colors">
                Take starting gold instead
              </span>
            </label>
          </div>
        </section>
      )}

      <Divider />

      {/* Equipment pack selection */}
      <section className="space-y-3">
        <h3 className="font-display text-display-sm text-dark-ink">Equipment Pack</h3>
        <p className="text-xs text-stone font-body">Select a pre-made pack if your class offers pack choices.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {packs.map(pack => (
            <div
              key={pack._key}
              onClick={() => setChosenPack(draft.chosenPackKey === pack._key ? null : pack._key)}
              className={`
                rounded border-2 p-3 cursor-pointer transition-all duration-150
                ${draft.chosenPackKey === pack._key
                  ? 'border-gold bg-gold/10 shadow-card-hover'
                  : 'border-gold/20 bg-aged-paper/40 hover:border-gold/50'}
              `}
            >
              <div className="flex justify-between items-start">
                <span className="font-display text-sm text-dark-ink">{pack.name}</span>
                {draft.chosenPackKey === pack._key && <span className="text-gold">✓</span>}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {pack.items.slice(0, 5).map(([name], i) => (
                  <Badge key={i} color="stone">{name}</Badge>
                ))}
                {pack.items.length > 5 && <Badge color="stone">+{pack.items.length - 5} more</Badge>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Background equipment */}
      {bgEquip.length > 0 && (
        <>
          <Divider />
          <section className="space-y-2">
            <h3 className="font-display text-display-sm text-dark-ink">Background Equipment — {bg?.name}</h3>
            <ul className="space-y-1">
              {bgEquip.map(([name, qty], i) => (
                <li key={i} className="flex gap-2 text-sm font-body text-dark-ink">
                  <span className="text-gold">◆</span>
                  {qty ? `${qty} × ` : ''}{name}
                </li>
              ))}
            </ul>
            {bg?.gold != null && (
              <div className="text-sm font-body">
                <span className="text-stone">Starting gold: </span>
                <span className="font-semibold text-dark-ink">{bg.gold} gp</span>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Custom items ──────────────────────────────────────────────────────── */}
      <Divider label="Additional Items" />
      <section className="space-y-3">
        <p className="text-xs text-stone font-body">
          Add any extra items your character starts with (quest gear, gifts, heirlooms, etc.).
        </p>

        {/* Existing custom items */}
        {draft.customEquipment.length > 0 && (
          <div className="surface-parchment rounded divide-y divide-gold/10">
            {draft.customEquipment.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2">
                <span className="flex-1 text-sm font-body text-dark-ink">{item.name}</span>
                {item.weight != null && (
                  <span className="text-[10px] font-body text-stone">{item.weight * item.quantity} lb</span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateCustomQty(idx, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-5 h-5 rounded text-xs border border-gold/30 text-stone hover:text-dark-ink disabled:opacity-30 transition-colors"
                  >−</button>
                  <span className="text-xs font-display text-dark-ink w-6 text-center">×{item.quantity}</span>
                  <button
                    onClick={() => updateCustomQty(idx, item.quantity + 1)}
                    className="w-5 h-5 rounded text-xs border border-gold/30 text-stone hover:text-dark-ink transition-colors"
                  >+</button>
                </div>
                <button
                  onClick={() => removeCustomItem(idx)}
                  className="text-[10px] font-display text-stone/50 hover:text-crimson uppercase tracking-wider transition-colors ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add item form */}
        <div className="surface-parchment rounded p-3 space-y-2">
          <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">Add Item</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomItem()}
              placeholder="Item name…"
              className="
                flex-1 text-sm font-body bg-parchment border border-gold/30 rounded
                px-2 py-1.5 text-dark-ink placeholder:text-stone/50
                focus:outline-none focus:border-gold
              "
            />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[9px] font-display text-stone uppercase tracking-wider px-1">Qty</span>
              <input
                type="number"
                min={1}
                value={newItemQty}
                onChange={e => setNewItemQty(e.target.value)}
                className="
                  w-14 text-center text-sm font-body bg-parchment border border-gold/30 rounded
                  px-1 py-1.5 text-dark-ink focus:outline-none focus:border-gold
                "
              />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[9px] font-display text-stone uppercase tracking-wider px-1">Weight (lb)</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={newItemWt}
                onChange={e => setNewItemWt(e.target.value)}
                placeholder="—"
                className="
                  w-20 text-center text-sm font-body bg-parchment border border-gold/30 rounded
                  px-1 py-1.5 text-dark-ink placeholder:text-stone/30 focus:outline-none focus:border-gold
                "
              />
            </div>
            <button
              onClick={addCustomItem}
              disabled={!newItemName.trim()}
              className="
                self-end px-3 py-1.5 rounded bg-gold/20 border border-gold text-gold
                font-display text-xs uppercase tracking-wider
                hover:bg-gold/30 transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
              "
            >
              Add
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
