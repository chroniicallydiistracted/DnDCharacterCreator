import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterRepository, generateId, downloadCharacterJson, importCharacterJson } from '../services/character.repository';
import { computeDerivedStats } from '../services/character.calculator';
import DataService from '../services/data.service';
import type { Character } from '../types/character';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export function HomePage() {
  const navigate    = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading]       = useState(true);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [classNames, setClassNames] = useState<Record<string, string>>({});
  const [raceNames, setRaceNames]   = useState<Record<string, string>>({});
  const [search, setSearch]         = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      characterRepository.list(),
      DataService.getClasses(),
      DataService.getRaces(),
    ]).then(([chars, classes, races]) => {
      setCharacters(chars);
      const cn: Record<string, string> = {};
      classes.forEach(c => { cn[c._key] = c.name; });
      setClassNames(cn);
      const rn: Record<string, string> = {};
      races.forEach(r => { rn[r._key] = r.name; });
      setRaceNames(rn);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    await characterRepository.delete(id);
    setCharacters(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  }

  async function handleDuplicate(char: Character) {
    const now = new Date().toISOString();
    const copy: Character = {
      ...char,
      id:        generateId(),
      name:      `${char.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    await characterRepository.save(copy);
    setCharacters(prev => [...prev, copy]);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const imported = await importCharacterJson(text);
      setCharacters(prev => [...prev, imported]);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function classLabel(char: Character) {
    return char.classes
      .map(cc => `${classNames[cc.classKey] ?? cc.classKey} ${cc.level}`)
      .join(' / ');
  }

  const filtered = characters.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = c.name.toLowerCase();
    const race = (raceNames[c.race] ?? c.race).toLowerCase();
    const cls  = c.classes.map(cc => (classNames[cc.classKey] ?? cc.classKey).toLowerCase()).join(' ');
    return name.includes(q) || race.includes(q) || cls.includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="font-display text-stone uppercase tracking-wider text-xs animate-pulse">
          Loading roster…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Hero section */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-display-xl text-gold text-shadow">
          Character Roster
        </h1>
        <p className="font-body text-stone text-sm">
          Your adventurers await. Begin a new tale or continue an existing one.
        </p>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant="primary" size="lg" onClick={() => navigate('/builder')}>
          + New Character
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          title="Import a character JSON file"
        >
          ↑ Import JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {importError && (
        <div className="text-center text-sm font-body text-crimson border border-crimson/30 rounded px-3 py-2 bg-crimson/5">
          {importError}
        </div>
      )}

      {/* Search bar */}
      {characters.length > 0 && (
        <div>
          <input
            type="text"
            placeholder="Search by name, race, or class…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="
              w-full px-4 py-2 rounded border border-gold/30 bg-parchment
              font-body text-sm text-dark-ink placeholder:text-stone/40
              focus:outline-none focus:border-gold/60
            "
          />
        </div>
      )}

      {/* Character cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="font-display text-display-sm text-stone/50 uppercase tracking-wider">
            {search ? 'No characters match your search' : 'No characters yet'}
          </div>
          {!search && (
            <p className="text-sm font-body text-stone/40 mt-2">
              Create your first adventurer to begin.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(char => {
            const derived = computeDerivedStats(char);
            const hp      = char.currentHp ?? derived.maxHp;
            const hpPct   = derived.maxHp > 0 ? (hp / derived.maxHp) * 100 : 0;

            return (
              <Card
                key={char.id}
                hoverable
                onClick={() => navigate(`/sheet/${char.id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Class icon */}
                  <div className="w-12 h-12 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center flex-shrink-0 text-xl">
                    {classIcon(char.classes[0]?.classKey ?? '')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-display-sm text-dark-ink truncate">
                      {char.name || '(Unnamed)'}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                      <Badge color="gold">{raceNames[char.race] ?? char.race}</Badge>
                      <Badge color="stone">{classLabel(char)}</Badge>
                    </div>
                    {char.details.alignment && (
                      <div className="text-[10px] font-body text-stone/60 mt-0.5 italic">
                        {char.details.alignment}
                      </div>
                    )}
                  </div>

                  {/* HP tracker */}
                  <div className="text-center flex-shrink-0">
                    <div className="text-[9px] font-display uppercase tracking-wider text-stone">HP</div>
                    <div className="font-display text-crimson-light text-sm">{hp} <span className="text-stone text-[10px]">/ {derived.maxHp}</span></div>
                    <div className="w-16 h-1 bg-shadow/30 rounded-full mt-0.5">
                      <div className="h-1 rounded-full bg-crimson transition-all" style={{ width: `${hpPct}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/sheet/${char.id}`)}
                      className="text-[10px] font-display uppercase tracking-wider text-gold hover:text-gold/70 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDuplicate(char)}
                      className="text-[10px] font-display uppercase tracking-wider text-stone hover:text-gold transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => downloadCharacterJson(char)}
                      className="text-[10px] font-display uppercase tracking-wider text-stone hover:text-gold transition-colors"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => setDeleteId(char.id)}
                      className="text-[10px] font-display uppercase tracking-wider text-stone hover:text-crimson transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <Modal title="Delete Character?" onClose={() => setDeleteId(null)} size="sm">
          <p className="text-sm font-body text-stone mb-4">
            This will permanently delete{' '}
            <strong>{characters.find(c => c.id === deleteId)?.name ?? 'this character'}</strong>.
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(deleteId)}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function classIcon(classKey: string): string {
  const icons: Record<string, string> = {
    barbarian: '🪓', bard: '🎵', cleric: '⛪', druid: '🌿',
    fighter: '⚔️', monk: '🥋', paladin: '🛡️', ranger: '🏹',
    rogue: '🗡️', sorcerer: '💫', warlock: '👁️', wizard: '📚',
    artificer: '⚙️',
  };
  return icons[classKey] ?? '⚔️';
}
