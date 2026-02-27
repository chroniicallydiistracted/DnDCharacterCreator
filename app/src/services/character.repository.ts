import type { Character } from '../types/character';

// ─── Repository interface (swap LocalStorage → API with no component changes) ──
export interface CharacterRepository {
  list(): Promise<Character[]>;
  get(id: string): Promise<Character | null>;
  save(char: Character): Promise<void>;
  delete(id: string): Promise<void>;
}

// ─── LocalStorage implementation ──────────────────────────────────────────────
const LS_KEY = 'dnd_characters';

function readAll(): Character[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const chars = JSON.parse(raw) as Character[];
    // Migrate legacy data shapes
    let dirty = false;
    for (const c of chars) {
      // Migrate gold → currency (gold field removed)
      const legacy = c as unknown as Record<string, unknown>;
      if (!c.currency && typeof legacy['gold'] === 'number') {
        c.currency = { cp: 0, sp: 0, ep: 0, gp: legacy['gold'] as number, pp: 0 };
        delete legacy['gold'];
        dirty = true;
      } else if (!c.currency) {
        c.currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
        dirty = true;
      }
      // Migrate attuned from string[] (item names) → number[] (equipment indices)
      if (Array.isArray(c.attuned) && c.attuned.length > 0 && typeof c.attuned[0] === 'string') {
        const nameAttuned = c.attuned as unknown as string[];
        c.attuned = nameAttuned
          .map(name => c.equipment.findIndex(e => e.name === name))
          .filter(idx => idx >= 0);
        dirty = true;
      }
    }
    if (dirty) writeAll(chars);
    return chars;
  } catch {
    return [];
  }
}

function writeAll(chars: Character[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(chars));
}

export const LocalStorageRepository: CharacterRepository = {
  async list() {
    return readAll();
  },

  async get(id) {
    return readAll().find(c => c.id === id) ?? null;
  },

  async save(char) {
    const all = readAll();
    const idx = all.findIndex(c => c.id === char.id);
    const updated = { ...char, updatedAt: new Date().toISOString() };
    if (idx >= 0) all[idx] = updated;
    else all.push(updated);
    writeAll(all);
  },

  async delete(id) {
    writeAll(readAll().filter(c => c.id !== id));
  },
};

// ─── Active repository (swap here when backend is ready) ──────────────────────
export const characterRepository: CharacterRepository = LocalStorageRepository;

// ─── UUID helper ──────────────────────────────────────────────────────────────
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Export / Import JSON ─────────────────────────────────────────────────────

/** Trigger a browser file download of the character JSON. */
export function downloadCharacterJson(char: Character): void {
  const json = JSON.stringify(char, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${char.name.replace(/\s+/g, '_') || 'character'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse a JSON string and import it as a new character (fresh ID + timestamps).
 * Throws on invalid JSON or missing required fields.
 */
export async function importCharacterJson(json: string): Promise<Character> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON file.');
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error('Not a valid character file.');
  }
  const obj = data as Record<string, unknown>;

  // Validate required fields
  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    throw new Error('Character must have a name.');
  }
  if (!Array.isArray(obj.classes) || obj.classes.length === 0) {
    throw new Error('Character must have at least one class.');
  }
  if (!Array.isArray(obj.abilityScores) || obj.abilityScores.length !== 6) {
    throw new Error('Character must have 6 ability scores.');
  }
  if (typeof obj.totalLevel !== 'number' || obj.totalLevel < 1 || obj.totalLevel > 20) {
    throw new Error('Character totalLevel must be between 1 and 20.');
  }
  if (typeof obj.race !== 'string') {
    throw new Error('Character must have a race.');
  }
  if (typeof obj.background !== 'string') {
    throw new Error('Character must have a background.');
  }

  const char = data as Character;
  const now  = new Date().toISOString();
  const imported: Character = {
    ...char,
    id:        generateId(),
    createdAt: now,
    updatedAt: now,
  };
  await characterRepository.save(imported);
  return imported;
}
