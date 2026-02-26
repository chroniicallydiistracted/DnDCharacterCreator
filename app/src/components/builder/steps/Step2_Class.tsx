import { useEffect, useState } from 'react';
import type { DndClass, DndSubclass } from '../../../types/data';
import DataService, { formatSource } from '../../../services/data.service';
import { useCharacterStore } from '../../../store/character.store';
import { SUBCLASS_LEVEL, isAsiLevel, profBonus, FIGHTING_STYLE_CLASSES, FIGHTING_STYLE_LEVEL } from '../../../services/character.calculator';
import { EntityBrowser } from '../shared/EntityBrowser';
import { EntityCard }    from '../shared/EntityCard';
import { Divider }       from '../../ui/Divider';
import { Badge }         from '../../ui/Badge';

const CLASS_ICONS: Record<string, string> = {
  barbarian:'🪓', bard:'🎵', cleric:'⛪', druid:'🌿', fighter:'🛡️',
  monk:'👊', paladin:'✝️', ranger:'🏹', rogue:'🗡️', sorcerer:'🔮',
  warlock:'👁️', wizard:'📚', artificer:'⚙️', psion:'🧠', mystic:'🔭',
};

function ArmorProf({ profs }: { profs: boolean[] }) {
  const labels = ['Light','Medium','Heavy','Shields'];
  return (
    <div className="flex gap-1 flex-wrap">
      {labels.map((l, i) => profs[i] && (
        <Badge key={l} color="stone">{l}</Badge>
      ))}
    </div>
  );
}

function ClassDetail({ cls }: { cls: DndClass }) {
  const level1Features = Object.values(cls.features ?? {})
    .filter(f => f.minlevel === 1)
    .slice(0, 6);

  const subclassLevel = SUBCLASS_LEVEL[cls._key] ?? SUBCLASS_LEVEL.default;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-display-md text-dark-ink">{cls.name}</h3>
        <div className="text-[10px] font-display uppercase tracking-wider text-stone">{formatSource(cls.source)}</div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <div className="text-[9px] font-display uppercase tracking-wider text-stone mb-1">Hit Die</div>
          <Badge color="crimson">d{cls.die}</Badge>
        </div>
        <div>
          <div className="text-[9px] font-display uppercase tracking-wider text-stone mb-1">Primary</div>
          <div className="font-body text-dark-ink">{cls.primaryAbility?.join(' / ')}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[9px] font-display uppercase tracking-wider text-stone mb-1">Saving Throws</div>
          <div className="font-body text-dark-ink">{cls.saves?.join(', ')}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[9px] font-display uppercase tracking-wider text-stone mb-1">Armor</div>
          <ArmorProf profs={cls.armorProfs?.primary ?? []} />
        </div>
        <div className="col-span-2">
          <div className="text-[9px] font-display uppercase tracking-wider text-stone mb-1">Skills</div>
          <div className="font-body text-dark-ink text-[11px]">{cls.skillstxt?.primary}</div>
        </div>
      </div>

      {level1Features.length > 0 && (
        <>
          <Divider label="Level 1 Features" />
          <ul className="space-y-1.5">
            {level1Features.map(f => (
              <li key={f.name} className="flex gap-2">
                <span className="text-gold mt-0.5">◆</span>
                <div>
                  <div className="text-xs font-display font-semibold text-dark-ink">{f.name}</div>
                  {f.description && (
                    <div className="text-[11px] font-body text-stone leading-snug line-clamp-2">{f.description}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {cls.subclasses && (
        <>
          <Divider />
          <div className="text-xs text-stone font-body">
            <strong className="font-display text-dark-ink">{cls.subclasses[0]}:</strong>{' '}
            choose at level {subclassLevel}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Level picker ─────────────────────────────────────────────────────────────
function LevelPicker({
  classKey,
  level,
  onChange,
}: {
  classKey: string;
  level: number;
  onChange: (lvl: number) => void;
}) {
  const levels = Array.from({ length: 20 }, (_, i) => i + 1);

  // Count ASI opportunities up to each level
  function asiCount(upTo: number): number {
    let count = 0;
    for (let lvl = 2; lvl <= upTo; lvl++) {
      if (isAsiLevel(classKey, lvl)) count++;
    }
    return count;
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">
          Starting Level
        </div>
        <div className="grid grid-cols-10 gap-1">
          {levels.map(lvl => {
            const isSelected = lvl === level;
            const isAsi = lvl > 1 && isAsiLevel(classKey, lvl);
            return (
              <button
                key={lvl}
                onClick={() => onChange(lvl)}
                title={`Level ${lvl}${isAsi ? ' — ASI' : ''}`}
                className={`
                  relative h-8 rounded border text-xs font-display transition-colors
                  ${isSelected
                    ? 'bg-gold/30 border-gold text-gold font-bold'
                    : 'border-gold/20 text-stone hover:border-gold/50 hover:text-dark-ink'}
                `}
              >
                {lvl}
                {isAsi && (
                  <span className="absolute -top-1 -right-0.5 text-[6px] text-gold leading-none">★</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2 text-[10px] font-display text-stone uppercase tracking-wider">
          <span>Proficiency: +{profBonus(level)}</span>
          {asiCount(level) > 0 && (
            <span className="text-gold">★ {asiCount(level)} ASI{asiCount(level) > 1 ? 's' : ''} earned</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Subclass picker ──────────────────────────────────────────────────────────
function SubclassPicker({
  classKey,
  selected,
  onChange,
}: {
  classKey: string;
  selected: string | null;
  onChange: (key: string | null) => void;
}) {
  const [subs, setSubs] = useState<DndSubclass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getSubclasses()
      .then(all => setSubs(all.filter(s => s._parentClass === classKey)))
      .finally(() => setLoading(false));
  }, [classKey]);

  if (loading) return <div className="text-xs text-stone font-body italic">Loading subclasses…</div>;
  if (subs.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-display uppercase tracking-wider text-stone">
        Subclass — choose one
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {subs.map(sub => (
          <button
            key={sub._key}
            onClick={() => onChange(selected === sub._key ? null : sub._key)}
            className={`
              text-left px-3 py-2 rounded border text-xs font-body transition-colors
              ${selected === sub._key
                ? 'bg-gold/20 border-gold text-dark-ink'
                : 'border-gold/20 text-stone hover:border-gold/40 hover:text-dark-ink'}
            `}
          >
            <div className="font-display text-sm">{sub.subname}</div>
            {sub.source && (
              <div className="text-[10px] font-display text-stone/70 uppercase tracking-wider mt-0.5">
                {formatSource(sub.source)}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Fighting Style picker ────────────────────────────────────────────────────
const FIGHTING_STYLES: Record<string, string[]> = {
  fighter: [
    'Archery', 'Blind Fighting', 'Defense', 'Dueling',
    'Great Weapon Fighting', 'Interception', 'Protection',
    'Superior Technique', 'Thrown Weapon Fighting', 'Two-Weapon Fighting', 'Unarmed Fighting',
  ],
  paladin: [
    'Blessed Warrior', 'Blind Fighting', 'Defense', 'Dueling',
    'Great Weapon Fighting', 'Interception', 'Protection',
  ],
  ranger: [
    'Archery', 'Blind Fighting', 'Defense', 'Druidic Warrior',
    'Dueling', 'Thrown Weapon Fighting', 'Two-Weapon Fighting',
  ],
};

function FightingStylePicker({
  classKey,
  selected,
  onChange,
}: {
  classKey: string;
  selected: string | null;
  onChange: (style: string | null) => void;
}) {
  const styles = FIGHTING_STYLES[classKey] ?? [];
  if (styles.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-display uppercase tracking-wider text-stone">
        Fighting Style — choose one
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {styles.map(style => (
          <button
            key={style}
            onClick={() => onChange(selected === style ? null : style)}
            className={`
              text-left px-3 py-2 rounded border text-xs font-body transition-colors
              ${selected === style
                ? 'bg-gold/20 border-gold text-dark-ink'
                : 'border-gold/20 text-stone hover:border-gold/40 hover:text-dark-ink'}
            `}
          >
            <div className="font-display text-sm">{style}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main step component ──────────────────────────────────────────────────────
export function Step2Class() {
  const [classes, setClasses] = useState<DndClass[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    draft,
    setClass,
    setStartingLevel,
    setStartingSubclass,
    setChosenFightingStyle,
  } = useCharacterStore();

  useEffect(() => {
    DataService.getClasses()
      .then(all => setClasses(
        all.filter(c => !['sidekick-expert-tcoe','sidekick-spellcaster-tcoe','sidekick-warrior-tcoe'].includes(c._key))
      ))
      .finally(() => setLoading(false));
  }, []);

  const classKey = draft.classKey;
  const subclassUnlockLevel = classKey ? (SUBCLASS_LEVEL[classKey] ?? SUBCLASS_LEVEL.default) : 99;
  const showSubclassPicker  = classKey !== null && draft.startingLevel >= subclassUnlockLevel;
  const fightingStyleLevel  = classKey ? (FIGHTING_STYLE_LEVEL[classKey] ?? 99) : 99;
  const showFightingStyle   = classKey !== null && FIGHTING_STYLE_CLASSES.includes(classKey) && draft.startingLevel >= fightingStyleLevel;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-display-lg text-gold text-shadow">Choose Your Class</h2>
        <p className="text-sm font-body text-stone mt-1">
          Your class defines how you fight, cast spells, and grow in power.
        </p>
      </div>

      <EntityBrowser<DndClass>
        context="class"
        items={classes}
        loading={loading}
        selectedKey={draft.classKey}
        onSelect={cls => setClass(cls._key)}
        getKey={c => c._key}
        getName={c => c.name}
        filterFn={(c, q) => c.name.toLowerCase().includes(q) ||
          c.skillstxt?.primary?.toLowerCase().includes(q) || false}
        placeholder="Search classes…"
        columns={3}
        renderCard={(cls, selected, onClick) => (
          <EntityCard
            name={cls.name}
            icon={CLASS_ICONS[cls._key]}
            source={cls.source}
            badges={[
              { label: `d${cls.die} HP`, color: 'crimson' },
              { label: cls.primaryAbility?.[0] ?? '', color: 'gold' },
            ]}
            selected={selected}
            onClick={onClick}
            preview={Object.values(cls.features ?? {})[0]?.description}
          />
        )}
        renderDetail={cls => <ClassDetail cls={cls} />}
      />

      {/* Level picker + subclass — shown after a class is selected */}
      {classKey && (
        <div className="surface-parchment rounded p-4 space-y-5">
          <LevelPicker
            classKey={classKey}
            level={draft.startingLevel}
            onChange={lvl => {
              setStartingLevel(lvl);
              // Reset subclass if level drops below unlock threshold
              if (lvl < (SUBCLASS_LEVEL[classKey] ?? SUBCLASS_LEVEL.default)) {
                setStartingSubclass(null);
              }
            }}
          />

          {showFightingStyle && (
            <>
              <Divider />
              <FightingStylePicker
                classKey={classKey}
                selected={draft.chosenFightingStyle}
                onChange={setChosenFightingStyle}
              />
            </>
          )}

          {showSubclassPicker && (
            <>
              <Divider />
              <SubclassPicker
                classKey={classKey}
                selected={draft.startingSubclassKey}
                onChange={setStartingSubclass}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
