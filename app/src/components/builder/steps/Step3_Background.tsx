import { useEffect, useState, useCallback } from 'react';
import type { DndBackground, DndBackgroundFeature, DndBackgroundVariant } from '../../../types/data';
import DataService from '../../../services/data.service';
import { useCharacterStore } from '../../../store/character.store';
import { EntityBrowser } from '../shared/EntityBrowser';
import { EntityCard }    from '../shared/EntityCard';
import { Divider }       from '../../ui/Divider';
import { Badge }         from '../../ui/Badge';

function BackgroundDetail({ 
  bg, 
  feature, 
  variants,
  selectedVariant,
  onVariant,
}: { 
  bg: DndBackground; 
  feature?: DndBackgroundFeature;
  variants: DndBackgroundVariant[];
  selectedVariant: string | null;
  onVariant: (key: string | null) => void;
}) {
  const equip = [...(bg.equipleft ?? []), ...(bg.equipright ?? [])];
  // Get the active variant's data if one is selected
  const activeVariant = selectedVariant ? variants.find(v => v._key === selectedVariant) : null;
  // Use variant feature if it overrides, otherwise use base background feature
  const displayFeature = activeVariant?.feature ?? bg.feature;
  
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-display-md text-dark-ink">
          {activeVariant ? activeVariant.name : bg.name}
        </h3>
        {activeVariant && (
          <div className="text-xs font-body text-stone italic">Variant of {bg.name}</div>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {(bg.skills ?? []).map(s => <Badge key={s} color="green">{s}</Badge>)}
        {/* Show variant tool profs if different, otherwise base */}
        {(activeVariant?.toolProfs ?? bg.toolProfs)?.map((t, i) => (
          <Badge key={i} color="stone">{Array.isArray(t) ? t[0] : t}</Badge>
        ))}
      </div>

      {bg.gold != null && (
        <div className="text-xs font-body">
          <span className="text-[9px] font-display uppercase tracking-wider text-stone">Starting Gold: </span>
          <span className="text-dark-ink font-semibold">{bg.gold} gp</span>
        </div>
      )}

      {/* Variants picker */}
      {variants.length > 0 && (
        <>
          <Divider label="Variants" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onVariant(null)}
              className={`px-2 py-1 rounded text-xs font-display border transition-colors ${!selectedVariant ? 'bg-gold/20 border-gold text-gold' : 'border-gold/30 text-stone hover:border-gold/50'}`}
            >Standard</button>
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

      {feature && displayFeature && (
        <>
          <Divider label="Feature" />
          <div>
            <div className="text-xs font-display font-semibold text-dark-ink mb-1">{displayFeature}</div>
            <div className="text-xs font-body text-stone leading-relaxed line-clamp-4">{feature.description}</div>
          </div>
        </>
      )}

      {equip.length > 0 && (
        <>
          <Divider label="Equipment" />
          <ul className="space-y-0.5">
            {equip.map(([name, qty], i) => (
              <li key={i} className="text-xs font-body text-dark-ink flex gap-1">
                <span className="text-gold">◆</span>
                {qty ? `${qty} × ` : ''}{name}
              </li>
            ))}
          </ul>
        </>
      )}

      {bg.trait && bg.trait.length > 0 && (
        <>
          <Divider label="Sample Trait" />
          <p className="text-xs font-body italic text-stone leading-relaxed">{bg.trait[0]}</p>
        </>
      )}
    </div>
  );
}

export function Step3Background() {
  const [backgrounds, setBackgrounds]   = useState<DndBackground[]>([]);
  const [features, setFeatures]         = useState<DndBackgroundFeature[]>([]);
  const [variants, setVariants]         = useState<DndBackgroundVariant[]>([]);
  const [loading,    setLoading]        = useState(true);
  const { draft, setBackground, setBackgroundVariant } = useCharacterStore();

  useEffect(() => {
    Promise.all([
      DataService.getBackgrounds(), 
      DataService.getBackgroundFeatures(),
      DataService.getBackgroundVariants(),
    ])
      .then(([b, f, v]) => { setBackgrounds(b); setFeatures(f); setVariants(v); })
      .finally(() => setLoading(false));
  }, []);

  function getFeature(bg: DndBackground) {
    if (!bg.feature) return undefined;
    return features.find(f => f._key.toLowerCase() === bg.feature?.toLowerCase() ||
      f._key.toLowerCase().includes(bg.feature?.toLowerCase().split(' ')[0] ?? ''));
  }

  /** Get variants for a specific background */
  const variantsFor = useCallback((bgKey: string) => {
    return variants.filter(v => v._parentBackground === bgKey);
  }, [variants]);

  /** Handle background selection */
  const handleSelectBackground = useCallback((bg: DndBackground) => {
    setBackground(bg._key);
    setBackgroundVariant(null);
  }, [setBackground, setBackgroundVariant]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-display-lg text-gold text-shadow">Choose Your Background</h2>
        <p className="text-sm font-body text-stone mt-1">
          Your background reveals where you came from and how you survived before becoming an adventurer.
        </p>
      </div>

      <EntityBrowser<DndBackground>
        context="background"
        items={backgrounds}
        loading={loading}
        selectedKey={draft.background}
        onSelect={handleSelectBackground}
        getKey={b => b._key}
        getName={b => b.name}
        filterFn={(b, q) => b.name.toLowerCase().includes(q) ||
          (b.skills ?? []).some(s => s.toLowerCase().includes(q))}
        placeholder="Search backgrounds…"
        columns={3}
        renderCard={(bg, selected, onClick) => (
          <EntityCard
            name={bg.name}
            source={bg.source}
            badges={(bg.skills ?? []).map(s => ({ label: s, color: 'green' as const }))}
            selected={selected}
            onClick={onClick}
            preview={bg.feature}
          />
        )}
        renderDetail={bg => (
          <BackgroundDetail 
            bg={bg} 
            feature={getFeature(bg)}
            variants={variantsFor(bg._key)}
            selectedVariant={draft.backgroundVariant}
            onVariant={setBackgroundVariant}
          />
        )}
      />
    </div>
  );
}
