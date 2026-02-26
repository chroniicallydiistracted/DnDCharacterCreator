import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { BuilderDraft, LevelUpDraft, AbilityScores, EquipmentItem, CharacterDetails, Skill } from '../types/character';

// Required for immer to support Set/Map in Zustand state
enableMapSet();

const EMPTY_SCORES: AbilityScores = [0, 0, 0, 0, 0, 0];

const defaultDraft = (): BuilderDraft => ({
  step: 1,
  visitedSteps: new Set([1]),
  race: null,
  raceVariant: null,
  raceAsiGeneric: [...EMPTY_SCORES],
  classKey: null,
  startingLevel: 1,
  startingSubclassKey: null,
  levelAsi: [...EMPTY_SCORES],
  chosenFightingStyle: null,
  background: null,
  backgroundVariant: null,
  abilityScoreMethod: 'standard-array',
  baseScores: [15, 14, 13, 12, 10, 8],
  raceAsi: [...EMPTY_SCORES],
  backgroundAsi: [...EMPTY_SCORES],
  backgroundAsiChoice: null,
  chosenSkills: [],
  chosenExpertise: [],
  chosenPackKey: null,
  useStartingGold: false,
  customEquipment: [],
  chosenFeats: [],
  chosenCantrips: [],
  chosenSpells: [],
  chosenInvocations: [],
  name: '',
  details: {},
});

interface CharacterState {
  draft: BuilderDraft;
  levelUpDraft: LevelUpDraft | null;

  // Draft mutations
  setStep: (step: number) => void;
  setRace: (key: string | null, variant?: string | null) => void;
  setClass: (key: string | null) => void;
  setBackground: (key: string | null) => void;
  setBackgroundVariant: (key: string | null) => void;
  setStartingLevel: (level: number) => void;
  setStartingSubclass: (key: string | null) => void;
  setLevelAsi: (asi: AbilityScores) => void;
  setChosenInvocations: (keys: string[]) => void;
  setChosenFeats: (keys: string[]) => void;
  setRaceAsiGeneric: (asi: AbilityScores) => void;
  setChosenFightingStyle: (style: string | null) => void;
  setChosenSkills: (skills: Skill[]) => void;
  setChosenExpertise: (skills: Skill[]) => void;
  setAbilityScoreMethod: (method: BuilderDraft['abilityScoreMethod']) => void;
  setBaseScores: (scores: AbilityScores) => void;
  setRaceAsi: (asi: AbilityScores) => void;
  setBackgroundAsi: (asi: AbilityScores, choice: string) => void;
  setChosenPack: (key: string | null) => void;
  setUseStartingGold: (v: boolean) => void;
  setCustomEquipment: (items: EquipmentItem[]) => void;
  setChosenCantrips: (keys: string[]) => void;
  setChosenSpells: (keys: string[]) => void;
  setName: (name: string) => void;
  setDetails: (details: Partial<CharacterDetails>) => void;
  resetDraft: () => void;

  // Level-up
  startLevelUp: (characterId: string, targetClass: string, isNew: boolean) => void;
  clearLevelUp: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  immer((set) => ({
    draft: defaultDraft(),
    levelUpDraft: null,

    setStep: (step) => set(s => {
      s.draft.step = step;
      s.draft.visitedSteps.add(step);
    }),

    setRace: (key, variant = null) => set(s => {
      s.draft.race = key;
      s.draft.raceVariant = variant ?? null;
      s.draft.raceAsi = [...EMPTY_SCORES];
      s.draft.raceAsiGeneric = [...EMPTY_SCORES];
    }),

    setClass: (key) => set(s => {
      s.draft.classKey = key;
      s.draft.startingLevel = 1;
      s.draft.startingSubclassKey = null;
      s.draft.levelAsi = [...EMPTY_SCORES];
      s.draft.chosenInvocations = [];
      s.draft.chosenFeats = [];
      s.draft.chosenFightingStyle = null;
      s.draft.chosenSkills = [];
      s.draft.chosenExpertise = [];
    }),

    setStartingLevel:       (level) => set(s => { s.draft.startingLevel = level; }),
    setStartingSubclass:    (key)   => set(s => { s.draft.startingSubclassKey = key; }),
    setLevelAsi:            (asi)   => set(s => { s.draft.levelAsi = asi; }),
    setChosenInvocations:   (keys)  => set(s => { s.draft.chosenInvocations = keys; }),
    setChosenFeats:         (keys)  => set(s => { s.draft.chosenFeats = keys; }),
    setRaceAsiGeneric:      (asi)   => set(s => { s.draft.raceAsiGeneric = asi; }),
    setChosenFightingStyle: (style) => set(s => { s.draft.chosenFightingStyle = style; }),
    setChosenSkills:        (skills)=> set(s => { s.draft.chosenSkills = skills; }),
    setChosenExpertise:     (skills)=> set(s => { s.draft.chosenExpertise = skills; }),

    setBackground: (key) => set(s => {
      s.draft.background = key;
      s.draft.backgroundVariant = null;
      s.draft.backgroundAsi = [...EMPTY_SCORES];
      s.draft.backgroundAsiChoice = null;
    }),

    setBackgroundVariant: (key) => set(s => {
      s.draft.backgroundVariant = key;
    }),

    setAbilityScoreMethod: (method) => set(s => {
      s.draft.abilityScoreMethod = method;
      if (method === 'standard-array') s.draft.baseScores = [15, 14, 13, 12, 10, 8];
      else if (method === 'point-buy') s.draft.baseScores = [8, 8, 8, 8, 8, 8];
    }),

    setBaseScores: (scores) => set(s => { s.draft.baseScores = scores; }),
    setRaceAsi:    (asi)    => set(s => { s.draft.raceAsi = asi; }),

    setBackgroundAsi: (asi, choice) => set(s => {
      s.draft.backgroundAsi = asi;
      s.draft.backgroundAsiChoice = choice;
    }),

    setChosenPack:       (key)   => set(s => { s.draft.chosenPackKey = key; }),
    setUseStartingGold:  (v)     => set(s => { s.draft.useStartingGold = v; }),
    setCustomEquipment:  (items) => set(s => { s.draft.customEquipment = items; }),
    setChosenCantrips:   (keys)  => set(s => { s.draft.chosenCantrips = keys; }),
    setChosenSpells:     (keys)  => set(s => { s.draft.chosenSpells = keys; }),
    setName:             (name)  => set(s => { s.draft.name = name; }),

    setDetails: (details) => set(s => {
      Object.assign(s.draft.details, details);
    }),

    resetDraft: () => set(s => { s.draft = defaultDraft(); }),

    startLevelUp: (characterId, targetClass, isNew) => set(s => {
      s.levelUpDraft = { characterId, targetClassKey: targetClass, isNewClass: isNew, choices: [], step: 1 };
    }),

    clearLevelUp: () => set(s => { s.levelUpDraft = null; }),
  })),
);

// ─── Computed: final resolved ability scores ──────────────────────────────────
export function resolveFinalScores(draft: BuilderDraft): AbilityScores {
  return draft.baseScores.map((base, i) =>
    Math.min(20, base + draft.raceAsi[i] + (draft.raceAsiGeneric?.[i] ?? 0) + draft.backgroundAsi[i] + draft.levelAsi[i])
  ) as AbilityScores;
}

// ─── Computed: is a step complete enough to proceed? ─────────────────────────
export function stepIsComplete(draft: BuilderDraft, step: number): boolean {
  switch (step) {
    case 1: return draft.race !== null;
    case 2: return draft.classKey !== null;
    case 3: return draft.background !== null;
    case 4: return true; // always have scores
    case 5: return true; // equipment is optional
    case 6: return true; // spells optional until confirmed
    case 7: return draft.name.trim().length > 0;
    case 8: return true;
    default: return false;
  }
}
