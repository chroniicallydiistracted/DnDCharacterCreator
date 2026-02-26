import { useCharacterStore, stepIsComplete } from '../../store/character.store';
import { Button } from '../ui/Button';
import { Step1Race }          from './steps/Step1_Race';
import { Step2Class }         from './steps/Step2_Class';
import { Step3Background }    from './steps/Step3_Background';
import { Step4AbilityScores } from './steps/Step4_AbilityScores';
import { Step5Equipment }     from './steps/Step5_Equipment';
import { Step6Spells }        from './steps/Step6_Spells';
import { Step7Details }       from './steps/Step7_Details';
import { Step8Review }        from './steps/Step8_Review';

const STEPS = [
  { num: 1, label: 'Race',     icon: '🧬' },
  { num: 2, label: 'Class',    icon: '⚔️' },
  { num: 3, label: 'Origin',   icon: '📜' },
  { num: 4, label: 'Ability',  icon: '💪' },
  { num: 5, label: 'Gear',     icon: '🎒' },
  { num: 6, label: 'Spells',   icon: '✨' },
  { num: 7, label: 'Details',  icon: '📝' },
  { num: 8, label: 'Review',   icon: '⭐' },
];

const STEP_COMPONENTS = [
  null,
  Step1Race, Step2Class, Step3Background, Step4AbilityScores,
  Step5Equipment, Step6Spells, Step7Details, Step8Review,
];

export function BuilderWizard() {
  const { draft, setStep } = useCharacterStore();
  const CurrentStep = STEP_COMPONENTS[draft.step];

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      {/* Chapter-tab navigation */}
      <div className="
        bg-gradient-to-b from-leather/95 to-leather/70
        border-b-2 border-gold/30
        shadow-[0_2px_8px_rgba(13,6,0,0.4)]
      ">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {STEPS.map(step => {
              const visited = draft.visitedSteps.has(step.num);
              const active  = draft.step === step.num;
              const done    = visited && stepIsComplete(draft, step.num) && step.num < draft.step;
              return (
                <button
                  key={step.num}
                  onClick={() => { if (visited) setStep(step.num); }}
                  className={`
                    step-tab whitespace-nowrap
                    ${active  ? 'active'   : ''}
                    ${visited && !active ? 'visited' : ''}
                    ${!visited ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="step-num">
                    {done ? '✓' : step.num}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.icon}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 animate-fade-in">
        {CurrentStep ? <CurrentStep /> : null}
      </div>

      {/* Bottom nav */}
      <div className="
        border-t border-gold/20
        bg-gradient-to-t from-shadow/60 to-transparent
        px-4 py-4
      ">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setStep(draft.step - 1)}
            disabled={draft.step <= 1}
          >
            ← Back
          </Button>

          <div className="font-display text-xs text-stone uppercase tracking-wider">
            Step {draft.step} of {STEPS.length}
          </div>

          {draft.step < STEPS.length ? (
            <Button
              variant="primary"
              onClick={() => setStep(draft.step + 1)}
              disabled={!stepIsComplete(draft, draft.step)}
            >
              Next →
            </Button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
