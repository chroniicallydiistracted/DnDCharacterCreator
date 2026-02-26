import { useState } from 'react';
import type { Character, CharacterDetails } from '../../../types/character';

interface Props {
  char: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

interface NoteField {
  key: keyof CharacterDetails;
  label: string;
  rows?: number;
}

const NOTE_FIELDS: NoteField[] = [
  { key: 'personalityTraits', label: 'Personality Traits',   rows: 3 },
  { key: 'ideals',            label: 'Ideals',               rows: 2 },
  { key: 'bonds',             label: 'Bonds',                rows: 2 },
  { key: 'flaws',             label: 'Flaws',                rows: 2 },
  { key: 'backstory',         label: 'Backstory',            rows: 6 },
  { key: 'allies',            label: 'Allies & Organizations', rows: 3 },
  { key: 'treasure',          label: 'Treasure & Valuables', rows: 2 },
  { key: 'notes',             label: 'Additional Notes',     rows: 6 },
];

/** Editable tag list for languages and tool proficiencies */
function TagList({
  label,
  tags,
  onChange,
}: {
  label: string;
  tags: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function addTag() {
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed)) { setInput(''); return; }
    onChange([...tags, trimmed]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div>
      <label className="block text-[10px] font-display uppercase tracking-wider text-stone mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {tags.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-gold/10 border border-gold/30 rounded px-2 py-0.5 text-xs font-body text-dark-ink"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-stone/60 hover:text-crimson transition-colors leading-none"
              title="Remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add ${label.toLowerCase()}…`}
          className="
            flex-1 bg-parchment border border-gold/30 rounded px-2 py-1
            font-body text-xs text-dark-ink placeholder:text-stone/40
            focus:outline-none focus:border-gold/60
          "
        />
        <button
          onClick={addTag}
          disabled={!input.trim()}
          className="px-2 py-1 text-xs font-display text-gold border border-gold/40 rounded hover:bg-gold/20 transition-colors disabled:opacity-30"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function NotesPanel({ char, onUpdate }: Props) {
  function handleChange(key: keyof CharacterDetails, value: string) {
    onUpdate({ details: { ...char.details, [key]: value } });
  }

  return (
    <div className="space-y-4">
      {/* Languages */}
      <TagList
        label="Languages"
        tags={char.languages ?? []}
        onChange={langs => onUpdate({ languages: langs })}
      />

      {/* Tool Proficiencies */}
      <TagList
        label="Tool Proficiencies"
        tags={char.toolProficiencies ?? []}
        onChange={tools => onUpdate({ toolProficiencies: tools })}
      />

      {/* Text note fields */}
      {NOTE_FIELDS.map(({ key, label, rows }) => (
        <div key={key}>
          <label className="block text-[10px] font-display uppercase tracking-wider text-stone mb-1">
            {label}
          </label>
          <textarea
            value={(char.details[key] as string | undefined) ?? ''}
            onChange={e => handleChange(key, e.target.value)}
            rows={rows ?? 3}
            placeholder={`${label}…`}
            className="
              w-full bg-parchment border border-gold/30 rounded px-3 py-2
              font-body text-sm text-dark-ink placeholder:text-stone/40
              resize-y focus:outline-none focus:border-gold/60
            "
          />
        </div>
      ))}
    </div>
  );
}
