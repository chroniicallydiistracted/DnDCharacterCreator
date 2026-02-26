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
    return raw ? (JSON.parse(raw) as Character[]) : [];
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
  if (typeof data !== 'object' || data === null || !('name' in data)) {
    throw new Error('Not a valid character file.');
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
