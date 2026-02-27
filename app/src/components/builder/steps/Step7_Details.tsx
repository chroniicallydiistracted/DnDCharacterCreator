import { useEffect, useState } from 'react';
import type { DndBackground } from '../../../types/data';
import DataService from '../../../services/data.service';
import { useCharacterStore } from '../../../store/character.store';
import { Input, Textarea } from '../../ui/Input';
import { Divider } from '../../ui/Divider';
import type { Alignment } from '../../../types/character';

const ALIGNMENTS: Alignment[] = [
  'Lawful Good',    'Neutral Good',    'Chaotic Good',
  'Lawful Neutral', 'True Neutral',    'Chaotic Neutral',
  'Lawful Evil',    'Neutral Evil',    'Chaotic Evil',
];

const ALIGNMENT_COLORS: Record<string, string> = {
  Good: 'border-blue-600/40 bg-blue-900/10 text-blue-300',
  Neutral: 'border-stone/40 bg-stone/10 text-stone',
  Evil: 'border-crimson/40 bg-crimson/10 text-crimson-light',
};

function alignmentColor(a: string) {
  const col = a.includes('Good') ? 'Good' : a.includes('Evil') ? 'Evil' : 'Neutral';
  return ALIGNMENT_COLORS[col];
}

function RandomButton({ label, onPick }: { label: string; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="text-[10px] font-display uppercase tracking-wider text-gold/70 hover:text-gold transition-colors ml-auto"
    >
      🎲 {label}
    </button>
  );
}

export function Step7Details() {
  const [bg, setBg] = useState<DndBackground | null>(null);
  const { draft, setName, setDetails } = useCharacterStore();

  useEffect(() => {
    if (draft.background) {
      DataService.getBackgrounds()
        .then(all => setBg(all.find(b => b._key === draft.background) ?? null));
    }
  }, [draft.background]);

  function randomFrom(arr?: string[]) {
    if (!arr?.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const det = draft.details;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-display-lg text-gold text-shadow">Character Details</h2>
        <p className="text-sm font-body text-stone mt-1">Give your character a name, appearance, and personality.</p>
      </div>

      {/* Name */}
      <div>
        <Input
          label="Character Name *"
          value={draft.name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter a name…"
        />
      </div>

      {/* Alignment grid */}
      <div>
        <div className="text-xs font-display uppercase tracking-wider text-stone mb-2">Alignment</div>
        <div className="grid grid-cols-3 gap-2">
          {ALIGNMENTS.map(a => (
            <button
              key={a}
              onClick={() => setDetails({ alignment: a })}
              className={`
                px-2 py-2 rounded border text-[11px] font-display transition-all
                ${det.alignment === a
                  ? 'border-gold bg-gold/20 text-gold shadow-[inset_0_0_0_1px_rgba(201,168,71,0.5)]'
                  : `${alignmentColor(a)} hover:border-opacity-70`}
              `}
            >{a}</button>
          ))}
        </div>
      </div>

      <Divider label="Appearance" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Input label="Age"    value={det.age ?? ''}    onChange={e => setDetails({ age: e.target.value })} placeholder="e.g. 28" />
        <Input label="Gender" value={det.gender ?? ''} onChange={e => setDetails({ gender: e.target.value })} placeholder="Any" />
        <Input label="Height" value={det.height ?? ''} onChange={e => setDetails({ height: e.target.value })} placeholder={`e.g. 5'10"`} />
        <Input label="Weight" value={det.weight ?? ''} onChange={e => setDetails({ weight: e.target.value })} placeholder="e.g. 180 lb" />
        <Input label="Eyes"   value={det.eyes ?? ''}   onChange={e => setDetails({ eyes: e.target.value })} placeholder="e.g. Blue" />
        <Input label="Hair"   value={det.hair ?? ''}   onChange={e => setDetails({ hair: e.target.value })} placeholder="e.g. Black" />
        <Input label="Skin"   value={det.skin ?? ''}   onChange={e => setDetails({ skin: e.target.value })} placeholder="e.g. Tanned" />
      </div>

      <Textarea
        label="Appearance / Description"
        value={det.appearance ?? ''}
        onChange={e => setDetails({ appearance: e.target.value })}
        placeholder="Describe how your character looks…"
      />

      <Divider label="Personality" />

      <div className="space-y-3">
        <div className="flex items-end justify-between mb-1">
          <span className="text-xs font-display uppercase tracking-wider text-stone">Personality Trait</span>
          {bg?.trait?.length && (
            <RandomButton label="Random" onPick={() => setDetails({ personalityTraits: randomFrom(bg.trait) })} />
          )}
        </div>
        <Textarea value={det.personalityTraits ?? ''} onChange={e => setDetails({ personalityTraits: e.target.value })} placeholder="How does your character behave?" />
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between mb-1">
          <span className="text-xs font-display uppercase tracking-wider text-stone">Ideal</span>
          {bg?.ideal?.length && (
            <RandomButton label="Random" onPick={() => setDetails({ ideals: randomFrom(bg.ideal?.map(entry => Array.isArray(entry) ? entry[1] ?? entry[0] : String(entry))) })} />
          )}
        </div>
        <Textarea value={det.ideals ?? ''} onChange={e => setDetails({ ideals: e.target.value })} placeholder="What principle does your character believe in?" />
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between mb-1">
          <span className="text-xs font-display uppercase tracking-wider text-stone">Bond</span>
          {bg?.bond?.length && (
            <RandomButton label="Random" onPick={() => setDetails({ bonds: randomFrom(bg.bond) })} />
          )}
        </div>
        <Textarea value={det.bonds ?? ''} onChange={e => setDetails({ bonds: e.target.value })} placeholder="What connects your character to the world?" />
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between mb-1">
          <span className="text-xs font-display uppercase tracking-wider text-stone">Flaw</span>
          {bg?.flaw?.length && (
            <RandomButton label="Random" onPick={() => setDetails({ flaws: randomFrom(bg.flaw) })} />
          )}
        </div>
        <Textarea value={det.flaws ?? ''} onChange={e => setDetails({ flaws: e.target.value })} placeholder="What is your character's weakness?" />
      </div>

      <Divider label="Backstory" />
      <Textarea
        label="Character Backstory"
        value={det.backstory ?? ''}
        onChange={e => setDetails({ backstory: e.target.value })}
        placeholder="Write your character's history and origin…"
        className="min-h-[120px]"
      />
    </div>
  );
}
