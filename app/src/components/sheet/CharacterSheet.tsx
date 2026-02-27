import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character, Condition } from '../../types/character';
import type { DndArmor, DndClass, DndSubclass, DndRace, DndRaceVariant, DndBackground, DndSpell, DndFeat, DndWeapon, DndMagicItem } from '../../types/data';
import { ALL_CONDITIONS } from '../../types/character';
import { computeDerivedStats, resolveMaxUses, abilityMod } from '../../services/character.calculator';
import { characterRepository } from '../../services/character.repository';
import { useCharacterEngine } from '../../services/useCharacterEngine';
import { StatsPanel }     from './panels/StatsPanel';
import { FeaturesPanel }  from './panels/FeaturesPanel';
import { SpellsPanel }    from './panels/SpellsPanel';
import { EquipmentPanel } from './panels/EquipmentPanel';
import { AttacksPanel }   from './panels/AttacksPanel';
import { NotesPanel }     from './panels/NotesPanel';
import { LevelUpWizard }  from './LevelUpWizard';
import { Button }         from '../ui/Button';
import { DicePanel }      from '../dice';
import DataService from '../../services/data.service';

type SheetTab = 'features' | 'attacks' | 'spells' | 'equipment' | 'notes';

const TABS: { id: SheetTab; label: string }[] = [
  { id: 'features',  label: 'Features'  },
  { id: 'attacks',   label: 'Attacks'   },
  { id: 'spells',    label: 'Spells'    },
  { id: 'equipment', label: 'Equipment' },
  { id: 'notes',     label: 'Notes'     },
];

// XP thresholds: XP needed to reach each level (index = level - 1)
const XP_THRESHOLDS = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];

function xpToLevel(xp: number): number {
  let lvl = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) lvl = i + 1; else break;
  }
  return Math.min(lvl, 20);
}

const HIT_DICE: Record<string, number> = {
  barbarian: 12, fighter: 10, paladin: 10, ranger: 10,
  bard: 8, cleric: 8, druid: 8, monk: 8, rogue: 8, warlock: 8,
  artificer: 8, sorcerer: 6, wizard: 6,
};

/** Roll one hit die for a class (d[hd] + CON mod, min 1) */
function rollHd(hd: number, conMod: number): number {
  return Math.max(1, Math.floor(Math.random() * hd) + 1 + conMod);
}

// Exhaustion level descriptions
const EXHAUSTION_EFFECTS = [
  'None',
  'Disadvantage on ability checks',
  'Speed halved',
  'Disadvantage on attacks & saves',
  'Hit point maximum halved',
  'Speed = 0',
  'Death',
];

interface Props {
  character: Character;
}

export function CharacterSheet({ character: initial }: Props) {
  const navigate = useNavigate();
  const [char, setChar]           = useState<Character>(initial);
  const [tab, setTab]             = useState<SheetTab>('features');
  const [showLevelUp, setLevelUp] = useState(false);
  const [raceName, setRaceName]   = useState('');
  const [className, setClassName] = useState('');
  const [hpInput, setHpInput]         = useState<string | null>(null);
  const [tempHpInput, setTempHpInput] = useState<string | null>(null);
  const [xpInput, setXpInput]         = useState<string | null>(null);
  const [showConditions, setShowConditions] = useState(false);
  const [showHitDice, setShowHitDice]       = useState(false);

  // Pre-loaded data for accurate derived stat computation
  const [allArmor, setAllArmor]     = useState<DndArmor[]>([]);
  const [allClasses, setAllClasses] = useState<DndClass[]>([]);

  // Full data bundle for the character engine
  const [dataBundle, setDataBundle] = useState<{
    classes: DndClass[];
    subclasses: DndSubclass[];
    races: DndRace[];
    raceVariants: DndRaceVariant[];
    backgrounds: DndBackground[];
    spells: DndSpell[];
    feats: DndFeat[];
    weapons: DndWeapon[];
    armor: DndArmor[];
    magicItems: DndMagicItem[];
  } | null>(null);

  // Dice roller state
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [diceExpression, _setDiceExpression] = useState('1d20');
  void _setDiceExpression; // Will be used when attacks trigger rolls
  const [diceLabel, setDiceLabel] = useState<string | undefined>();

  useEffect(() => {
    // Load basic data for backward compatibility
    DataService.getArmor().then(setAllArmor);
    DataService.getClasses().then(setAllClasses);
    
    // Load full data bundle for engine
    DataService.getEngineDataBundle().then(setDataBundle);
  }, []);

  // Use the character engine for advanced calculations
  const { 
    engine, 
    isReady: engineReady,
    warnings: engineWarnings,
    activeFeatures: engineFeatures,
    resources: engineResources,
    actions: engineActions,
    calculateAttack: engineCalculateAttack,
    calculateHp,
    calculateAc,
    getSpellStats: engineGetSpellStats,
    shortRest: engineShortRest,
    longRest: engineLongRest,
  } = useCharacterEngine(char, dataBundle);

  // Extract skill advantage set from engine proficiency tracker
  const skillAdvantages = useMemo<Set<string>>(() => {
    if (!engine) return new Set();
    const adv = new Set<string>();
    for (const key of engine.proficiencies.advantages.keys()) {
      adv.add(key.toLowerCase());
    }
    return adv;
  }, [engine]);

  // Use engine-computed values when available, fall back to legacy computation
  const derived = useMemo(() => {
    const legacy = computeDerivedStats(
      char,
      allArmor.length ? allArmor : undefined,
      allClasses.length ? allClasses : undefined,
      skillAdvantages.size > 0 ? skillAdvantages : undefined,
    );
    
    // If engine is ready, enhance with engine-computed values
    if (engineReady && engine && calculateHp && calculateAc) {
      const hpResult = calculateHp();
      const acResult = calculateAc(
        allArmor.find(a => a._key === char.equippedArmorKey) ?? null,
        !!char.hasShield
      );
      
      return {
        ...legacy,
        maxHp: hpResult.totalHp,
        ac: acResult.ac,
      };
    }
    
    return legacy;
  }, [char, allArmor, allClasses, engineReady, engine, calculateHp, calculateAc, skillAdvantages]);

  // Load display names
  useEffect(() => {
    DataService.getRaces().then(all => {
      const r = all.find(x => x._key === char.race);
      setRaceName(r?.name ?? char.race);
    });
    DataService.getClasses().then(all => {
      const parts = char.classes.map(cc => {
        const c = all.find(x => x._key === cc.classKey);
        return `${c?.name ?? cc.classKey} ${cc.level}`;
      });
      setClassName(parts.join(' / '));
    });
  }, [char.race, char.classes]);

  // Persist whenever char changes (debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      characterRepository.save({ ...char, updatedAt: new Date().toISOString() });
    }, 800);
    return () => clearTimeout(t);
  }, [char]);

  function updateChar(updates: Partial<Character>) {
    setChar(prev => ({ ...prev, ...updates }));
  }

  function adjustHp(delta: number) {
    setChar(prev => {
      const currentHp = prev.currentHp ?? derived.maxHp;
      const tempHp = prev.tempHp ?? 0;

      if (delta < 0) {
        // Damage: temp HP absorbs first (PHB p.198)
        const damage = Math.abs(delta);
        const tempAbsorbed = Math.min(tempHp, damage);
        const remainingDamage = damage - tempAbsorbed;
        return {
          ...prev,
          tempHp: tempHp - tempAbsorbed,
          currentHp: Math.max(0, currentHp - remainingDamage),
        };
      }
      // Healing: only affects real HP
      return {
        ...prev,
        currentHp: Math.min(derived.maxHp, currentHp + delta),
      };
    });
  }

  function commitHpInput() {
    if (hpInput === null) return;
    const val = parseInt(hpInput);
    if (!isNaN(val)) {
      setChar(prev => ({
        ...prev,
        currentHp: Math.min(derived.maxHp, Math.max(0, val)),
      }));
    }
    setHpInput(null);
  }

  function commitTempHpInput() {
    if (tempHpInput === null) return;
    const val = parseInt(tempHpInput);
    if (!isNaN(val)) updateChar({ tempHp: Math.max(0, val) });
    setTempHpInput(null);
  }

  function commitXpInput() {
    if (xpInput === null) return;
    const val = parseInt(xpInput);
    if (!isNaN(val)) updateChar({ xp: Math.max(0, val) });
    setXpInput(null);
  }

  function toggleDeathSave(type: 'success' | 'failure', idx: number) {
    setChar(prev => {
      const key = type === 'success' ? 'deathSaveSuccesses' : 'deathSaveFailures';
      const current = (prev[key] as number | undefined) ?? 0;
      return { ...prev, [key]: current > idx ? idx : idx + 1 };
    });
  }

  function toggleCondition(condition: Condition) {
    const current = char.conditions ?? [];
    const next = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition];
    updateChar({ conditions: next });
  }

  function setExhaustion(level: number) {
    updateChar({ exhaustion: Math.max(0, Math.min(6, level)) });
  }

  /** Spend one hit die for a class (by index in char.classes), heal HP */
  function spendHitDie(classIdx: number) {
    const cc = char.classes[classIdx];
    if (!cc) return;
    const used = (char.hitDiceUsed ?? [])[classIdx] ?? 0;
    if (used >= cc.level) return; // all spent
    const hd = HIT_DICE[cc.classKey] ?? 8;
    const conMod = abilityMod(char.abilityScores[2]);
    const healed = rollHd(hd, conMod);
    const newUsed = [...(char.hitDiceUsed ?? char.classes.map(() => 0))];
    newUsed[classIdx] = used + 1;
    setChar(prev => ({
      ...prev,
      hitDiceUsed: newUsed,
      currentHp: Math.min(derived.maxHp, (prev.currentHp ?? derived.maxHp) + healed),
    }));
  }

  /** Short Rest: restore short-rest features and warlock pact magic slots */
  function doShortRest() {
    const updatedUses = { ...(char.featureUses ?? {}) };

    for (const cc of char.classes) {
      const cls = allClasses.find(c => c._key === cc.classKey);
      if (!cls) continue;
      for (const [, feat] of Object.entries(cls.features)) {
        const recovery = feat.recovery as string | string[] | undefined;
        const r = Array.isArray(recovery) ? recovery[0] : recovery;
        if (r !== 'short rest') continue;
        const maxUses = resolveMaxUses(feat.usages, cc.level);
        if (maxUses == null) continue;
        const featureKey = `${cc.classKey}|${feat.name}`;
        updatedUses[featureKey] = maxUses;
      }
    }

    // Warlock pact magic slots reset on short rest
    // Only restore pact slot count, not all slots at that level (multiclass safety)
    const warlockEntry = char.classes.find(cc => cc.classKey === 'warlock');
    let updatedSlotsUsed = char.slotsUsed ? [...char.slotsUsed] : Array(10).fill(0);
    if (warlockEntry && warlockEntry.level > 0) {
      const PACT_LEVELS = [1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5];
      const PACT_SLOTS  = [1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4];
      const pactLevel = PACT_LEVELS[Math.min(warlockEntry.level, 20) - 1];
      const pactCount = PACT_SLOTS[Math.min(warlockEntry.level, 20) - 1];
      // Reduce usage at pact level by pact slot count (don't go below 0)
      updatedSlotsUsed[pactLevel] = Math.max(0, updatedSlotsUsed[pactLevel] - pactCount);
    }

    // Also notify engine so its internal resource tracker stays in sync
    engineShortRest();

    setChar(prev => ({ ...prev, featureUses: updatedUses, slotsUsed: updatedSlotsUsed }));
  }

  /** Long Rest: restore all features and all spell slots; reduce exhaustion by 1 */
  function doLongRest() {
    const updatedUses: Record<string, number> = {};
    for (const cc of char.classes) {
      const cls = allClasses.find(c => c._key === cc.classKey);
      if (!cls) continue;
      for (const [, feat] of Object.entries(cls.features)) {
        const maxUses = resolveMaxUses(feat.usages, cc.level);
        if (maxUses == null) continue;
        updatedUses[`${cc.classKey}|${feat.name}`] = maxUses;
      }
    }

    // Long rest restores up to half total HD (rounded up) per class
    const restoredHd = (char.hitDiceUsed ?? []).map((used, idx) => {
      const cc = char.classes[idx];
      if (!cc) return 0;
      const restore = Math.max(1, Math.ceil(cc.level / 2));
      return Math.max(0, used - restore);
    });

    // Also notify engine so its internal resource tracker stays in sync
    engineLongRest();

    setChar(prev => ({
      ...prev,
      featureUses: updatedUses,
      slotsUsed: Array(10).fill(0),
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      exhaustion: Math.max(0, (prev.exhaustion ?? 0) - 1),
      currentHp: derived.maxHp,
      hitDiceUsed: restoredHd,
    }));
  }

  const currentHp = char.currentHp ?? derived.maxHp;
  const tempHp    = char.tempHp ?? 0;
  const xp        = char.xp ?? 0;
  const hpPercent = derived.maxHp > 0 ? (currentHp / derived.maxHp) * 100 : 0;

  const xpLevel   = xpToLevel(xp);
  const nextXp    = xpLevel < 20 ? XP_THRESHOLDS[xpLevel] : null;
  const prevXp    = XP_THRESHOLDS[xpLevel - 1] ?? 0;
  const xpPercent = nextXp != null
    ? Math.min(100, ((xp - prevXp) / (nextXp - prevXp)) * 100)
    : 100;

  const deathSaveSuccesses = char.deathSaveSuccesses ?? 0;
  const deathSaveFailures  = char.deathSaveFailures  ?? 0;
  const isUnconscious      = currentHp === 0;
  const exhaustion         = char.exhaustion ?? 0;
  const activeConditions   = char.conditions ?? [];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="
        bg-gradient-to-b from-leather to-leather/80
        border-b-2 border-gold/30 shadow-[0_2px_8px_rgba(0,0,0,0.4)]
        px-4 py-3
      ">
        <div className="max-w-5xl mx-auto space-y-2">
          {/* Top row: name + buttons */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-display-md text-gold text-shadow truncate">
                {char.name}
              </h1>
              <div className="flex flex-wrap gap-2 items-center mt-0.5">
                <span className="text-xs font-body text-stone">{raceName}</span>
                <span className="text-stone/40 text-xs">·</span>
                <span className="text-xs font-body text-stone">{className}</span>
                {char.details.alignment && (
                  <>
                    <span className="text-stone/40 text-xs">·</span>
                    <span className="text-xs font-body text-stone/70 italic">{char.details.alignment}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
              <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
                ← Roster
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowDiceRoller(true)} title="Dice Roller">
                🎲 Roll
              </Button>
              <Button variant="secondary" size="sm" onClick={doShortRest} title="Short Rest">
                ☽ Short Rest
              </Button>
              <Button variant="secondary" size="sm" onClick={doLongRest} title="Long Rest">
                ★ Long Rest
              </Button>
              <Button variant="primary" size="sm" onClick={() => setLevelUp(true)}>
                ▲ Level Up
              </Button>
            </div>
          </div>

          {/* Concentration banner */}
          {char.concentratingOn && (
            <div className="flex items-center gap-3 bg-crimson/10 border border-crimson/30 rounded px-3 py-1.5">
              <span className="text-[9px] font-display uppercase tracking-wider text-crimson flex-shrink-0">
                Concentrating
              </span>
              <span className="text-xs font-body text-dark-ink flex-1 italic">{char.concentratingOn}</span>
              <button
                onClick={() => updateChar({ concentratingOn: undefined })}
                className="text-[9px] font-display uppercase tracking-wider text-stone hover:text-crimson transition-colors"
              >
                End ✕
              </button>
            </div>
          )}

          {/* Stat bar */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* HP tracker */}
            <div className="flex items-center gap-2 bg-shadow/30 rounded px-3 py-1.5 border border-crimson/30">
              <div>
                <div className="text-[9px] font-display uppercase tracking-wider text-stone">HP</div>
                <div className="flex items-center gap-1">
                  {hpInput !== null ? (
                    <input
                      autoFocus
                      type="number"
                      value={hpInput}
                      onChange={e => setHpInput(e.target.value)}
                      onBlur={commitHpInput}
                      onKeyDown={e => { if (e.key === 'Enter') commitHpInput(); if (e.key === 'Escape') setHpInput(null); }}
                      className="w-12 text-center font-display text-crimson-light text-lg bg-transparent border-b border-crimson focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => setHpInput(String(currentHp))}
                      className="font-display text-crimson-light text-lg leading-none hover:text-crimson transition-colors"
                    >
                      {currentHp}
                    </button>
                  )}
                  <span className="text-stone text-xs font-display">/ {derived.maxHp}</span>
                </div>
                <div className="w-16 h-1 bg-shadow/40 rounded-full mt-0.5">
                  <div
                    className="h-1 rounded-full bg-crimson transition-all duration-300"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => adjustHp(+1)} className="text-[10px] text-stone hover:text-gold leading-none px-1">▲</button>
                <button onClick={() => adjustHp(-1)} className="text-[10px] text-stone hover:text-crimson leading-none px-1">▼</button>
              </div>
            </div>

            {/* Temp HP */}
            <div className="bg-shadow/20 border border-gold/20 rounded px-2 py-1 text-center min-w-[3rem]">
              <div className="text-[8px] font-display uppercase tracking-wider text-stone">Temp HP</div>
              {tempHpInput !== null ? (
                <input
                  autoFocus
                  type="number"
                  value={tempHpInput}
                  onChange={e => setTempHpInput(e.target.value)}
                  onBlur={commitTempHpInput}
                  onKeyDown={e => { if (e.key === 'Enter') commitTempHpInput(); if (e.key === 'Escape') setTempHpInput(null); }}
                  className="w-10 text-center font-display text-gold text-sm bg-transparent border-b border-gold focus:outline-none"
                />
              ) : (
                <button
                  onClick={() => setTempHpInput(String(tempHp))}
                  className={`font-display text-sm leading-none transition-colors block w-full text-center
                    ${tempHp > 0 ? 'text-gold hover:text-gold/70' : 'text-stone/50 hover:text-gold/60'}`}
                >
                  {tempHp > 0 ? tempHp : '—'}
                </button>
              )}
            </div>

            <StatChip label="AC"   value={String(derived.ac)} />
            <StatChip label="Init" value={(derived.initiative >= 0 ? '+' : '') + derived.initiative} />
            <StatChip label="Spd"  value={`${derived.speed} ft`} />
            <StatChip label="Prof" value={'+' + derived.proficiencyBonus} />

            {/* Inspiration */}
            <button
              onClick={() => updateChar({ inspiration: !char.inspiration })}
              title={char.inspiration ? 'Inspiration active (click to remove)' : 'No inspiration (click to gain)'}
              className={`
                px-2 py-1 rounded border transition-colors text-center min-w-[3.5rem]
                ${char.inspiration
                  ? 'border-gold bg-gold/20 text-gold'
                  : 'border-gold/20 bg-shadow/20 text-stone/40 hover:border-gold/40 hover:text-stone/70'}
              `}
            >
              <div className="text-[8px] font-display uppercase tracking-wider">Inspr</div>
              <div className="font-display text-sm leading-none">{char.inspiration ? '★' : '☆'}</div>
            </button>

            {/* XP tracker */}
            <div className="bg-shadow/20 border border-gold/20 rounded px-2 py-1 text-center min-w-[4rem]">
              <div className="text-[8px] font-display uppercase tracking-wider text-stone">XP</div>
              {xpInput !== null ? (
                <input
                  autoFocus
                  type="number"
                  value={xpInput}
                  onChange={e => setXpInput(e.target.value)}
                  onBlur={commitXpInput}
                  onKeyDown={e => { if (e.key === 'Enter') commitXpInput(); if (e.key === 'Escape') setXpInput(null); }}
                  className="w-16 text-center font-display text-gold text-sm bg-transparent border-b border-gold focus:outline-none"
                />
              ) : (
                <button
                  onClick={() => setXpInput(String(xp))}
                  className="font-display text-gold text-sm leading-none hover:text-gold/70 transition-colors block w-full text-center"
                >
                  {xp.toLocaleString()}
                </button>
              )}
              {nextXp != null && (
                <div className="w-full h-0.5 bg-shadow/40 rounded-full mt-0.5">
                  <div className="h-0.5 rounded-full bg-gold transition-all duration-300" style={{ width: `${xpPercent}%` }} />
                </div>
              )}
            </div>

            {char.details.age && <StatChip label="Age" value={char.details.age} />}

            {/* Hit Dice */}
            {(() => {
              const totalUsed = (char.hitDiceUsed ?? []).reduce((s, v) => s + v, 0);
              const totalDice = char.classes.reduce((s, cc) => s + cc.level, 0);
              const remaining = totalDice - totalUsed;
              return (
                <button
                  onClick={() => setShowHitDice(v => !v)}
                  title="Hit Dice pool"
                  className={`
                    px-2 py-1 rounded border transition-colors text-center min-w-[3.5rem]
                    ${showHitDice
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-gold/20 bg-shadow/20 text-stone/70 hover:border-gold/40 hover:text-stone'}
                  `}
                >
                  <div className="text-[8px] font-display uppercase tracking-wider">HD</div>
                  <div className="font-display text-sm leading-none">{remaining}/{totalDice}</div>
                </button>
              );
            })()}

            {/* Status (Conditions & Exhaustion) button */}
            <button
              onClick={() => setShowConditions(v => !v)}
              title="Conditions & Exhaustion"
              className={`
                px-2 py-1 rounded border transition-colors text-center min-w-[3.5rem]
                ${(exhaustion > 0 || activeConditions.length > 0)
                  ? 'border-crimson/60 bg-crimson/10 text-crimson'
                  : 'border-gold/20 bg-shadow/20 text-stone/40 hover:border-gold/40 hover:text-stone/70'}
              `}
            >
              <div className="text-[8px] font-display uppercase tracking-wider">Status</div>
              <div className="font-display text-xs leading-none">
                {exhaustion > 0
                  ? `Exh ${exhaustion}`
                  : activeConditions.length > 0
                    ? `${activeConditions.length} cond.`
                    : '—'}
              </div>
            </button>
          </div>

          {/* Conditions & Exhaustion panel */}
          {showConditions && (
            <div className="bg-shadow/30 border border-gold/20 rounded p-3 space-y-3">
              {/* Exhaustion */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-display uppercase tracking-wider text-stone">Exhaustion</span>
                  {exhaustion > 0 && (
                    <span className="text-[9px] text-crimson font-body italic">{EXHAUSTION_EFFECTS[exhaustion]}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[0,1,2,3,4,5,6].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setExhaustion(lvl)}
                      title={EXHAUSTION_EFFECTS[lvl]}
                      className={`
                        w-7 h-7 rounded border text-xs font-display transition-colors
                        ${exhaustion === lvl
                          ? lvl === 0 ? 'bg-gold/30 border-gold text-gold' : 'bg-crimson/30 border-crimson text-crimson'
                          : 'border-stone/30 text-stone/50 hover:border-gold/40'}
                      `}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <div className="text-[9px] font-display uppercase tracking-wider text-stone mb-2">Conditions</div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CONDITIONS.map(condition => {
                    const active = activeConditions.includes(condition);
                    return (
                      <button
                        key={condition}
                        onClick={() => toggleCondition(condition)}
                        className={`
                          px-2 py-0.5 rounded text-[10px] font-display border transition-colors
                          ${active
                            ? 'bg-crimson/20 border-crimson text-crimson'
                            : 'border-stone/30 text-stone/60 hover:border-gold/40 hover:text-stone'}
                        `}
                      >
                        {condition}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Hit Dice panel */}
          {showHitDice && (
            <div className="bg-shadow/30 border border-gold/20 rounded p-3 space-y-2">
              <div className="text-[9px] font-display uppercase tracking-wider text-stone mb-1">
                Hit Dice — click to spend (heals 1 die + CON mod)
              </div>
              {char.classes.map((cc, idx) => {
                const hd    = HIT_DICE[cc.classKey] ?? 8;
                const used  = (char.hitDiceUsed ?? [])[idx] ?? 0;
                const avail = cc.level - used;
                return (
                  <div key={cc.classKey + idx} className="flex items-center gap-3">
                    <span className="text-xs font-display text-stone w-24 truncate capitalize">{cc.classKey}</span>
                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: cc.level }).map((_, i) => {
                        const isSpent = i >= avail;
                        return (
                          <button
                            key={i}
                            onClick={() => !isSpent && spendHitDie(idx)}
                            disabled={isSpent}
                            title={isSpent ? 'Spent' : `Spend d${hd} (roll 1d${hd} + CON mod)`}
                            className={`
                              w-5 h-5 rounded border text-[8px] font-display transition-colors flex-shrink-0
                              ${isSpent
                                ? 'bg-stone/20 border-stone/30 text-stone/30'
                                : 'bg-gold/20 border-gold text-gold hover:bg-gold/40 cursor-pointer'}
                            `}
                          >
                            {!isSpent ? `d${hd}` : '—'}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[9px] text-stone font-display ml-auto">{avail}/{cc.level}</span>
                  </div>
                );
              })}
              <div className="text-[9px] text-stone/60 font-display italic">
                Long rest restores up to half your hit dice.
              </div>
            </div>
          )}

          {/* Active conditions strip (when panel is closed) */}
          {!showConditions && activeConditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {activeConditions.map(c => (
                <span
                  key={c}
                  onClick={() => toggleCondition(c)}
                  className="px-2 py-0.5 rounded text-[9px] font-display border border-crimson/50 bg-crimson/10 text-crimson cursor-pointer hover:bg-crimson/20 transition-colors"
                  title="Click to remove"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Death saves (shown when unconscious / HP = 0) */}
          {isUnconscious && (
            <div className="flex items-center gap-4 bg-shadow/40 rounded px-3 py-2 border border-crimson/40">
              <span className="text-[9px] font-display uppercase tracking-wider text-crimson">Death Saves</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-display text-stone uppercase tracking-wider mr-1">Success</span>
                {[0,1,2].map(i => (
                  <button
                    key={i}
                    onClick={() => toggleDeathSave('success', i)}
                    className={`w-4 h-4 rounded-full border-2 transition-colors
                      ${i < deathSaveSuccesses ? 'bg-gold border-gold' : 'border-stone/40 bg-transparent hover:border-gold/60'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-display text-stone uppercase tracking-wider mr-1">Failure</span>
                {[0,1,2].map(i => (
                  <button
                    key={i}
                    onClick={() => toggleDeathSave('failure', i)}
                    className={`w-4 h-4 rounded-full border-2 transition-colors
                      ${i < deathSaveFailures ? 'bg-crimson border-crimson' : 'border-stone/40 bg-transparent hover:border-crimson/60'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engine warnings */}
      {engineWarnings.length > 0 && (
        <div className="max-w-5xl mx-auto w-full px-4 pt-2">
          <div className="bg-crimson/10 border border-crimson/30 rounded px-3 py-2 text-xs font-body text-crimson space-y-0.5">
            {engineWarnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
          </div>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4">
        <div className="flex gap-4 h-full">
          {/* Left: stats column */}
          <aside className="w-52 flex-shrink-0 space-y-2 overflow-y-auto pr-1">
            <StatsPanel char={char} derived={derived} />
          </aside>

          {/* Right: tabbed panels */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tab bar */}
            <div className="flex border-b border-gold/20 mb-4 overflow-x-auto">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`
                    px-3 py-2 text-xs font-display uppercase tracking-wider transition-colors border-b-2 -mb-px whitespace-nowrap
                    ${tab === t.id
                      ? 'border-gold text-gold'
                      : 'border-transparent text-stone hover:text-gold/70'}
                  `}
                >
                  {t.label}
                  {t.id === 'spells' && char.concentratingOn && (
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-crimson inline-block align-middle" />
                  )}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto animate-fade-in">
              {tab === 'features'  && <FeaturesPanel char={char} onUpdate={updateChar} engineResources={engineResources} engineFeatures={engineFeatures} engineActions={engineActions} />}
              {tab === 'attacks'   && <AttacksPanel char={char} derived={derived} onUpdate={updateChar} engineCalculateAttack={engineCalculateAttack} />}
              {tab === 'spells'    && <SpellsPanel char={char} derived={derived} onUpdate={updateChar} engineGetSpellStats={engineGetSpellStats} />}
              {tab === 'equipment' && <EquipmentPanel char={char} derived={derived} onUpdate={updateChar} />}
              {tab === 'notes'     && <NotesPanel char={char} onUpdate={updateChar} />}
            </div>
          </div>
        </div>
      </div>

      {/* Level-up modal */}
      {showLevelUp && (
        <LevelUpWizard
          char={char}
          onComplete={updated => { setChar(updated); setLevelUp(false); }}
          onCancel={() => setLevelUp(false)}
        />
      )}

      {/* Dice Roller modal */}
      <DicePanel
        isOpen={showDiceRoller}
        onClose={() => {
          setShowDiceRoller(false);
          setDiceLabel(undefined);
        }}
        initialExpression={diceExpression}
        label={diceLabel}
      />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center bg-shadow/20 border border-gold/20 rounded px-2 py-1">
      <div className="text-[8px] font-display uppercase tracking-wider text-stone">{label}</div>
      <div className="font-display text-gold text-sm leading-none">{value}</div>
    </div>
  );
}
