import { useState, useEffect } from 'react';
import type { Character } from '../../../types/character';
import type { ClassFeature, DndBackgroundFeature, DndFeat } from '../../../types/data';
import DataService from '../../../services/data.service';
import { resolveMaxUses } from '../../../services/character.calculator';
import { Spinner } from '../../ui/Spinner';
import { Divider } from '../../ui/Divider';

interface Props {
  char: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

interface FeatureGroup {
  source: string;
  level: number;
  classKey: string;
  classLevel: number;
  features: { name: string; feature: ClassFeature }[];
}

/** Normalise recovery to a canonical string for display */
function recoveryLabel(recovery: string | string[] | undefined): string {
  if (!recovery) return 'long rest';
  const r = Array.isArray(recovery) ? recovery[0] : recovery;
  if (r === 'short rest') return 'short rest';
  return 'long rest';
}

export function FeaturesPanel({ char, onUpdate }: Props) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups]   = useState<FeatureGroup[]>([]);
  const [open, setOpen]       = useState<Set<string>>(new Set());
  const [raceTraits, setRaceTraits] = useState<string[]>([]);
  const [bgFeature, setBgFeature]   = useState<DndBackgroundFeature | null>(null);
  const [raceName, setRaceName]     = useState<string>('');
  const [bgFeatureName, setBgFeatureName] = useState<string>('');
  const [charFeats, setCharFeats]   = useState<DndFeat[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      DataService.getClasses(),
      DataService.getSubclasses(),
      char.race ? DataService.getRaces().then(all => all.find(r => r._key === char.race) ?? null) : null,
      char.background
        ? Promise.all([
            DataService.getBackgrounds().then(all => all.find(b => b._key === char.background) ?? null),
            DataService.getBackgroundFeatures(),
          ])
        : null,
      char.feats?.length ? DataService.getFeats() : Promise.resolve([] as DndFeat[]),
    ]).then(([allClasses, allSubs, race, bgData, allFeats]) => {
      const result: FeatureGroup[] = [];

      for (const cc of char.classes) {
        const cls = allClasses.find(c => c._key === cc.classKey);
        if (!cls) continue;

        const byLevel = new Map<number, { name: string; feature: ClassFeature }[]>();
        for (const [key, feat] of Object.entries(cls.features)) {
          const lvl = feat.minlevel ?? 1;
          if (lvl > cc.level) continue;
          if (!byLevel.has(lvl)) byLevel.set(lvl, []);
          byLevel.get(lvl)!.push({ name: feat.name ?? key, feature: feat });
        }

        for (const [lvl, feats] of [...byLevel.entries()].sort((a,b) => a[0]-b[0])) {
          result.push({
            source:     cls.name,
            level:      lvl,
            classKey:   cc.classKey,
            classLevel: cc.level,
            features:   feats,
          });
        }

        // Subclass features
        if (cc.subclassKey) {
          const sub = allSubs.find(s => s._key === cc.subclassKey);
          if (sub) {
            const subByLevel = new Map<number, { name: string; feature: ClassFeature }[]>();
            for (const [key, feat] of Object.entries(sub.features)) {
              const lvl = feat.minlevel ?? 1;
              if (lvl > cc.level) continue;
              if (!subByLevel.has(lvl)) subByLevel.set(lvl, []);
              subByLevel.get(lvl)!.push({ name: feat.name ?? key, feature: feat });
            }
            for (const [lvl, feats] of [...subByLevel.entries()].sort((a,b) => a[0]-b[0])) {
              result.push({
                source:     sub.subname,
                level:      lvl,
                classKey:   cc.classKey,
                classLevel: cc.level,
                features:   feats,
              });
            }
          }
        }
      }

      result.sort((a, b) => a.level - b.level || a.source.localeCompare(b.source));
      setGroups(result);

      // Racial features
      if (race) {
        setRaceName(race.name);
        // Parse trait text block into bullet points
        const trait = race.trait ?? '';
        const bullets = trait
          .split('\n')
          .filter(l => l.startsWith('•'))
          .map(l => l.slice(1).trim())
          .filter(Boolean);
        setRaceTraits(bullets.length > 0 ? bullets : trait ? [trait] : []);
      }

      // Background feature
      if (bgData) {
        const [bg, bgFeatures] = bgData as [{ feature?: string; name?: string } | null, DndBackgroundFeature[]];
        if (bg?.feature) {
          const feat = bgFeatures.find(f => f._key === bg.feature);
          if (feat) {
            setBgFeature(feat);
            // Feature key is like "wanderer" → format as "Wanderer"
            setBgFeatureName(bg.feature.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
          }
        }
      }

      // Feats chosen by character
      if (char.feats?.length && allFeats) {
        const featKeys = new Set(char.feats);
        setCharFeats((allFeats as DndFeat[]).filter(f => featKeys.has(f._key)));
      }

      setLoading(false);
    });
  }, [char.classes, char.race, char.background, char.feats]);

  function toggle(key: string) {
    setOpen(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function useCharge(featureKey: string, maxUses: number) {
    const current = char.featureUses?.[featureKey] ?? maxUses;
    if (current <= 0) return;
    onUpdate({ featureUses: { ...char.featureUses, [featureKey]: current - 1 } });
  }

  function restoreCharge(featureKey: string, maxUses: number) {
    const current = char.featureUses?.[featureKey] ?? maxUses;
    if (current >= maxUses) return;
    onUpdate({ featureUses: { ...char.featureUses, [featureKey]: current + 1 } });
  }

  // Wild Shape limits (Druid L2+)
  const druidEntry  = char.classes.find(cc => cc.classKey === 'druid');
  const druidLevel  = druidEntry?.level ?? 0;
  const wildShapeCR = druidLevel >= 8 ? '1' : druidLevel >= 4 ? '1/2' : druidLevel >= 2 ? '1/4' : '';
  const wildShapeNote = druidLevel >= 8 ? 'All terrain types'
    : druidLevel >= 4 ? 'No fly speed'
    : druidLevel >= 2 ? 'No swim speed, no fly speed'
    : '';

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-2">
      {/* Wild Shape limits — Druid L2+ */}
      {wildShapeCR && (
        <div className="surface-parchment rounded border border-gold/30 px-3 py-2 flex items-center gap-3">
          <span className="text-xs font-display text-gold uppercase tracking-wider flex-shrink-0">Wild Shape</span>
          <span className="font-display text-dark-ink text-sm">Max CR {wildShapeCR}</span>
          <span className="text-[10px] font-body text-stone italic">{wildShapeNote}</span>
          <span className="ml-auto text-[9px] font-display text-stone uppercase tracking-wider">2×/short rest</span>
        </div>
      )}

      {/* Racial traits */}
      {raceTraits.length > 0 && (
        <>
          <Divider label={`${raceName} Traits`} />
          <div className="space-y-1">
            {raceTraits.map((trait, i) => {
              const colonIdx = trait.indexOf(':');
              const name  = colonIdx > 0 ? trait.slice(0, colonIdx).trim() : `Trait ${i + 1}`;
              const desc  = colonIdx > 0 ? trait.slice(colonIdx + 1).trim() : trait;
              const key   = `race-trait-${i}`;
              const isOpen = open.has(key);
              return (
                <div key={key} className="surface-parchment rounded border border-gold/20">
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left"
                  >
                    <span className="text-xs font-display text-gold/60 font-bold w-6 flex-shrink-0 text-center">★</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm text-dark-ink">{name}</div>
                      <div className="text-[10px] font-display text-stone uppercase tracking-wider">{raceName}</div>
                    </div>
                    <span className="text-stone text-xs ml-auto flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && desc && (
                    <div className="px-4 pb-3 pt-0 border-t border-gold/10">
                      <p className="text-xs font-body text-dark-ink leading-relaxed">{desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Background feature */}
      {bgFeature && (
        <>
          <Divider label="Background Feature" />
          <div className="surface-parchment rounded border border-gold/20">
            <button
              onClick={() => toggle('bg-feature')}
              className="w-full flex items-center gap-2 px-3 py-2 text-left"
            >
              <span className="text-xs font-display text-gold/60 font-bold w-6 flex-shrink-0 text-center">✦</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm text-dark-ink">{bgFeatureName}</div>
                <div className="text-[10px] font-display text-stone uppercase tracking-wider">Background</div>
              </div>
              <span className="text-stone text-xs ml-auto flex-shrink-0">{open.has('bg-feature') ? '▲' : '▼'}</span>
            </button>
            {open.has('bg-feature') && (
              <div className="px-4 pb-3 pt-0 border-t border-gold/10">
                <p className="text-xs font-body text-dark-ink leading-relaxed">{bgFeature.description}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Feats */}
      {charFeats.length > 0 && (
        <>
          <Divider label="Feats" />
          {charFeats.map(feat => {
            const key    = `feat-${feat._key}`;
            const isOpen = open.has(key);
            return (
              <div key={key} className="surface-parchment rounded border border-gold/20">
                <button
                  onClick={() => toggle(key)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left"
                >
                  <span className="text-xs font-display text-gold/60 font-bold w-6 flex-shrink-0 text-center">✦</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm text-dark-ink">{feat.name}</div>
                    {feat.prereqs && (
                      <div className="text-[10px] font-display text-stone uppercase tracking-wider">Prereq: {feat.prereqs}</div>
                    )}
                  </div>
                  <span className="text-stone text-xs ml-auto flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && feat.description && (
                  <div className="px-4 pb-3 pt-0 border-t border-gold/10">
                    <p className="text-xs font-body text-dark-ink leading-relaxed">{feat.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Class features */}
      {groups.length > 0 && (
        <>
          {(raceTraits.length > 0 || bgFeature || charFeats.length > 0) && <Divider label="Class Features" />}
          {groups.map(group => (
            group.features.map(({ name, feature }) => {
              const key    = `${group.source}-${name}`;
              const isOpen = open.has(key);
              const desc   = feature.descriptionFull ?? feature.description ?? '';

              // Resource tracker
              const featureKey = `${group.classKey}|${name}`;
              const maxUses    = resolveMaxUses(feature.usages, group.classLevel);
              const remaining  = maxUses != null
                ? (char.featureUses?.[featureKey] ?? maxUses)
                : null;

              return (
                <div key={key} className="surface-parchment rounded border border-gold/20">
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left"
                  >
                    <span className="text-xs font-display text-gold font-bold w-6 flex-shrink-0 text-center">
                      {group.level}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm text-dark-ink">{name}</div>
                      <div className="text-[10px] font-display text-stone uppercase tracking-wider">
                        {group.source}
                      </div>
                    </div>
                    {feature.usages != null && (
                      <div className="flex-shrink-0 text-right mr-1">
                        {maxUses != null ? (
                          <span className="text-[10px] font-display text-stone uppercase tracking-wider">
                            {remaining}/{maxUses} · {recoveryLabel(feature.recovery as string | undefined)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-display text-stone uppercase tracking-wider">
                            {String(feature.usages)}× · {recoveryLabel(feature.recovery as string | undefined)}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-stone text-xs ml-auto flex-shrink-0">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Resource tracker dots */}
                  {maxUses != null && remaining != null && (
                    <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
                      {Array.from({ length: maxUses }).map((_, i) => {
                        const isUsed = i >= remaining;
                        return (
                          <button
                            key={i}
                            onClick={() => isUsed
                              ? restoreCharge(featureKey, maxUses)
                              : useCharge(featureKey, maxUses)
                            }
                            title={isUsed ? 'Expended (click to restore)' : 'Available (click to use)'}
                            className={`
                              w-4 h-4 rounded-full border-2 transition-colors flex-shrink-0
                              ${isUsed
                                ? 'bg-stone/30 border-stone/30'
                                : 'bg-gold/20 border-gold hover:bg-gold/40'}
                            `}
                          />
                        );
                      })}
                      <span className="text-[9px] text-stone font-display ml-1 uppercase tracking-wider">
                        {recoveryLabel(feature.recovery as string | undefined)}
                      </span>
                    </div>
                  )}

                  {isOpen && desc && (
                    <div className="px-4 pb-3 pt-0 border-t border-gold/10">
                      <p className="text-xs font-body text-dark-ink leading-relaxed whitespace-pre-wrap">
                        {desc}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </>
      )}

      {groups.length === 0 && raceTraits.length === 0 && !bgFeature && charFeats.length === 0 && (
        <div className="text-center py-8 text-stone font-display uppercase tracking-wider text-xs">
          No features available
        </div>
      )}
    </div>
  );
}
