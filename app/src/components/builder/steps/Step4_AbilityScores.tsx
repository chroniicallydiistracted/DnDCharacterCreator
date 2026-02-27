import { useState, useEffect, useMemo } from 'react';
import { useCharacterStore, resolveFinalScores } from '../../../store/character.store';
import { abilityMod, isAsiLevel, EXPERTISE_CLASSES } from '../../../services/character.calculator';
import { parseBackgroundAsi, parseSkillChoice } from '../../../services/skill.parser';
import type { BackgroundAsiOption } from '../../../services/skill.parser';
import { ABILITY_NAMES, ABILITY_ABBR, ALL_SKILLS, type AbilityScores, type Skill } from '../../../types/character';
import type { Character } from '../../../types/character';
import type { DndBackground, DndClass, DndFeat } from '../../../types/data';
import DataService from '../../../services/data.service';
import { evaluatePrereq } from '../../../services/prereq.evaluator';
import { Divider } from '../../ui/Divider';

const STANDARD_ARRAY: AbilityScores = [15, 14, 13, 12, 10, 8];
const POINT_BUY_COSTS: Record<number, number> = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
const POINT_BUY_BUDGET = 27;

function modStr(score: number) {
  const m = abilityMod(score);
  return m >= 0 ? `+${m}` : `${m}`;
}

// Standard Array: assign the 6 preset values to the 6 abilities
function StandardArrayPanel({ scores, setScores }: { scores: AbilityScores; setScores: (s: AbilityScores) => void }) {
  const [assignments, setAssignments] = useState<(number | null)[]>(() =>
    scores.map(s => STANDARD_ARRAY.includes(s) ? s : null)
  );

  const usedValues = assignments.filter((v): v is number => v !== null);

  function assign(abilityIdx: number, value: number | null) {
    const next = [...assignments];
    next.forEach((v, i) => { if (v === value && i !== abilityIdx) next[i] = null; });
    next[abilityIdx] = value;
    setAssignments(next);
    const newScores = next.map(v => v ?? 8) as AbilityScores;
    setScores(newScores);
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {ABILITY_NAMES.map((name, idx) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div className="text-[10px] font-display uppercase tracking-wider text-stone text-center">{ABILITY_ABBR[idx]}</div>
          <select
            value={assignments[idx] ?? ''}
            onChange={e => assign(idx, e.target.value ? Number(e.target.value) : null)}
            className="
              w-full text-center font-display text-lg text-dark-ink
              bg-aged-paper border-2 border-gold/40 rounded py-2
              focus:border-gold focus:outline-none
            "
          >
            <option value="">—</option>
            {STANDARD_ARRAY.map(v => (
              <option key={v} value={v} disabled={usedValues.includes(v) && assignments[idx] !== v}>
                {v}
              </option>
            ))}
          </select>
          <div className="text-xs font-display text-stone">{modStr(assignments[idx] ?? 8)}</div>
        </div>
      ))}
    </div>
  );
}

// Point Buy
function PointBuyPanel({ scores, setScores }: { scores: AbilityScores; setScores: (s: AbilityScores) => void }) {
  const spent = scores.reduce((sum, s) => sum + (POINT_BUY_COSTS[s] ?? 0), 0);
  const remaining = POINT_BUY_BUDGET - spent;

  function adjust(idx: number, delta: number) {
    const next = [...scores] as AbilityScores;
    const newVal = next[idx] + delta;
    if (newVal < 8 || newVal > 15) return;
    const costDiff = (POINT_BUY_COSTS[newVal] ?? 0) - (POINT_BUY_COSTS[next[idx]] ?? 0);
    if (costDiff > remaining) return;
    next[idx] = newVal;
    setScores(next);
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className={`font-display text-2xl ${remaining < 0 ? 'text-crimson' : 'text-gold'}`}>{remaining}</span>
        <span className="text-sm text-stone font-display"> points remaining</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {ABILITY_NAMES.map((name, idx) => (
          <div key={name} className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-display uppercase tracking-wider text-stone">{ABILITY_ABBR[idx]}</div>
            <div className="ability-box w-14">
              <div className="score">{scores[idx]}</div>
              <div className="modifier">{modStr(scores[idx])}</div>
              <div className="label">{name.slice(0,3)}</div>
            </div>
            <div className="flex gap-1 mt-1">
              <button onClick={() => adjust(idx,-1)} className="w-6 h-6 rounded bg-aged-paper border border-gold/40 text-dark-ink text-sm font-bold hover:bg-gold/20 transition-colors">−</button>
              <button onClick={() => adjust(idx,+1)} className="w-6 h-6 rounded bg-aged-paper border border-gold/40 text-dark-ink text-sm font-bold hover:bg-gold/20 transition-colors">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Manual entry
function ManualPanel({ scores, setScores }: { scores: AbilityScores; setScores: (s: AbilityScores) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {ABILITY_NAMES.map((name, idx) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div className="text-[10px] font-display uppercase tracking-wider text-stone">{ABILITY_ABBR[idx]}</div>
          <input
            type="number" min={3} max={20}
            value={scores[idx]}
            onChange={e => {
              const next = [...scores] as AbilityScores;
              next[idx] = Math.max(3, Math.min(20, Number(e.target.value) || 8));
              setScores(next);
            }}
            className="
              w-full text-center font-display text-lg text-dark-ink
              bg-aged-paper border-2 border-gold/40 rounded py-2
              focus:border-gold focus:outline-none
            "
          />
          <div className="text-xs font-display text-stone">{modStr(scores[idx])}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Background ASI assignment ────────────────────────────────────────────────
const ABILITY_FULL = ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'];

function BackgroundAsiPanel({
  options,
  currentAsi,
  onApply,
}: {
  options: BackgroundAsiOption[];
  currentAsi: AbilityScores;
  onApply: (asi: AbilityScores, choice: string) => void;
}) {
  const [selectedOption, setSelectedOption] = useState(0);
  const option = options[selectedOption];

  // Local assignment state: for 'playerChooses' options, track which ability gets which bonus
  const [assigns, setAssigns] = useState<Record<number, string>>({});

  // When option changes, reset assignments
  useEffect(() => { setAssigns({}); }, [selectedOption]);

  function buildAsi(): AbilityScores | null {
    const asi: AbilityScores = [0,0,0,0,0,0];
    if (!option) return null;

    if (!option.playerChooses) {
      for (const { ability, value } of option.bonuses) {
        const idx = ABILITY_FULL.indexOf(ability);
        if (idx >= 0) asi[idx] += value;
      }
      return asi;
    }

    // player-chosen: check all bonuses have an assignment
    for (let bi = 0; bi < option.bonuses.length; bi++) {
      const chosen = assigns[bi];
      if (!chosen) return null; // incomplete
      const idx = ABILITY_FULL.indexOf(chosen);
      if (idx >= 0) asi[idx] += option.bonuses[bi].value;
    }
    return asi;
  }

  function handleApply() {
    const asi = buildAsi();
    if (!asi) return;
    const label = option.playerChooses
      ? option.bonuses.map((b, i) => `${assigns[i]?.slice(0,3)}+${b.value}`).join(',')
      : option.label;
    onApply(asi, label);
  }

  const currentlyApplied = currentAsi.some(v => v !== 0);

  return (
    <div className="space-y-3">
      {options.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelectedOption(i)}
              className={`px-3 py-1.5 rounded border text-xs font-display uppercase tracking-wider transition-colors
                ${selectedOption === i
                  ? 'bg-gold/20 border-gold text-gold'
                  : 'border-gold/30 text-stone hover:border-gold/60'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {option && (
        <div className="surface-parchment rounded p-3 space-y-3">
          <div className="text-xs font-body text-stone">{option.label}</div>
          {option.playerChooses ? (
            <div className="space-y-2">
              {option.bonuses.map((bonus, bi) => (
                <div key={bi} className="flex items-center gap-3">
                  <span className="text-gold font-display text-sm w-8">+{bonus.value}</span>
                  <select
                    value={assigns[bi] ?? ''}
                    onChange={e => setAssigns(prev => ({ ...prev, [bi]: e.target.value }))}
                    className="flex-1 text-sm font-display text-dark-ink bg-aged-paper border border-gold/40 rounded px-2 py-1.5 focus:border-gold focus:outline-none"
                  >
                    <option value="">— choose ability —</option>
                    {ABILITY_FULL.map(a => {
                      const usedElsewhere = Object.entries(assigns).some(([k, v]) => Number(k) !== bi && v === a);
                      return (
                        <option key={a} value={a} disabled={usedElsewhere}>{a}</option>
                      );
                    })}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {option.bonuses.map((b, i) => (
                <span key={i} className="text-xs font-display text-gold bg-gold/10 border border-gold/30 rounded px-2 py-1">
                  {b.ability} +{b.value}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={option.playerChooses && Object.keys(assigns).length < option.bonuses.length}
            className="
              w-full py-1.5 rounded border text-xs font-display uppercase tracking-wider transition-colors
              border-gold/60 text-gold hover:bg-gold/20
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {currentlyApplied ? '✓ Update ASI' : 'Apply ASI'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Level ASI allocation panel ───────────────────────────────────────────────
/**
 * Allocates the +2-per-ASI bonus from leveling up to startingLevel.
 * Budget = asiCount × 2 points; each click applies ±1, cap at 20 per score.
 */
function LevelAsiPanel({
  classKey,
  startingLevel,
  baseScores,
  raceAsi,
  backgroundAsi,
  levelAsi,
  onApply,
  featsChosen = 0,
}: {
  classKey: string;
  startingLevel: number;
  baseScores: AbilityScores;
  raceAsi: AbilityScores;
  backgroundAsi: AbilityScores;
  levelAsi: AbilityScores;
  onApply: (asi: AbilityScores) => void;
  featsChosen?: number;
}) {
  // Count ASI events from level 2 up to startingLevel, minus feats taken
  const asiCount = Array.from({ length: startingLevel - 1 }, (_, i) => i + 2)
    .filter(lvl => isAsiLevel(classKey, lvl)).length;
  const availableAsi = Math.max(0, asiCount - featsChosen);

  const totalPoints = availableAsi * 2;
  const spentPoints = levelAsi.reduce((sum, v) => sum + v, 0);
  const remaining   = totalPoints - spentPoints;

  function adjust(idx: number, delta: number) {
    if (delta > 0 && remaining <= 0) return;
    if (delta < 0 && levelAsi[idx] <= 0) return;
    const baseWithOtherAsi = baseScores[idx] + raceAsi[idx] + backgroundAsi[idx];
    const newLevelVal = levelAsi[idx] + delta;
    if (baseWithOtherAsi + newLevelVal > 20) return;
    const next = [...levelAsi] as AbilityScores;
    next[idx] = newLevelVal;
    onApply(next);
  }

  if (availableAsi === 0) return null;

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className={`font-display text-2xl ${remaining < 0 ? 'text-crimson' : 'text-gold'}`}>{remaining}</span>
        <span className="text-sm text-stone font-display"> points remaining</span>
        <span className="text-xs text-stone/60 font-display ml-2">({availableAsi} ASI{availableAsi > 1 ? 's' : ''} × 2)</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {ABILITY_NAMES.map((name, idx) => {
          const baseWithOtherAsi = baseScores[idx] + raceAsi[idx] + backgroundAsi[idx];
          const finalWithLevel   = Math.min(20, baseWithOtherAsi + levelAsi[idx]);
          return (
            <div key={name} className="flex flex-col items-center gap-1">
              <div className="text-[10px] font-display uppercase tracking-wider text-stone">{ABILITY_ABBR[idx]}</div>
              <div className="ability-box w-14">
                <div className="score">{finalWithLevel}</div>
                <div className="modifier">{modStr(finalWithLevel)}</div>
                <div className="label">{name.slice(0,3)}</div>
              </div>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => adjust(idx,-1)}
                  disabled={levelAsi[idx] <= 0}
                  className="w-6 h-6 rounded bg-aged-paper border border-gold/40 text-dark-ink text-sm font-bold hover:bg-gold/20 transition-colors disabled:opacity-30"
                >−</button>
                <button
                  onClick={() => adjust(idx,+1)}
                  disabled={remaining <= 0 || baseWithOtherAsi + levelAsi[idx] >= 20}
                  className="w-6 h-6 rounded bg-aged-paper border border-gold/40 text-dark-ink text-sm font-bold hover:bg-gold/20 transition-colors disabled:opacity-30"
                >+</button>
              </div>
              {levelAsi[idx] > 0 && (
                <div className="text-[10px] text-gold font-display">+{levelAsi[idx]}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Level Feat Picker ────────────────────────────────────────────────────────
/**
 * Lets users pick feats instead of (or alongside) ASIs when starting at higher levels.
 * Each feat "costs" one ASI slot. The LevelAsiPanel's budget is reduced accordingly.
 */
function LevelFeatPanel({
  asiCount,
  chosenFeats,
  onChange,
  draftCharacter,
}: {
  asiCount: number;
  chosenFeats: string[];
  onChange: (keys: string[]) => void;
  draftCharacter: Character;
}) {
  const [feats, setFeats] = useState<DndFeat[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getFeats().then(f => { setFeats(f); setLoading(false); });
  }, []);

  const maxFeats = asiCount;

  // Evaluate prerequisites for each feat
  const featEligibility = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const feat of feats) {
      // Use prereqeval from the data (accessed via index signature)
      const prereqeval = feat['prereqeval'];
      map.set(feat._key, evaluatePrereq(prereqeval, draftCharacter));
    }
    return map;
  }, [feats, draftCharacter]);

  const filtered = feats.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  function toggle(key: string) {
    if (chosenFeats.includes(key)) {
      onChange(chosenFeats.filter(k => k !== key));
    } else if (chosenFeats.length < maxFeats) {
      onChange([...chosenFeats, key]);
    }
  }

  if (maxFeats === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-body text-stone">
          Select feats to replace ASIs (each feat uses one ASI slot).
        </div>
        <span className={`text-xs font-display ${chosenFeats.length > 0 ? 'text-gold' : 'text-stone'}`}>
          {chosenFeats.length}/{maxFeats}
        </span>
      </div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search feats…"
        className="w-full px-3 py-1.5 text-sm font-body bg-aged-paper border border-gold/40 rounded focus:border-gold focus:outline-none text-dark-ink placeholder:text-stone/50"
      />
      {loading && <div className="text-xs text-stone font-body italic">Loading feats…</div>}
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
        {filtered.map(feat => {
          const selected = chosenFeats.includes(feat._key);
          const meetsPrereq = featEligibility.get(feat._key) ?? true;
          const disabled = !selected && (chosenFeats.length >= maxFeats || !meetsPrereq);
          return (
            <button
              key={feat._key}
              onClick={() => toggle(feat._key)}
              disabled={disabled}
              className={`
                w-full text-left px-3 py-2 rounded border text-xs transition-colors
                ${selected
                  ? 'bg-gold/20 border-gold text-dark-ink'
                  : !meetsPrereq
                    ? 'border-crimson/30 text-stone/40 cursor-not-allowed opacity-50'
                    : 'border-gold/20 text-stone hover:border-gold/40 hover:text-dark-ink disabled:opacity-40 disabled:cursor-not-allowed'}
              `}
            >
              <div className="font-display text-sm">{feat.name}</div>
              {(feat.prerequisite || feat.prereqs) && (
                <div className={`text-[10px] font-display mt-0.5 ${!meetsPrereq ? 'text-crimson' : 'text-stone/70'}`}>
                  Prereq: {feat.prerequisite ?? feat.prereqs}
                  {!meetsPrereq && ' ✗'}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Class Skill Proficiency Picker ──────────────────────────────────────────
function SkillPicker({
  count,
  options,
  selected,
  excluded,
  label,
  onChange,
}: {
  count: number;
  options: Skill[];
  selected: Skill[];
  excluded: Skill[];
  label: string;
  onChange: (skills: Skill[]) => void;
}) {
  function toggle(skill: Skill) {
    if (selected.includes(skill)) {
      onChange(selected.filter(s => s !== skill));
    } else if (selected.length < count) {
      onChange([...selected, skill]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-body text-stone">{label}</div>
        <span className={`text-xs font-display ${selected.length >= count ? 'text-gold' : 'text-stone'}`}>
          {selected.length}/{count}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {options.map(skill => {
          const isExcluded = excluded.includes(skill);
          const isSelected = selected.includes(skill);
          return (
            <button
              key={skill}
              onClick={() => !isExcluded && toggle(skill)}
              disabled={isExcluded || (!isSelected && selected.length >= count)}
              className={`
                text-left px-2 py-1.5 rounded border text-xs font-body transition-colors
                ${isExcluded ? 'border-stone/20 text-stone/30 cursor-not-allowed' :
                  isSelected ? 'bg-gold/20 border-gold text-dark-ink' :
                  selected.length >= count ? 'border-gold/20 text-stone/40 cursor-not-allowed' :
                  'border-gold/20 text-stone hover:border-gold/40 hover:text-dark-ink'}
              `}
            >
              {skill}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Step4AbilityScores() {
  const {
    draft,
    setAbilityScoreMethod, setBaseScores, setBackgroundAsi, setLevelAsi,
    setChosenSkills, setChosenExpertise, setChosenFeats,
  } = useCharacterStore();
  const [bg, setBg] = useState<DndBackground | null>(null);
  const [cls, setCls] = useState<DndClass | null>(null);
  const finalScores = resolveFinalScores(draft);

  // Build a partial Character for feat prerequisite evaluation
  const draftCharacterForPrereq = useMemo<Character>(() => ({
    id: 'draft', name: draft.name || 'Draft', race: draft.race ?? '',
    raceVariant: draft.raceVariant ?? null,
    classes: draft.classKey ? [{ classKey: draft.classKey, level: draft.startingLevel, subclassKey: draft.startingSubclassKey, hpPerLevel: [] }] : [],
    totalLevel: draft.startingLevel, background: draft.background ?? '',
    abilityScores: finalScores, abilityScoreMethod: draft.abilityScoreMethod,
    skills: draft.chosenSkills, expertise: draft.chosenExpertise,
    chosenCantrips: draft.chosenCantrips, chosenSpells: draft.chosenSpells,
    equipment: [], currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }, details: { alignment: '' },
    createdAt: '', updatedAt: '',
  }), [draft.race, draft.raceVariant, draft.classKey, draft.startingLevel, draft.startingSubclassKey, draft.background, finalScores, draft.abilityScoreMethod, draft.chosenSkills, draft.chosenExpertise, draft.chosenCantrips, draft.chosenSpells, draft.name]);

  // Load background + class data
  useEffect(() => {
    if (!draft.background) { setBg(null); return; }
    DataService.getBackgrounds().then(all => {
      setBg(all.find(b => b._key === draft.background) ?? null);
    });
  }, [draft.background]);

  useEffect(() => {
    if (!draft.classKey) { setCls(null); return; }
    DataService.getClasses().then(all => {
      setCls(all.find(c => c._key === draft.classKey) ?? null);
    });
  }, [draft.classKey]);

  const asiOptions: BackgroundAsiOption[] = bg?.scorestxt?.length
    ? parseBackgroundAsi(bg.scorestxt)
    : [];

  // Class skill proficiency
  const skillChoice = parseSkillChoice(cls?.skillstxt?.primary);
  const bgSkills = (bg?.skills ?? []) as Skill[];
  // Background skills are already proficient; exclude them from class picker options (show grayed)

  // Expertise (Rogue L1: 2 skills; Bard L3: 2 skills)
  const expertiseLevel = draft.classKey === 'bard' ? 3 : 1;
  const showExpertise  = EXPERTISE_CLASSES.includes(draft.classKey ?? '') && draft.startingLevel >= expertiseLevel;
  // For expertise, pool = chosen class skills + background skills
  const expertisePool: Skill[] = Array.from(new Set([...draft.chosenSkills, ...bgSkills]));

  const methods = [
    { key: 'standard-array', label: 'Standard Array' },
    { key: 'point-buy',      label: 'Point Buy'      },
    { key: 'manual',         label: 'Manual / Roll'  },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-display-lg text-gold text-shadow">Ability Scores</h2>
        <p className="text-sm font-body text-stone mt-1">
          Assign your six core ability scores. Any racial or background bonuses are shown in the final column.
        </p>
      </div>

      {/* Method selector */}
      <div className="flex gap-2 flex-wrap">
        {methods.map(m => (
          <button
            key={m.key}
            onClick={() => setAbilityScoreMethod(m.key)}
            className={`
              px-4 py-2 rounded font-display text-xs uppercase tracking-wider border transition-all
              ${draft.abilityScoreMethod === m.key
                ? 'bg-gold/20 border-gold text-gold'
                : 'border-gold/30 text-stone hover:border-gold/60 hover:text-gold'}
            `}
          >{m.label}</button>
        ))}
      </div>

      {/* Method panel */}
      <div>
        {draft.abilityScoreMethod === 'standard-array' && (
          <StandardArrayPanel key="standard-array" scores={draft.baseScores} setScores={setBaseScores} />
        )}
        {draft.abilityScoreMethod === 'point-buy' && (
          <PointBuyPanel scores={draft.baseScores} setScores={setBaseScores} />
        )}
        {draft.abilityScoreMethod === 'manual' && (
          <ManualPanel scores={draft.baseScores} setScores={setBaseScores} />
        )}
      </div>

      {/* Background ASI */}
      {bg && asiOptions.length > 0 && (
        <>
          <Divider label={`Background ASI — ${bg.name}`} />
          <BackgroundAsiPanel
            options={asiOptions}
            currentAsi={draft.backgroundAsi}
            onApply={(asi, choice) => setBackgroundAsi(asi, choice)}
          />
        </>
      )}
      {draft.background && !bg && (
        <div className="text-xs text-stone font-body italic">Loading background bonuses…</div>
      )}
      {!draft.background && (
        <div className="text-xs text-stone/60 font-body italic">
          Select a background in Step 3 to apply its ability score bonus here.
        </div>
      )}

      {/* Class Skill Proficiencies */}
      {cls && skillChoice.count > 0 && (
        <>
          <Divider label={`${cls.name} Skill Proficiencies`} />
          <SkillPicker
            count={skillChoice.count}
            options={skillChoice.options.length ? skillChoice.options : [...ALL_SKILLS]}
            selected={draft.chosenSkills}
            excluded={bgSkills}
            label={cls.skillstxt?.primary ?? `Choose ${skillChoice.count} skills`}
            onChange={setChosenSkills}
          />
        </>
      )}

      {/* Expertise (Rogue/Bard) */}
      {showExpertise && expertisePool.length > 0 && (
        <>
          <Divider label="Expertise" />
          <SkillPicker
            count={2}
            options={expertisePool}
            selected={draft.chosenExpertise}
            excluded={[]}
            label="Choose 2 skills to gain expertise (double proficiency bonus)"
            onChange={setChosenExpertise}
          />
        </>
      )}

      {/* Level ASI — only shown when startingLevel > 1 and class has earned ASIs */}
      {draft.classKey && draft.startingLevel > 1 && (
        (() => {
          const asiCount = Array.from({ length: draft.startingLevel - 1 }, (_, i) => i + 2)
            .filter(lvl => isAsiLevel(draft.classKey!, lvl)).length;
          const featsChosen = draft.chosenFeats.length;
          const remainingAsi = asiCount - featsChosen;
          return asiCount > 0 ? (
            <>
              <Divider label={`Level ${draft.startingLevel} ASI & Feat Bonuses`} />
              <p className="text-xs font-body text-stone -mt-2">
                You have {asiCount} ASI event{asiCount > 1 ? 's' : ''}. Each can be used for +2 ability points <em>or</em> a feat.
              </p>
              {remainingAsi > 0 && (
                <LevelAsiPanel
                  classKey={draft.classKey}
                  startingLevel={draft.startingLevel}
                  baseScores={draft.baseScores}
                  raceAsi={draft.raceAsi}
                  backgroundAsi={draft.backgroundAsi}
                  levelAsi={draft.levelAsi}
                  onApply={setLevelAsi}
                  featsChosen={featsChosen}
                />
              )}
              <Divider label={`Feat Selection (${featsChosen}/${asiCount})`} />
              <LevelFeatPanel
                asiCount={asiCount}
                chosenFeats={draft.chosenFeats}
                draftCharacter={draftCharacterForPrereq}
                onChange={keys => {
                  setChosenFeats(keys);
                  // Reset levelAsi points if we now have fewer ASI events
                  const newRemaining = asiCount - keys.length;
                  const totalPoints = newRemaining * 2;
                  const currentSpent = draft.levelAsi.reduce((s, v) => s + v, 0);
                  if (currentSpent > totalPoints) setLevelAsi([0,0,0,0,0,0]);
                }}
              />
            </>
          ) : null;
        })()
      )}

      {/* Final scores (with all ASIs) */}
      <Divider label="Final Scores (with All Bonuses)" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {ABILITY_NAMES.map((name, idx) => {
          const base  = draft.baseScores[idx];
          const bonus = draft.raceAsi[idx] + draft.backgroundAsi[idx] + draft.levelAsi[idx];
          const final = finalScores[idx];
          return (
            <div key={name} className="flex flex-col items-center gap-1">
              <div className="text-[9px] font-display uppercase tracking-widest text-stone">{ABILITY_ABBR[idx]}</div>
              <div className="ability-box">
                <div className="score">{final}</div>
                <div className="modifier">{modStr(final)}</div>
                <div className="label">{name.slice(0,3)}</div>
              </div>
              {bonus !== 0 && (
                <div className="text-[10px] text-gold font-display">
                  {base} {bonus > 0 ? '+' : ''}{bonus}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
