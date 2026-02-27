import { useState, useEffect } from 'react';
import type { Character, AbilityScores, Skill } from '../../types/character';
import type { DndClass, DndSubclass, DndSpell, DndFeat, DndWarlockInvocation } from '../../types/data';
import DataService from '../../services/data.service';
import { isAsiLevel, SUBCLASS_LEVEL, abilityMod, meetsMulticlassPrereq, MULTICLASS_PREREQS, maxSpellLevelForClass } from '../../services/character.calculator';
import { ABILITY_ABBR, ALL_SKILLS } from '../../types/character';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';

const HIT_DICE: Record<string, number> = {
  barbarian: 12, fighter: 10, paladin: 10, ranger: 10,
  bard: 8, cleric: 8, druid: 8, monk: 8, rogue: 8, warlock: 8,
  artificer: 8, sorcerer: 6, wizard: 6,
};

/** Eldritch Invocations known per warlock level (index = level - 1) */
const WARLOCK_INVOCATIONS_KNOWN = [
  0, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8,
];

/** Fighting styles available per class */
const FIGHTING_STYLES_BY_CLASS: Record<string, string[]> = {
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

/** Levels at which each class gains a fighting style */
const FIGHTING_STYLE_GAINS: Record<string, number[]> = {
  fighter: [1, 10], paladin: [2], ranger: [2],
};

/** Expertise slots gained per class per level: [count, level] pairs */
const EXPERTISE_GAINS: Record<string, [number, number][]> = {
  rogue: [[2, 1], [2, 6]],
  bard:  [[2, 3], [2, 10]],
};

/** Ranger (2014 PHB) favored enemy choices */
const RANGER_FAVORED_ENEMIES = [
  'Aberrations', 'Beasts', 'Celestials', 'Constructs', 'Dragons',
  'Elementals', 'Fey', 'Fiends', 'Giants', 'Monstrosities',
  'Oozes', 'Plants', 'Undead', 'Two Races of Humanoids',
];

/** Ranger (2014 PHB) favored terrain choices */
const RANGER_FAVORED_TERRAINS = [
  'Arctic', 'Coast', 'Desert', 'Forest', 'Grassland', 'Mountain', 'Swamp', 'Underdark',
];

/** Levels at which 2014 Ranger gains additional favored enemies */
const FAVORED_ENEMY_LEVELS = [1, 6, 14];

/** Levels at which 2014 Ranger gains additional favored terrains */
const FAVORED_TERRAIN_LEVELS = [1, 6, 10];

type LevelUpStep = 'class' | 'features' | 'subclass' | 'asi' | 'hp' | 'spells' | 'invocations' | 'fightingStyle' | 'expertise' | 'languageTool' | 'rangerChoices' | 'confirm';

/** Common language options in D&D 5e */
const COMMON_LANGUAGES = [
  'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc',
  'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon',
];

/** Common tool proficiency options */
const COMMON_TOOLS = [
  "Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools",
  "Cartographer's Tools", "Cobbler's Tools", "Cook's Utensils", "Disguise Kit", "Forgery Kit",
  "Gaming Set", "Glassblower's Tools", "Herbalism Kit", "Jeweler's Tools", "Land Vehicles",
  "Leatherworker's Tools", "Mason's Tools", "Navigator's Tools", "Painter's Supplies",
  "Poisoner's Kit", "Potter's Tools", "Smith's Tools", "Thieves' Tools", "Tinker's Tools",
  "Water Vehicles", "Weaver's Tools", "Woodcarver's Tools",
];

interface Props {
  char: Character;
  onComplete: (updated: Character) => void;
  onCancel:   () => void;
}

export function LevelUpWizard({ char, onComplete, onCancel }: Props) {
  // ── Wizard state ──────────────────────────────────────────────────────────
  const [step, setStep]             = useState<LevelUpStep>('class');
  const [targetClassKey, setTarget] = useState<string>(char.classes[0]?.classKey ?? '');
  const [isNewClass, setIsNewClass] = useState(false);

  // Loaded data
  const [cls, setCls]               = useState<DndClass | null>(null);
  const [allClasses, setAllClasses] = useState<DndClass[]>([]);
  const [subclasses, setSubclasses] = useState<DndSubclass[]>([]);
  const [classSpells, setClassSpells] = useState<DndSpell[]>([]);
  const [feats, setFeats]           = useState<DndFeat[]>([]);
  const [allInvocations, setAllInvocations] = useState<DndWarlockInvocation[]>([]);
  const [loading, setLoading]       = useState(false);

  // Choices
  const [chosenSubclass, setChosenSubclass]   = useState<string>('');
  const [asiScores, setAsiScores]             = useState<AbilityScores>([...char.abilityScores]);
  const [asiMode, setAsiMode]                 = useState<'asi' | 'feat'>('asi');
  const [chosenFeat, setChosenFeat]           = useState<string>('');
  const [hpMode, setHpMode]                   = useState<'average' | 'max' | 'roll'>('average');
  const [rolledHp, setRolledHp]               = useState<number | null>(null);
  const [newCantrips, setNewCantrips]         = useState<string[]>([]);
  const [newSpells, setNewSpells]             = useState<string[]>([]);
  const [spellSearch, setSpellSearch]         = useState('');
  const [newInvocations, setNewInvocations]   = useState<string[]>([]);
  const [invocationSearch, setInvocationSearch] = useState('');
  const [chosenFightingStyle, setChosenFightingStyle] = useState('');
  const [newExpertise, setNewExpertise]       = useState<Skill[]>([]);
  const [newLanguages, setNewLanguages]       = useState<string[]>([]);
  const [newToolProfs, setNewToolProfs]       = useState<string[]>([]);
  const [newFavoredEnemy, setNewFavoredEnemy] = useState<string>('');
  const [newFavoredTerrain, setNewFavoredTerrain] = useState<string>('');

  const existingEntry  = char.classes.find(c => c.classKey === targetClassKey);
  const newClassLevel  = (existingEntry?.level ?? 0) + 1;
  const hd             = HIT_DICE[targetClassKey] ?? 8;
  const conMod         = abilityMod(char.abilityScores[2]);
  const avgHp          = Math.floor(hd / 2) + 1 + conMod;
  const maxHp          = hd + conMod;
  const atSubclassLvl  = newClassLevel === (SUBCLASS_LEVEL[targetClassKey] ?? 3);
  const atAsiLevel     = isAsiLevel(targetClassKey, newClassLevel);

  // Spell step computation
  const isCaster = cls != null && (
    'spellcasting' in (cls.features ?? {}) || targetClassKey === 'artificer' ||
    cls.spellcastingKnown != null
  );
  const knownCantripsAtNew  = cls?.spellcastingKnown?.cantrips?.[newClassLevel - 1] ?? 0;
  const knownCantripsAtPrev = cls?.spellcastingKnown?.cantrips?.[newClassLevel - 2] ?? 0;
  const newCantripSlots     = Math.max(0, knownCantripsAtNew - knownCantripsAtPrev);

  const knownSpellsAtNew    = cls?.spellcastingKnown?.spells?.[newClassLevel - 1] ?? 0;
  const knownSpellsAtPrev   = cls?.spellcastingKnown?.spells?.[newClassLevel - 2] ?? 0;
  const newSpellSlots       = Math.max(0, knownSpellsAtNew - knownSpellsAtPrev);

  const needsSpellStep = isCaster && (newCantripSlots > 0 || newSpellSlots > 0);

  // Invocations step: warlocks gain invocations at specific levels
  const isWarlock = targetClassKey === 'warlock';
  const invocationsAtNew  = isWarlock ? (WARLOCK_INVOCATIONS_KNOWN[newClassLevel - 1] ?? 0) : 0;
  const invocationsAtPrev = isWarlock ? (WARLOCK_INVOCATIONS_KNOWN[newClassLevel - 2] ?? 0) : 0;
  const newInvocationSlots = Math.max(0, invocationsAtNew - invocationsAtPrev);
  const needsInvocationStep = isWarlock && newInvocationSlots > 0;

  // Fighting Style step
  const fightingStylesForClass = FIGHTING_STYLES_BY_CLASS[targetClassKey] ?? [];
  const styleGainLevels = FIGHTING_STYLE_GAINS[targetClassKey] ?? [];
  // Allow gaining a new fighting style if this level grants one (e.g., Fighter 1 AND Fighter 10)
  const gainsNewFightingStyle = styleGainLevels.includes(newClassLevel);
  // Filter out already-chosen styles so the character can't pick duplicates
  const existingStyles = new Set<string>([
    ...(existingEntry?.fightingStyle ? [existingEntry.fightingStyle] : []),
    ...(existingEntry?.additionalFightingStyles ?? []),
  ]);
  const availableFightingStyles = fightingStylesForClass.filter(s => !existingStyles.has(s));
  const needsFightingStyleStep = gainsNewFightingStyle && availableFightingStyles.length > 0;

  // Expertise step
  const expertiseGains = EXPERTISE_GAINS[targetClassKey] ?? [];
  const newExpertiseCount = expertiseGains
    .filter(([, lvl]) => lvl === newClassLevel)
    .reduce((sum, [count]) => sum + count, 0);
  const needsExpertiseStep = newExpertiseCount > 0;
  // Pool of skills available for expertise = current proficiencies
  const proficientSkills: Skill[] = ALL_SKILLS.filter(s => char.skills.includes(s));
  const alreadyExpert = new Set(char.expertise);
  const expertisePool = proficientSkills.filter(s => !alreadyExpert.has(s));

  // Language/Tool proficiency step - check if features at this level grant language or tool choices
  // Features can have languageProfs (number = choose N) or toolProfs
  const featuresAtThisLevel = cls ? Object.values(cls.features ?? {}).filter(f => f.minlevel === newClassLevel) : [];
  // Count language choices from features (number type means "choose N languages")
  const languageChoices = featuresAtThisLevel.reduce((sum, f) => {
    const lp = (f as unknown as { languageProfs?: number | string[] }).languageProfs;
    if (typeof lp === 'number') return sum + lp;
    return sum;
  }, 0);
  // Count tool proficiency choices from features
  const toolChoices = featuresAtThisLevel.reduce((sum, f) => {
    const tp = (f as unknown as { toolProfs?: (string | [string, number])[] }).toolProfs;
    if (Array.isArray(tp)) {
      return sum + tp.filter(t => Array.isArray(t) && typeof t[1] === 'number').reduce((s, t) => s + (t[1] as number), 0);
    }
    return sum;
  }, 0);
  const needsLanguageToolStep = languageChoices > 0 || toolChoices > 0;
  const alreadyKnownLanguages = new Set(char.languages ?? []);
  const alreadyKnownTools = new Set(char.toolProficiencies ?? []);
  const availableLanguages = COMMON_LANGUAGES.filter(l => !alreadyKnownLanguages.has(l));
  const availableTools = COMMON_TOOLS.filter(t => !alreadyKnownTools.has(t));

  // Ranger Favored Enemy / Natural Explorer step
  const isRanger = targetClassKey === 'ranger';
  const gainsNewFavoredEnemy = isRanger && FAVORED_ENEMY_LEVELS.includes(newClassLevel);
  const gainsNewFavoredTerrain = isRanger && FAVORED_TERRAIN_LEVELS.includes(newClassLevel);
  const needsRangerChoicesStep = gainsNewFavoredEnemy || gainsNewFavoredTerrain;
  const existingFavoredEnemies = new Set(char.favoredEnemies ?? []);
  const existingFavoredTerrains = new Set(char.favoredTerrains ?? []);
  const availableFavoredEnemies = RANGER_FAVORED_ENEMIES.filter(e => !existingFavoredEnemies.has(e));
  const availableFavoredTerrains = RANGER_FAVORED_TERRAINS.filter(t => !existingFavoredTerrains.has(t));

  // Decide which steps are needed
  const steps: LevelUpStep[] = ['class', 'features'];
  if (atSubclassLvl && !existingEntry?.subclassKey) steps.push('subclass');
  if (atAsiLevel) steps.push('asi');
  steps.push('hp');
  if (needsFightingStyleStep) steps.push('fightingStyle');
  if (needsExpertiseStep) steps.push('expertise');
  if (needsLanguageToolStep) steps.push('languageTool');
  if (needsRangerChoicesStep) steps.push('rangerChoices');
  if (needsSpellStep) steps.push('spells');
  if (needsInvocationStep) steps.push('invocations');
  steps.push('confirm');

  // Load all classes once for multiclass browser
  useEffect(() => {
    DataService.getClasses().then(setAllClasses);
  }, []);

  // Load data when class chosen
  useEffect(() => {
    if (!targetClassKey) return;
    setLoading(true);
    const loads: Promise<unknown>[] = [
      DataService.getClasses().then(all => all.find(c => c._key === targetClassKey) ?? null),
      DataService.getSubclassesForClass(targetClassKey),
      DataService.getSpellsForClass(targetClassKey),
      DataService.getFeats(),
    ];
    if (targetClassKey === 'warlock') {
      loads.push(DataService.getWarlockInvocations());
    }
    Promise.all(loads).then(([c, subs, sp, ft, inv]) => {
      setCls(c as DndClass | null);
      setSubclasses(subs as DndSubclass[]);
      setClassSpells(sp as DndSpell[]);
      setFeats(ft as DndFeat[]);
      if (inv) setAllInvocations(inv as DndWarlockInvocation[]);
      setLoading(false);
    });
  }, [targetClassKey]);

  function nextStep() {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  }

  function prevStep() {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  }

  function rollHitDie(): number {
    return Math.max(1, Math.floor(Math.random() * hd) + 1 + conMod);
  }

  function handleConfirm() {
    const hpGain = hpMode === 'max' ? maxHp : hpMode === 'roll' ? (rolledHp ?? avgHp) : avgHp;

    const updatedClasses = isNewClass
      ? [...char.classes, { classKey: targetClassKey, level: 1, subclassKey: chosenSubclass || null, hpPerLevel: [Math.max(1, hpGain)], fightingStyle: chosenFightingStyle || undefined }]
      : char.classes.map(cc => {
          if (cc.classKey !== targetClassKey) return cc;
          // If already has a fighting style, store new one in additionalFightingStyles
          const updatedAdditionalStyles = (chosenFightingStyle && cc.fightingStyle)
            ? [...(cc.additionalFightingStyles ?? []), chosenFightingStyle]
            : cc.additionalFightingStyles;
          return {
            ...cc,
            level: cc.level + 1,
            subclassKey: chosenSubclass || cc.subclassKey,
            hpPerLevel: [...cc.hpPerLevel, Math.max(1, hpGain)],
            fightingStyle: chosenFightingStyle || cc.fightingStyle,
            additionalFightingStyles: updatedAdditionalStyles,
          };
        });

    let updatedScores = [...char.abilityScores] as AbilityScores;
    if (atAsiLevel && asiMode === 'asi') updatedScores = asiScores;

    // If feat chosen, append to character feats
    const updatedFeats = (atAsiLevel && asiMode === 'feat' && chosenFeat)
      ? [...(char.feats ?? []), chosenFeat]
      : (char.feats ?? []);

    onComplete({
      ...char,
      classes:           updatedClasses,
      totalLevel:        updatedClasses.reduce((s, c) => s + c.level, 0),
      abilityScores:     updatedScores,
      feats:             updatedFeats,
      chosenCantrips:    [...char.chosenCantrips, ...newCantrips],
      chosenSpells:      [...char.chosenSpells,   ...newSpells],
      chosenInvocations: [...(char.chosenInvocations ?? []), ...newInvocations],
      expertise:         newExpertise.length > 0 ? [...char.expertise, ...newExpertise] : char.expertise,
      languages:         newLanguages.length > 0 ? [...(char.languages ?? []), ...newLanguages] : char.languages,
      toolProficiencies: newToolProfs.length > 0 ? [...(char.toolProficiencies ?? []), ...newToolProfs] : char.toolProficiencies,
      favoredEnemies:    newFavoredEnemy ? [...(char.favoredEnemies ?? []), newFavoredEnemy] : char.favoredEnemies,
      favoredTerrains:   newFavoredTerrain ? [...(char.favoredTerrains ?? []), newFavoredTerrain] : char.favoredTerrains,
      currentHp:         (char.currentHp ?? 0) + Math.max(1, hpGain),
      updatedAt:         new Date().toISOString(),
    });
  }

  // Spell selection helpers
  const alreadyKnown     = new Set([...char.chosenCantrips, ...char.chosenSpells]);
  const filteredCantrips = classSpells.filter(s =>
    s.level === 0 && !alreadyKnown.has(s._key) &&
    (spellSearch === '' || s.name.toLowerCase().includes(spellSearch.toLowerCase()))
  );
  const filteredSpells = classSpells.filter(s =>
    s.level > 0 && s.level <= maxSpellLevelForClass(targetClassKey, existingEntry?.subclassKey ?? chosenSubclass, newClassLevel) && !alreadyKnown.has(s._key) &&
    (spellSearch === '' || s.name.toLowerCase().includes(spellSearch.toLowerCase()))
  );

  function toggleNewCantrip(key: string) {
    setNewCantrips(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : prev.length < newCantripSlots ? [...prev, key] : prev
    );
  }
  function toggleNewSpell(key: string) {
    setNewSpells(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : prev.length < newSpellSlots ? [...prev, key] : prev
    );
  }

  // Invocation helpers
  const alreadyHasInvocation = new Set(char.chosenInvocations ?? []);

  /** Parse minimum warlock level from submenu string like "[warlock level 5]" */
  function getInvocationMinLevel(inv: DndWarlockInvocation): number {
    if (!inv.submenu) return 1;
    const match = inv.submenu.match(/warlock level\s+(\d+)/i);
    return match ? parseInt(match[1]) : 1;
  }

  const filteredInvocations = allInvocations.filter(inv => {
    if (alreadyHasInvocation.has(inv._key)) return false;
    if (getInvocationMinLevel(inv) > newClassLevel) return false;
    // Only show if contains tome/blade/chain pact prereqs when relevant submenu tag
    const q = invocationSearch.toLowerCase();
    const name = (inv._displayName ?? inv.name).toLowerCase();
    return !q || name.includes(q) || inv.description.toLowerCase().includes(q);
  });

  function toggleInvocation(key: string) {
    setNewInvocations(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : prev.length < newInvocationSlots ? [...prev, key] : prev
    );
  }

  const modalTitle = isNewClass && !targetClassKey
    ? 'Level Up — Add New Class'
    : `Level Up: ${cls?.name ?? targetClassKey} → Level ${newClassLevel}`;

  return (
    <Modal title={modalTitle} onClose={onCancel} size="lg">
      <div className="space-y-5">
        {loading && step !== 'class' && (
          <div className="flex justify-center py-6"><Spinner /></div>
        )}

        {/* ── Step: choose class ─────────────────────────────── */}
        {step === 'class' && (
          <div className="space-y-3">
            {/* Existing classes */}
            {!isNewClass && (
              <>
                <p className="text-sm font-body text-stone">Choose which class to level up.</p>
                <div className="space-y-2">
                  {char.classes.map(cc => {
                    const cls_ = allClasses.find(c => c._key === cc.classKey);
                    return (
                      <button
                        key={cc.classKey}
                        onClick={() => { setTarget(cc.classKey); setIsNewClass(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded border text-left transition-all
                          ${targetClassKey === cc.classKey && !isNewClass
                            ? 'border-gold bg-gold/20 text-gold'
                            : 'border-gold/20 bg-aged-paper/40 text-dark-ink hover:border-gold/50'}`}
                      >
                        <span className="font-display text-sm flex-1">{cls_?.name ?? cc.classKey}</span>
                        <Badge color="stone">Level {cc.level} → {cc.level + 1}</Badge>
                        {targetClassKey === cc.classKey && !isNewClass && <span className="text-gold">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Multiclass divider */}
                <div className="relative flex items-center gap-2 py-1">
                  <div className="flex-1 border-t border-gold/20" />
                  <span className="text-[10px] font-display uppercase tracking-wider text-stone flex-shrink-0">or multiclass</span>
                  <div className="flex-1 border-t border-gold/20" />
                </div>

                <button
                  onClick={() => { setIsNewClass(true); setTarget(''); }}
                  className="w-full px-4 py-2.5 rounded border-2 border-dashed border-gold/30 text-stone font-display text-sm hover:border-gold/60 hover:text-dark-ink transition-all"
                >
                  + Add New Class (Multiclass)
                </button>
              </>
            )}

            {/* Multiclass class browser */}
            {isNewClass && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setIsNewClass(false); setTarget(char.classes[0]?.classKey ?? ''); }}
                    className="text-[10px] font-display uppercase tracking-wider text-stone hover:text-dark-ink transition-colors"
                  >
                    ← Back
                  </button>
                  <span className="text-sm font-body text-stone">Choose a new class to multiclass into.</span>
                </div>
                <p className="text-[10px] font-display text-stone/60 uppercase tracking-wider">
                  Prerequisites checked against your current ability scores. DM may allow exceptions.
                </p>
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {allClasses
                    .filter(c => !char.classes.some(cc => cc.classKey === c._key))
                    .map(c => {
                      const meetsTargetReq = meetsMulticlassPrereq(c._key, char.abilityScores);
                      // D&D 5e also requires meeting prerequisites for EACH existing class
                      const meetsSourceReqs = char.classes.every(cc => meetsMulticlassPrereq(cc.classKey, char.abilityScores));
                      const meetsReq = meetsTargetReq && meetsSourceReqs;
                      const req = MULTICLASS_PREREQS[c._key];
                      const reqText = req
                        ? Object.entries(req).map(([ab, min]) => `${ab} ${min}+`).join(', ')
                        : null;
                      const selected = targetClassKey === c._key && isNewClass;
                      return (
                        <button
                          key={c._key}
                          onClick={() => setTarget(c._key)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded border text-left transition-all
                            ${selected
                              ? 'border-gold bg-gold/20'
                              : 'border-gold/20 bg-aged-paper/40 hover:border-gold/40'}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-display text-sm text-dark-ink">{c.name}</div>
                            {reqText && (
                              <div className={`text-[9px] font-display uppercase tracking-wider mt-0.5 ${meetsReq ? 'text-gold' : 'text-crimson'}`}>
                                {meetsReq ? '✓' : '⚠'} Requires {reqText}
                              </div>
                            )}
                            {!reqText && (
                              <div className="text-[9px] font-display uppercase tracking-wider text-stone/50 mt-0.5">
                                No prerequisites
                              </div>
                            )}
                          </div>
                          {selected && <span className="text-gold flex-shrink-0">✓</span>}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step: new features ────────────────────────────────── */}
        {step === 'features' && cls && (
          <div className="space-y-2">
            <p className="text-sm font-body text-stone">
              New features at <strong>{cls.name} level {newClassLevel}</strong>:
            </p>
            {(() => {
              const newFeats = Object.entries(cls.features)
                .filter(([, f]) => f.minlevel === newClassLevel);
              if (newFeats.length === 0) return (
                <p className="text-sm font-body text-stone italic">No new features at this level.</p>
              );
              return newFeats.map(([key, feat]) => (
                <div key={key} className="surface-parchment rounded p-3 border border-gold/20">
                  <div className="font-display text-sm text-dark-ink">{feat.name ?? key}</div>
                  {feat.description && (
                    <p className="text-xs font-body text-stone mt-1 leading-relaxed line-clamp-4">
                      {feat.description}
                    </p>
                  )}
                </div>
              ));
            })()}
          </div>
        )}

        {/* ── Step: subclass ─────────────────────────────────── */}
        {step === 'subclass' && (
          <div className="space-y-3">
            <p className="text-sm font-body text-stone">Choose your subclass:</p>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
              {subclasses.map(sub => (
                <button
                  key={sub._key}
                  onClick={() => setChosenSubclass(sub._key)}
                  className={`flex items-start gap-3 px-4 py-2.5 rounded border text-left transition-all
                    ${chosenSubclass === sub._key
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-gold/20 bg-aged-paper/40 text-dark-ink hover:border-gold/50'}`}
                >
                  <div>
                    <div className="font-display text-sm">{sub.subname}</div>
                    {sub.fullname && sub.fullname !== sub.subname && (
                      <div className="text-[10px] text-stone font-display">{sub.fullname}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step: ASI / Feat ──────────────────────────────── */}
        {step === 'asi' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setAsiMode('asi')}
                className={`px-3 py-1.5 rounded border text-xs font-display uppercase tracking-wider transition-colors
                  ${asiMode === 'asi' ? 'bg-gold/20 border-gold text-gold' : 'border-gold/30 text-stone hover:border-gold/50'}`}
              >
                Ability Score Increase
              </button>
              <button
                onClick={() => setAsiMode('feat')}
                className={`px-3 py-1.5 rounded border text-xs font-display uppercase tracking-wider transition-colors
                  ${asiMode === 'feat' ? 'bg-gold/20 border-gold text-gold' : 'border-gold/30 text-stone hover:border-gold/50'}`}
              >
                Feat
              </button>
            </div>

            {asiMode === 'asi' ? (
              <div className="space-y-2">
                <p className="text-xs font-body text-stone">Distribute +2 points among your ability scores (max 20 each).</p>
                <div className="grid grid-cols-3 gap-2">
                  {ABILITY_ABBR.map((abbr, i) => {
                    const increase = asiScores[i] - char.abilityScores[i];
                    const pointsUsed = asiScores.reduce((s, v, j) => s + (v - char.abilityScores[j]), 0);
                    return (
                      <div key={abbr} className="ability-box text-center">
                        <div className="text-[9px] font-display uppercase text-stone">{abbr}</div>
                        <div className="text-lg font-display text-dark-ink">{asiScores[i]}</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <button
                            onClick={() => {
                              if (asiScores[i] > char.abilityScores[i])
                                setAsiScores(prev => prev.map((v, j) => j === i ? v - 1 : v) as AbilityScores);
                            }}
                            className="text-stone hover:text-crimson text-xs"
                          >−</button>
                          <span className={`text-[10px] font-display ${increase > 0 ? 'text-gold' : 'text-stone'}`}>
                            {increase > 0 ? `+${increase}` : '0'}
                          </span>
                          <button
                            onClick={() => {
                              if (pointsUsed < 2 && asiScores[i] < 20)
                                setAsiScores(prev => prev.map((v, j) => j === i ? v + 1 : v) as AbilityScores);
                            }}
                            className="text-stone hover:text-gold text-xs"
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-stone font-body">
                  Points remaining: {2 - asiScores.reduce((s, v, i) => s + (v - char.abilityScores[i]), 0)}
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {feats.map(feat => (
                  <button
                    key={feat._key}
                    onClick={() => setChosenFeat(feat._key)}
                    className={`w-full flex items-start gap-3 px-3 py-2 rounded border text-left transition-all
                      ${chosenFeat === feat._key
                        ? 'border-gold bg-gold/20'
                        : 'border-gold/20 bg-aged-paper/40 hover:border-gold/40'}`}
                  >
                    <div>
                      <div className="font-display text-sm text-dark-ink">{feat.name}</div>
                      {feat.prereqs && (
                        <div className="text-[10px] font-display text-stone">Prereq: {feat.prereqs}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step: HP ──────────────────────────────────────── */}
        {step === 'hp' && (
          <div className="space-y-3">
            <p className="text-sm font-body text-stone">
              How do you want to determine your HP gain? (d{hd} + CON {conMod >= 0 ? '+' : ''}{conMod})
            </p>
            <div className="flex gap-2 flex-wrap">
              {(['average', 'max', 'roll'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    setHpMode(mode);
                    if (mode === 'roll') setRolledHp(rollHitDie());
                  }}
                  className={`px-3 py-1.5 rounded border text-xs font-display uppercase tracking-wider transition-colors
                    ${hpMode === mode ? 'bg-gold/20 border-gold text-gold' : 'border-gold/30 text-stone hover:border-gold/50'}`}
                >
                  {mode === 'average' ? `Average (+${avgHp})` : mode === 'max' ? `Maximum (+${maxHp})` : 'Roll Dice'}
                </button>
              ))}
              {hpMode === 'roll' && (
                <button
                  onClick={() => setRolledHp(rollHitDie())}
                  className="px-3 py-1.5 rounded border border-gold/30 text-stone text-xs font-display uppercase tracking-wider hover:border-gold/60"
                >
                  🎲 Reroll
                </button>
              )}
            </div>
            <div className="surface-parchment rounded p-4 text-center">
              <div className="text-[10px] font-display uppercase tracking-wider text-stone">HP Gained</div>
              <div className="font-display text-display-md text-gold">
                +{hpMode === 'max' ? maxHp : hpMode === 'roll' ? (rolledHp ?? avgHp) : avgHp}
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Spells ──────────────────────────────────── */}
        {step === 'spells' && (
          <div className="space-y-3">
            <p className="text-sm font-body text-stone">
              Choose new spells for level {newClassLevel}.
            </p>
            <input
              type="text"
              placeholder="Search spells…"
              value={spellSearch}
              onChange={e => setSpellSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm font-body bg-aged-paper border border-gold/40 rounded focus:border-gold focus:outline-none text-dark-ink"
            />

            {newCantripSlots > 0 && (
              <div>
                <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">
                  Cantrips — choose {newCantripSlots} ({newCantrips.length}/{newCantripSlots})
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {filteredCantrips.map(spell => (
                    <button
                      key={spell._key}
                      onClick={() => toggleNewCantrip(spell._key)}
                      disabled={!newCantrips.includes(spell._key) && newCantrips.length >= newCantripSlots}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded border text-left text-sm transition-all
                        ${newCantrips.includes(spell._key)
                          ? 'border-gold bg-gold/20 text-gold'
                          : 'border-gold/20 bg-aged-paper/40 text-dark-ink hover:border-gold/40 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                    >
                      <span className="font-body">{spell.name}</span>
                      <Badge color="stone">{spell.school}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {newSpellSlots > 0 && (
              <div>
                <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">
                  Spells — choose {newSpellSlots} ({newSpells.length}/{newSpellSlots})
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {filteredSpells.map(spell => (
                    <button
                      key={spell._key}
                      onClick={() => toggleNewSpell(spell._key)}
                      disabled={!newSpells.includes(spell._key) && newSpells.length >= newSpellSlots}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded border text-left text-sm transition-all
                        ${newSpells.includes(spell._key)
                          ? 'border-gold bg-gold/20 text-gold'
                          : 'border-gold/20 bg-aged-paper/40 text-dark-ink hover:border-gold/40 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                    >
                      <span className="text-[10px] font-display text-gold w-6">L{spell.level}</span>
                      <span className="font-body flex-1">{spell.name}</span>
                      <Badge color="stone">{spell.school}</Badge>
                    </button>
                  ))}
                  {filteredSpells.length === 0 && (
                    <p className="text-xs text-stone font-body italic text-center py-2">No spells match.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Fighting Style ──────────────────────────── */}
        {step === 'fightingStyle' && (
          <div className="space-y-3">
            <p className="text-sm font-body text-stone">
              Choose your Fighting Style for <strong>{cls?.name ?? targetClassKey}</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {availableFightingStyles.map(style => (
                <button
                  key={style}
                  onClick={() => setChosenFightingStyle(style)}
                  className={`text-left px-3 py-2.5 rounded border transition-all
                    ${chosenFightingStyle === style
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-gold/20 bg-aged-paper/40 text-dark-ink hover:border-gold/50'}`}
                >
                  <div className="font-display text-sm">{style}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step: Expertise ───────────────────────────────── */}
        {step === 'expertise' && (
          <div className="space-y-3">
            <p className="text-sm font-body text-stone">
              Choose {newExpertiseCount} skill{newExpertiseCount > 1 ? 's' : ''} to gain <strong>Expertise</strong> (double proficiency bonus):
            </p>
            <div className="text-[10px] font-display uppercase tracking-wider text-stone">
              Selected: {newExpertise.length} / {newExpertiseCount}
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {expertisePool.map(skill => {
                const selected = newExpertise.includes(skill);
                const disabled = !selected && newExpertise.length >= newExpertiseCount;
                return (
                  <button
                    key={skill}
                    onClick={() => {
                      if (disabled) return;
                      setNewExpertise(prev =>
                        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                      );
                    }}
                    disabled={disabled}
                    className={`text-left px-3 py-1.5 rounded border text-xs transition-all
                      ${selected
                        ? 'border-gold bg-gold/20 text-dark-ink'
                        : 'border-gold/20 bg-aged-paper/40 text-stone hover:border-gold/40 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                  >
                    {skill}
                  </button>
                );
              })}
              {expertisePool.length === 0 && (
                <p className="col-span-2 text-xs text-stone font-body italic">No eligible skills — gain skill proficiencies first.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step: Language/Tool Proficiencies ──────────────── */}
        {step === 'languageTool' && (
          <div className="space-y-4">
            <p className="text-sm font-body text-stone">
              Your class features grant you additional proficiencies:
            </p>
            
            {/* Language selection */}
            {languageChoices > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-display uppercase tracking-wider text-gold">
                  Languages — Choose {languageChoices}
                </div>
                <div className="text-[10px] font-display text-stone">
                  Selected: {newLanguages.length} / {languageChoices}
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableLanguages.map(lang => {
                    const selected = newLanguages.includes(lang);
                    const disabled = !selected && newLanguages.length >= languageChoices;
                    return (
                      <button
                        key={lang}
                        onClick={() => {
                          if (disabled) return;
                          setNewLanguages(prev =>
                            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
                          );
                        }}
                        disabled={disabled}
                        className={`text-left px-2 py-1 rounded border text-xs transition-all
                          ${selected
                            ? 'border-gold bg-gold/20 text-dark-ink'
                            : 'border-gold/20 bg-aged-paper/40 text-stone hover:border-gold/40 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tool proficiency selection */}
            {toolChoices > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-display uppercase tracking-wider text-gold">
                  Tool Proficiencies — Choose {toolChoices}
                </div>
                <div className="text-[10px] font-display text-stone">
                  Selected: {newToolProfs.length} / {toolChoices}
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableTools.map(tool => {
                    const selected = newToolProfs.includes(tool);
                    const disabled = !selected && newToolProfs.length >= toolChoices;
                    return (
                      <button
                        key={tool}
                        onClick={() => {
                          if (disabled) return;
                          setNewToolProfs(prev =>
                            prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
                          );
                        }}
                        disabled={disabled}
                        className={`text-left px-2 py-1 rounded border text-xs transition-all
                          ${selected
                            ? 'border-gold bg-gold/20 text-dark-ink'
                            : 'border-gold/20 bg-aged-paper/40 text-stone hover:border-gold/40 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Ranger Favored Enemy / Natural Explorer ──── */}
        {step === 'rangerChoices' && (
          <div className="space-y-4">
            <p className="text-sm font-body text-stone">
              Choose your Rangers favored options for this level.
            </p>
            
            {/* Favored Enemy selection */}
            {gainsNewFavoredEnemy && (
              <div className="space-y-2">
                <div className="text-[10px] font-display uppercase tracking-wider text-gold">
                  Favored Enemy — Choose 1
                </div>
                <p className="text-xs text-stone/70 font-body">
                  You have advantage on Survival checks to track and Intelligence checks to recall info about these creatures.
                  You also learn one language spoken by your favored enemy.
                </p>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableFavoredEnemies.map(enemy => {
                    const selected = newFavoredEnemy === enemy;
                    return (
                      <button
                        key={enemy}
                        onClick={() => setNewFavoredEnemy(selected ? '' : enemy)}
                        className={`text-left px-2 py-1.5 rounded border text-xs transition-all
                          ${selected
                            ? 'border-gold bg-gold/20 text-dark-ink'
                            : 'border-gold/20 bg-aged-paper/40 text-stone hover:border-gold/40'}`}
                      >
                        {enemy}
                      </button>
                    );
                  })}
                </div>
                {existingFavoredEnemies.size > 0 && (
                  <div className="text-xs text-stone/70 font-body mt-2">
                    Already chosen: {[...existingFavoredEnemies].join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Favored Terrain selection */}
            {gainsNewFavoredTerrain && (
              <div className="space-y-2">
                <div className="text-[10px] font-display uppercase tracking-wider text-gold">
                  Natural Explorer — Choose Favored Terrain
                </div>
                <p className="text-xs text-stone/70 font-body">
                  You are particularly familiar with this type of environment. Your skill, proficiency, and expertise shine in this terrain.
                </p>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableFavoredTerrains.map(terrain => {
                    const selected = newFavoredTerrain === terrain;
                    return (
                      <button
                        key={terrain}
                        onClick={() => setNewFavoredTerrain(selected ? '' : terrain)}
                        className={`text-left px-2 py-1.5 rounded border text-xs transition-all
                          ${selected
                            ? 'border-gold bg-gold/20 text-dark-ink'
                            : 'border-gold/20 bg-aged-paper/40 text-stone hover:border-gold/40'}`}
                      >
                        {terrain}
                      </button>
                    );
                  })}
                </div>
                {existingFavoredTerrains.size > 0 && (
                  <div className="text-xs text-stone/70 font-body mt-2">
                    Already chosen: {[...existingFavoredTerrains].join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step: Eldritch Invocations ──────────────────────── */}
        {step === 'invocations' && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-body text-stone">
                Choose {newInvocationSlots} new Eldritch Invocation{newInvocationSlots > 1 ? 's' : ''}.
              </p>
              <p className="text-xs text-stone/60 font-body mt-0.5">
                Invocations requiring higher levels are filtered out.
              </p>
            </div>
            <input
              type="text"
              placeholder="Search invocations…"
              value={invocationSearch}
              onChange={e => setInvocationSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm font-body bg-aged-paper border border-gold/40 rounded focus:border-gold focus:outline-none text-dark-ink"
            />
            <div className="text-[10px] font-display uppercase tracking-wider text-stone">
              Selected: {newInvocations.length} / {newInvocationSlots}
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
              {filteredInvocations.length === 0 && (
                <p className="text-xs text-stone font-body italic text-center py-4">No invocations match.</p>
              )}
              {filteredInvocations.map(inv => {
                const selected = newInvocations.includes(inv._key);
                const minLvl   = getInvocationMinLevel(inv);
                return (
                  <button
                    key={inv._key}
                    onClick={() => toggleInvocation(inv._key)}
                    disabled={!selected && newInvocations.length >= newInvocationSlots}
                    className={`w-full flex items-start gap-3 px-3 py-2 rounded border text-left transition-all
                      ${selected
                        ? 'border-gold bg-gold/20'
                        : 'border-gold/20 bg-aged-paper/40 hover:border-gold/40 disabled:opacity-40 disabled:cursor-not-allowed'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm text-dark-ink">
                          {inv._displayName ?? inv.name}
                        </span>
                        {minLvl > 1 && (
                          <span className="text-[9px] font-display text-stone uppercase tracking-wider flex-shrink-0">
                            Lvl {minLvl}+
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-body text-stone mt-0.5 line-clamp-2 leading-relaxed">
                        {inv.description}
                      </p>
                    </div>
                    {selected && <span className="text-gold text-sm flex-shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step: Confirm ─────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="space-y-3">
            <p className="text-sm font-body text-stone">Ready to level up? Here's a summary:</p>
            <div className="surface-parchment rounded p-3 space-y-1 text-sm font-body">
              <div><strong className="font-display">Class:</strong> {targetClassKey} → Level {newClassLevel}</div>
              {chosenSubclass && <div><strong className="font-display">Subclass:</strong> {subclasses.find(s => s._key === chosenSubclass)?.subname ?? chosenSubclass}</div>}
              {atAsiLevel && asiMode === 'asi' && (
                <div><strong className="font-display">ASI:</strong> {ABILITY_ABBR.map((abbr, i) => {
                  const diff = asiScores[i] - char.abilityScores[i];
                  return diff > 0 ? `${abbr} +${diff}` : null;
                }).filter(Boolean).join(', ')}</div>
              )}
              {atAsiLevel && asiMode === 'feat' && chosenFeat && (
                <div><strong className="font-display">Feat:</strong> {feats.find(f => f._key === chosenFeat)?.name ?? chosenFeat}</div>
              )}
              <div><strong className="font-display">HP:</strong> +{hpMode === 'max' ? maxHp : hpMode === 'roll' ? (rolledHp ?? avgHp) : avgHp}</div>
              {newCantrips.length > 0 && (
                <div><strong className="font-display">New Cantrips:</strong> {newCantrips.join(', ')}</div>
              )}
              {newSpells.length > 0 && (
                <div><strong className="font-display">New Spells:</strong> {newSpells.join(', ')}</div>
              )}
              {newInvocations.length > 0 && (
                <div>
                  <strong className="font-display">Invocations:</strong>{' '}
                  {newInvocations.map(k => allInvocations.find(i => i._key === k)?.name ?? k).join(', ')}
                </div>
              )}
              {chosenFightingStyle && (
                <div><strong className="font-display">Fighting Style:</strong> {chosenFightingStyle}</div>
              )}
              {newExpertise.length > 0 && (
                <div><strong className="font-display">Expertise:</strong> {newExpertise.join(', ')}</div>
              )}
            </div>
          </div>
        )}

        {/* ── Nav buttons ───────────────────────────────────── */}
        <div className="flex justify-between pt-2 border-t border-gold/20">
          <Button
            variant="ghost"
            onClick={step === 'class' ? onCancel : prevStep}
          >
            {step === 'class' ? 'Cancel' : '← Back'}
          </Button>
          {step === 'confirm' ? (
            <Button variant="primary" onClick={handleConfirm}>
              ⚔️ Confirm Level Up
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={
                (step === 'class' && !targetClassKey) ||
                (step === 'subclass' && atSubclassLvl && !chosenSubclass) ||
                (step === 'fightingStyle' && !chosenFightingStyle) ||
                (step === 'expertise' && newExpertise.length < newExpertiseCount && expertisePool.length >= newExpertiseCount) ||
                (step === 'languageTool' && ((languageChoices > 0 && newLanguages.length < languageChoices) || (toolChoices > 0 && newToolProfs.length < toolChoices)))
              }
            >
              Next →
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
