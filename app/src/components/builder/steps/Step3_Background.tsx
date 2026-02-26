import { useEffect, useState } from 'react';
import type { DndBackground, DndBackgroundFeature } from '../../../types/data';
import DataService from '../../../services/data.service';
import { useCharacterStore } from '../../../store/character.store';
import { EntityBrowser } from '../shared/EntityBrowser';
import { EntityCard }    from '../shared/EntityCard';
import { Divider }       from '../../ui/Divider';
import { Badge }         from '../../ui/Badge';

function BackgroundDetail({ bg, feature }: { bg: DndBackground; feature?: DndBackgroundFeature }) {
  const equip = [...(bg.equipleft ?? []), ...(bg.equipright ?? [])];
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-display-md text-dark-ink">{bg.name}</h3>
      </div>

      <div className="flex flex-wrap gap-1">
        {bg.skills.map(s => <Badge key={s} color="green">{s}</Badge>)}
        {bg.toolProfs?.map((t, i) => (
          <Badge key={i} color="stone">{Array.isArray(t) ? t[0] : t}</Badge>
        ))}
      </div>

      {bg.gold != null && (
        <div className="text-xs font-body">
          <span className="text-[9px] font-display uppercase tracking-wider text-stone">Starting Gold: </span>
          <span className="text-dark-ink font-semibold">{bg.gold} gp</span>
        </div>
      )}

      {feature && (
        <>
          <Divider label="Feature" />
          <div>
            <div className="text-xs font-display font-semibold text-dark-ink mb-1">{bg.feature}</div>
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
  const [loading,    setLoading]        = useState(true);
  const { draft, setBackground } = useCharacterStore();

  useEffect(() => {
    Promise.all([DataService.getBackgrounds(), DataService.getBackgroundFeatures()])
      .then(([b, f]) => { setBackgrounds(b); setFeatures(f); })
      .finally(() => setLoading(false));
  }, []);

  function getFeature(bg: DndBackground) {
    if (!bg.feature) return undefined;
    return features.find(f => f._key.toLowerCase() === bg.feature?.toLowerCase() ||
      f._key.toLowerCase().includes(bg.feature?.toLowerCase().split(' ')[0] ?? ''));
  }

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
        onSelect={bg => setBackground(bg._key)}
        getKey={b => b._key}
        getName={b => b.name}
        filterFn={(b, q) => b.name.toLowerCase().includes(q) ||
          b.skills.some(s => s.toLowerCase().includes(q))}
        placeholder="Search backgrounds…"
        columns={3}
        renderCard={(bg, selected, onClick) => (
          <EntityCard
            name={bg.name}
            source={bg.source}
            badges={bg.skills.map(s => ({ label: s, color: 'green' as const }))}
            selected={selected}
            onClick={onClick}
            preview={bg.feature}
          />
        )}
        renderDetail={bg => <BackgroundDetail bg={bg} feature={getFeature(bg)} />}
      />
    </div>
  );
}
