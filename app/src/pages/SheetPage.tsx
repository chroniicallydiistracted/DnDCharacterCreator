import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { characterRepository } from '../services/character.repository';
import type { Character } from '../types/character';
import { AppShell } from '../components/layout/AppShell';
import { CharacterSheet } from '../components/sheet/CharacterSheet';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export function SheetPage() {
  const { id }           = useParams<{ id: string }>();
  const navigate         = useNavigate();
  const [char, setChar]  = useState<Character | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    let cancelled = false;
    characterRepository.get(id).then(c => {
      if (cancelled) return;
      if (c) setChar(c);
      else   setNotFound(true);
    });
    return () => { cancelled = true; };
  }, [id]);

  if (notFound) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-4">
          <div className="font-display text-display-sm text-stone uppercase tracking-wider">
            Character not found
          </div>
          <Button variant="secondary" onClick={() => navigate('/')}>← Back to Roster</Button>
        </div>
      </AppShell>
    );
  }

  if (!char) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
          <Spinner size="lg" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CharacterSheet character={char} />
    </AppShell>
  );
}
