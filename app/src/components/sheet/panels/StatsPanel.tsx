import React from 'react';
import type { Character, DerivedStats } from '../../../types/character';
import { ABILITY_ABBR, ABILITY_NAMES, ALL_SKILLS, SKILL_ABILITY } from '../../../types/character';

interface Props {
  char: Character;
  derived: DerivedStats;
}

const SAVE_ABBR = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'];

export const StatsPanel = React.memo(function StatsPanel({ char, derived }: Props) {
  const mods = derived.abilityModifiers;

  return (
    <div className="space-y-4">
      {/* Ability Scores */}
      <div>
        <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">Ability Scores</div>
        <div className="grid grid-cols-3 gap-2">
          {ABILITY_ABBR.map((abbr, i) => (
            <div key={abbr} className="ability-box text-center">
              <div className="text-[9px] font-display uppercase text-stone tracking-wider">{abbr}</div>
              <div className="text-xl font-display text-dark-ink leading-none">{char.abilityScores[i]}</div>
              <div className="text-xs font-body text-stone">
                {mods[i] >= 0 ? '+' : ''}{mods[i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proficiency Bonus */}
      <div className="surface-parchment rounded px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-display uppercase tracking-wider text-stone">Proficiency Bonus</span>
        <span className="font-display text-gold text-sm">+{derived.proficiencyBonus}</span>
      </div>

      {/* Condition effect warnings */}
      {derived.disadvantageOnChecks && (
        <div className="surface-parchment rounded px-3 py-1.5 flex items-center gap-2">
          <span className="text-[10px] font-display uppercase tracking-wider text-crimson">⚠ Disadvantage on Ability Checks</span>
        </div>
      )}

      {/* Saving Throws */}
      <div>
        <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">Saving Throws</div>
        <div className="surface-parchment rounded divide-y divide-gold/10">
          {SAVE_ABBR.map((abbr, i) => {
            const val = derived.savingThrows[abbr] ?? mods[i];
            const hasProf = derived.saveProficiencies.includes(abbr);
            return (
              <div key={abbr} className="flex items-center gap-2 px-3 py-1.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasProf ? 'bg-gold' : 'bg-gold/30'}`} />
                <span className="flex-1 text-xs font-body text-dark-ink">{ABILITY_NAMES[i]}</span>
                <span className="text-xs font-display text-dark-ink">
                  {val >= 0 ? '+' : ''}{val}
                </span>
              </div>
            );
          })}
        </div>
        {/* Saving throw advantages from race/feats */}
        {char.saveAdvantages && char.saveAdvantages.length > 0 && (
          <div className="mt-2 px-2 py-1.5 bg-green-900/10 border border-green-700/30 rounded">
            <div className="text-[9px] font-display uppercase tracking-wider text-green-600 mb-1">Advantage on Saves vs</div>
            <div className="text-xs font-body text-green-700">
              {char.saveAdvantages.map((adv, i) => (
                <span key={i}>{i > 0 ? ', ' : ''}{adv}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-[10px] font-display uppercase tracking-wider text-stone">Skills</div>
          {derived.reliableTalent && (
            <span className="text-[9px] font-display uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 rounded px-1.5 py-0.5">
              Reliable Talent
            </span>
          )}
        </div>
        <div className="surface-parchment rounded divide-y divide-gold/10">
          {ALL_SKILLS.map(skill => {
            const bonus    = derived.skillBonuses[skill] ?? mods[SKILL_ABILITY[skill]];
            const isProf   = char.skills.includes(skill);
            const isExpert = char.expertise.includes(skill);
            return (
              <div key={skill} className="flex items-center gap-2 px-3 py-1">
                <ProfDot prof={isExpert ? 'expertise' : isProf ? 'proficient' : 'none'} />
                <span className="flex-1 text-xs font-body text-dark-ink">{skill}</span>
                <span className="text-[10px] font-display text-stone uppercase tracking-wider mr-1">
                  {ABILITY_ABBR[SKILL_ABILITY[skill]]}
                </span>
                {derived.reliableTalent && isProf && (
                  <span className="text-[8px] font-display text-gold/70" title="Reliable Talent: min 10 on d20">RT</span>
                )}
                <span className="text-xs font-display text-dark-ink w-6 text-right">
                  {bonus >= 0 ? '+' : ''}{bonus}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Passive Senses */}
      <div className="surface-parchment rounded divide-y divide-gold/10">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-display uppercase tracking-wider text-stone">Passive Perception</span>
          <span className="font-display text-dark-ink text-sm">{derived.passivePerception}</span>
        </div>
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-display uppercase tracking-wider text-stone">Passive Investigation</span>
          <span className="font-display text-dark-ink text-sm">{derived.passiveInvestigation}</span>
        </div>
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-display uppercase tracking-wider text-stone">Passive Insight</span>
          <span className="font-display text-dark-ink text-sm">{derived.passiveInsight}</span>
        </div>
      </div>
    </div>
  );
});

function ProfDot({ prof }: { prof: 'none' | 'proficient' | 'expertise' }) {
  return (
    <div className={`
      w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center
      ${prof === 'expertise' ? 'bg-gold border-gold'
        : prof === 'proficient' ? 'bg-gold/40 border-gold'
        : 'border-stone/30 bg-transparent'}
    `}>
      {prof === 'expertise' && <span className="text-[6px] text-shadow">✦</span>}
    </div>
  );
}
