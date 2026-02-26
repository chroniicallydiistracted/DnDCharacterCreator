import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataService from '../../../services/data.service';
import { characterRepository, generateId } from '../../../services/character.repository';
import type { EquipmentItem, Skill } from '../../../types/character';
import { useCharacterStore, resolveFinalScores } from '../../../store/character.store';
import { computeDerivedStats, abilityMod } from '../../../services/character.calculator';
import { ABILITY_ABBR } from '../../../types/character';
import type { Character, CharacterClass } from '../../../types/character';
import type { DndClass, DndRace, DndBackground, DndPack } from '../../../types/data';
import { Button } from '../../ui/Button';
import { Divider } from '../../ui/Divider';
import { Badge } from '../../ui/Badge';
import { Spinner } from '../../ui/Spinner';

const HIT_DICE: Record<string, number> = {
  barbarian: 12, fighter: 10, paladin: 10, ranger: 10,
  bard: 8, cleric: 8, druid: 8, monk: 8, rogue: 8, warlock: 8,
  artificer: 8, sorcerer: 6, wizard: 6,
};

/** Build the hpPerLevel array for levels 1 through startingLevel. */
function buildHpPerLevel(classKey: string, startingLevel: number, conMod: number): number[] {
  const hd = HIT_DICE[classKey] ?? 8;
  const avgPerLevel = Math.floor(hd / 2) + 1 + conMod;
  return Array.from({ length: startingLevel }, (_, i) =>
    i === 0 ? Math.max(1, hd + conMod) : Math.max(1, avgPerLevel)
  );
}

export function Step8Review() {
  const navigate = useNavigate();
  const { draft, resetDraft } = useCharacterStore();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [race, setRace]         = useState<DndRace | null>(null);
  const [cls, setCls]           = useState<DndClass | null>(null);
  const [bg, setBg]             = useState<DndBackground | null>(null);
  const [pack, setPack]         = useState<DndPack | null>(null);
  const [spellNames, setSpellNames] = useState<Record<string, string>>({});
  const [subclassName, setSubclassName] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const needSpells = draft.chosenCantrips.length + draft.chosenSpells.length > 0;
    Promise.all([
      draft.race       ? DataService.getRaces().then(all => all.find(r => r._key === draft.race) ?? null) : null,
      draft.classKey   ? DataService.getClasses().then(all => all.find(c => c._key === draft.classKey) ?? null) : null,
      draft.background ? DataService.getBackgrounds().then(all => all.find(b => b._key === draft.background) ?? null) : null,
      draft.chosenPackKey ? DataService.getPacks().then(all => all.find(p => p._key === draft.chosenPackKey) ?? null) : null,
      needSpells ? DataService.getSpells() : Promise.resolve([]),
      draft.startingSubclassKey ? DataService.getSubclasses().then(all => all.find(s => s._key === draft.startingSubclassKey) ?? null) : Promise.resolve(null),
    ]).then(([r, c, b, p, spells, sub]) => {
      setRace(r ?? null);
      setCls(c ?? null);
      setBg(b ?? null);
      setPack(p ?? null);
      setSubclassName((sub as { subname?: string } | null)?.subname ?? null);
      if (Array.isArray(spells) && spells.length > 0) {
        const names: Record<string, string> = {};
        spells.forEach(s => { names[s._key] = s.name; });
        setSpellNames(names);
      }
      setLoading(false);
    });
  }, [draft.race, draft.classKey, draft.background, draft.chosenPackKey, draft.chosenCantrips.length, draft.chosenSpells.length, draft.startingSubclassKey]);

  const finalScores   = resolveFinalScores(draft);
  const conMod        = abilityMod(finalScores[2]);
  const hd            = HIT_DICE[draft.classKey ?? ''] ?? 8;
  const startingLevel = draft.startingLevel;
  const hpPerLevel    = buildHpPerLevel(draft.classKey ?? 'fighter', startingLevel, conMod);
  const totalHp       = hpPerLevel.reduce((sum, hp) => sum + hp, 0);

  const previewChar: Character = {
    id: 'preview',
    name: draft.name,
    race: draft.race ?? '',
    raceVariant: draft.raceVariant,
    classes: draft.classKey ? [{ classKey: draft.classKey, level: startingLevel, subclassKey: draft.startingSubclassKey, hpPerLevel }] : [],
    totalLevel: startingLevel,
    background: draft.background ?? '',
    abilityScores: finalScores,
    abilityScoreMethod: draft.abilityScoreMethod,
    skills: [],
    expertise: [],
    chosenCantrips: draft.chosenCantrips,
    chosenSpells:   draft.chosenSpells,
    equipment:      draft.customEquipment,
    gold:           bg?.gold ?? 0,
    details:        { alignment: '', ...draft.details },
    createdAt: '', updatedAt: '',
  };
  const derived = computeDerivedStats(previewChar);

  async function handleBeginAdventure() {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const classEntry: CharacterClass = {
        classKey:    draft.classKey ?? 'fighter',
        level:       startingLevel,
        subclassKey: draft.startingSubclassKey,
        hpPerLevel,
      };

      // Build equipment list from pack + background + custom
      const allEquipment: EquipmentItem[] = [];
      if (pack) {
        for (const [name, qty, weight] of pack.items) {
          allEquipment.push({
            name: String(name),
            quantity: Number(qty) || 1,
            weight: Number(weight) || undefined,
            source: 'pack',
          });
        }
      }
      for (const row of [...(bg?.equipleft ?? []), ...(bg?.equipright ?? [])]) {
        allEquipment.push({
          name: String(row[0]),
          quantity: Number(row[1]) || 1,
          weight: Number(row[2]) || undefined,
          source: 'background',
        });
      }
      for (const item of draft.customEquipment) {
        allEquipment.push({ ...item, source: 'custom' });
      }

      // Merge background skills + chosen class skills (deduplicated)
      const bgSkills = (bg?.skills ?? []) as Skill[];
      const allSkills = Array.from(new Set([...bgSkills, ...draft.chosenSkills]));

      // Class entry with fighting style if applicable
      const classEntryWithStyle: CharacterClass = {
        ...classEntry,
        fightingStyle: draft.chosenFightingStyle ?? undefined,
        expertiseSkills: draft.chosenExpertise.length > 0 ? draft.chosenExpertise : undefined,
      };

      // Languages from race/background (fixed strings only; numbers = "choose N" handled separately)
      const raceLangs = race?.languageProfs?.filter((l): l is string => typeof l === 'string') ?? [];
      const bgLangs   = bg?.languageProfs?.filter((l): l is string => typeof l === 'string') ?? [];

      // Tool proficiencies from background
      function extractToolNames(profs: (string | unknown)[] | undefined): string[] {
        if (!profs) return [];
        return profs.flatMap(entry => {
          if (typeof entry === 'string') return [entry];
          if (Array.isArray(entry) && entry.length > 0 && typeof entry[0] === 'string') return [entry[0]];
          return [];
        });
      }
      const bgTools  = extractToolNames(bg?.toolProfs as (string | unknown)[] | undefined);
      // Class toolProfs data is {primary: [...], secondary: [...]} despite the type definition
      const clsToolsRaw = (cls?.toolProfs as unknown as { primary?: unknown[] } | undefined);
      const clsTools = extractToolNames(clsToolsRaw?.primary as (string | unknown)[] | undefined);

      const char: Character = {
        id:                  generateId(),
        name:                draft.name.trim(),
        race:                draft.race ?? '',
        raceVariant:         draft.raceVariant,
        classes:             [classEntryWithStyle],
        totalLevel:          startingLevel,
        background:          draft.background ?? '',
        abilityScores:       finalScores,
        abilityScoreMethod:  draft.abilityScoreMethod,
        skills:              allSkills,
        expertise:           draft.chosenExpertise,
        chosenCantrips:      draft.chosenCantrips,
        chosenSpells:        draft.chosenSpells,
        equipment:           allEquipment,
        gold:                bg?.gold ?? 0,
        currency:            { cp: 0, sp: 0, ep: 0, gp: bg?.gold ?? 0, pp: 0 },
        details:             { alignment: '', ...draft.details },
        currentHp:           totalHp,
        tempHp:              0,
        hitDiceUsed:         [0],
        slotsUsed:           [0,0,0,0,0,0,0,0,0,0],
        deathSaveSuccesses:  0,
        deathSaveFailures:   0,
        xp:                  0,
        raceSpeed:           race?.speed?.walk?.spd ?? 30,
        chosenInvocations:   draft.chosenInvocations.length > 0 ? draft.chosenInvocations : undefined,
        feats:               draft.chosenFeats.length > 0 ? draft.chosenFeats : undefined,
        languages:           [...new Set([...raceLangs, ...bgLangs])],
        toolProficiencies:   [...new Set([...bgTools, ...clsTools])],
        createdAt:           now,
        updatedAt:           now,
      };
      await characterRepository.save(char);
      resetDraft();
      navigate(`/sheet/${char.id}`);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const raceName = race?.name  ?? draft.race        ?? '—';
  const clsName  = cls?.name   ?? draft.classKey    ?? '—';
  const bgName   = bg?.name    ?? draft.background  ?? '—';
  const levelBadge = `${clsName} ${startingLevel}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-display-lg text-gold text-shadow">Review & Begin</h2>
        <p className="text-sm font-body text-stone mt-1">
          Your character is ready. Review your choices, then begin your adventure.
        </p>
      </div>

      {/* Identity card */}
      <div className="surface-parchment rounded p-4 space-y-3">
        <h3 className="font-display text-display-md text-dark-ink">
          {draft.name || <span className="text-stone italic">(Unnamed)</span>}
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge color="gold">{raceName}</Badge>
          <span className="text-stone text-xs font-display">·</span>
          <Badge color="stone">{levelBadge}</Badge>
          {subclassName && (
            <>
              <span className="text-stone text-xs font-display">·</span>
              <Badge color="crimson">{subclassName}</Badge>
            </>
          )}
          <span className="text-stone text-xs font-display">·</span>
          <Badge color="stone">{bgName}</Badge>
          {draft.details.alignment && (
            <>
              <span className="text-stone text-xs font-display">·</span>
              <span className="text-xs font-body text-stone italic">{draft.details.alignment}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ability Scores */}
        <div className="surface-parchment rounded p-4">
          <div className="text-xs font-display uppercase tracking-wider text-stone mb-3">Ability Scores</div>
          <div className="grid grid-cols-3 gap-2">
            {ABILITY_ABBR.map((abbr, i) => (
              <div key={abbr} className="ability-box text-center">
                <div className="text-[9px] font-display uppercase text-stone tracking-wider">{abbr}</div>
                <div className="text-xl font-display text-dark-ink leading-none">{finalScores[i]}</div>
                <div className="text-xs font-body text-stone">
                  {derived.abilityModifiers[i] >= 0 ? '+' : ''}{derived.abilityModifiers[i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="surface-parchment rounded p-4">
          <div className="text-xs font-display uppercase tracking-wider text-stone mb-3">At Level {startingLevel}</div>
          <div className="grid grid-cols-3 gap-2">
            <ReviewStat label="Max HP"   value={String(totalHp)} />
            <ReviewStat label="AC"       value={String(derived.ac)} />
            <ReviewStat label="Init"     value={(derived.initiative >= 0 ? '+' : '') + derived.initiative} />
            <ReviewStat label="Speed"    value={`${race?.speed?.walk?.spd ?? 30} ft`} />
            <ReviewStat label="Hit Die"  value={`d${hd}`} />
            <ReviewStat label="Prof. B." value={'+' + derived.proficiencyBonus} />
          </div>
        </div>
      </div>

      {/* Spells */}
      {(draft.chosenCantrips.length > 0 || draft.chosenSpells.length > 0) && (
        <>
          <Divider label="Spells" />
          <div className="surface-parchment rounded p-4 space-y-3">
            {draft.chosenCantrips.length > 0 && (
              <div>
                <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">
                  Cantrips ({draft.chosenCantrips.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {draft.chosenCantrips.map(k => (
                    <Badge key={k} color="blue">{spellNames[k] ?? k}</Badge>
                  ))}
                </div>
              </div>
            )}
            {draft.chosenSpells.length > 0 && (
              <div>
                <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-2">
                  Prepared Spells ({draft.chosenSpells.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {draft.chosenSpells.map(k => (
                    <Badge key={k} color="stone">{spellNames[k] ?? k}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Eldritch Invocations */}
      {draft.chosenInvocations.length > 0 && (
        <>
          <Divider label="Eldritch Invocations" />
          <div className="surface-parchment rounded p-4">
            <div className="flex flex-wrap gap-1">
              {draft.chosenInvocations.map(k => (
                <Badge key={k} color="stone">{k.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Equipment */}
      {(pack || draft.customEquipment.length > 0) && (
        <>
          <Divider label="Equipment" />
          <div className="surface-parchment rounded p-4 text-sm font-body">
            {pack && (
              <div className="mb-2">
                <span className="font-semibold text-dark-ink">{pack.name}: </span>
                <span className="text-stone">
                  {pack.items.slice(0, 8).map(([name, qty]) =>
                    qty && Number(qty) > 1 ? `${name} ×${qty}` : name
                  ).join(', ')}
                  {pack.items.length > 8 ? '…' : ''}
                </span>
              </div>
            )}
            {bg?.equipleft && (
              <div className="text-stone text-xs">
                Background equipment included
              </div>
            )}
            {bg?.gold != null && (
              <div className="text-stone text-xs mt-1">Starting gold: {bg.gold} gp</div>
            )}
          </div>
        </>
      )}

      {/* Personality */}
      {(draft.details.personalityTraits || draft.details.ideals || draft.details.bonds || draft.details.flaws) && (
        <>
          <Divider label="Personality" />
          <div className="surface-parchment rounded p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {draft.details.personalityTraits && <ReviewDetail label="Trait"  value={draft.details.personalityTraits} />}
            {draft.details.ideals            && <ReviewDetail label="Ideal"  value={draft.details.ideals} />}
            {draft.details.bonds             && <ReviewDetail label="Bond"   value={draft.details.bonds} />}
            {draft.details.flaws             && <ReviewDetail label="Flaw"   value={draft.details.flaws} />}
          </div>
        </>
      )}

      {/* Backstory */}
      {draft.details.backstory && (
        <>
          <Divider label="Backstory" />
          <div className="surface-parchment rounded p-4 text-sm font-body text-dark-ink leading-relaxed line-clamp-4">
            {draft.details.backstory}
          </div>
        </>
      )}

      {/* Proficiency Summary */}
      {(() => {
        const ARMOR_LABELS = ['Light armor', 'Medium armor', 'Heavy armor', 'Shields'];
        const WEAPON_CATS  = ['Simple weapons', 'Martial weapons'];
        const armorProfs = cls?.armorProfs?.primary?.flatMap((v, i) => v === true && ARMOR_LABELS[i] ? [ARMOR_LABELS[i]] : []) ?? [];
        const weaponProfs: string[] = [];
        (cls?.weaponProfs?.primary as (boolean | string[])[])?.forEach((v, i) => {
          if (v === true && WEAPON_CATS[i]) weaponProfs.push(WEAPON_CATS[i]);
          else if (Array.isArray(v)) weaponProfs.push(...v.map(String));
        });
        const raceLangChoices = race?.languageProfs?.find((l): l is number => typeof l === 'number') ?? 0;
        const bgLangChoices   = bg?.languageProfs?.find((l): l is number => typeof l === 'number') ?? 0;
        const langChoices = raceLangChoices + bgLangChoices;
        const fixedLangs  = [...new Set([
          ...(race?.languageProfs?.filter((l): l is string => typeof l === 'string') ?? []),
          ...(bg?.languageProfs?.filter((l): l is string => typeof l === 'string') ?? []),
        ])];
        const bgToolsPreview = (() => {
          if (!bg?.toolProfs) return [];
          return (bg.toolProfs as (string | unknown)[]).flatMap(e =>
            typeof e === 'string' ? [e] : Array.isArray(e) && typeof e[0] === 'string' ? [e[0]] : []
          );
        })();
        const clsToolsPreview = (() => {
          const raw = (cls?.toolProfs as unknown as { primary?: unknown[] } | undefined);
          if (!raw?.primary) return [];
          return raw.primary.flatMap(e =>
            typeof e === 'string' ? [e] : Array.isArray(e) && typeof e[0] === 'string' ? [e[0]] : []
          );
        })();
        const allToolsPreview = [...new Set([...bgToolsPreview, ...clsToolsPreview])];
        const hasAny = fixedLangs.length > 0 || langChoices > 0 || allToolsPreview.length > 0 || weaponProfs.length > 0 || armorProfs.length > 0;
        if (!hasAny) return null;
        return (
          <>
            <Divider label="Proficiencies" />
            <div className="surface-parchment rounded p-4 space-y-3 text-sm font-body">
              {(fixedLangs.length > 0 || langChoices > 0) && (
                <div>
                  <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-1">Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {fixedLangs.map(l => <Badge key={l} color="stone">{l}</Badge>)}
                    {langChoices > 0 && <Badge color="stone">+ {langChoices} of your choice</Badge>}
                  </div>
                </div>
              )}
              {allToolsPreview.length > 0 && (
                <div>
                  <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-1">Tool Proficiencies</div>
                  <div className="flex flex-wrap gap-1">
                    {allToolsPreview.map(t => <Badge key={t} color="stone">{t}</Badge>)}
                  </div>
                </div>
              )}
              {weaponProfs.length > 0 && (
                <div>
                  <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-1">Weapon Proficiencies</div>
                  <div className="flex flex-wrap gap-1">
                    {weaponProfs.map(w => <Badge key={w} color="stone">{w}</Badge>)}
                  </div>
                </div>
              )}
              {armorProfs.length > 0 && (
                <div>
                  <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-1">Armor Proficiencies</div>
                  <div className="flex flex-wrap gap-1">
                    {armorProfs.map(a => <Badge key={a} color="stone">{a}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* Begin Adventure */}
      <div className="flex justify-center pt-6 pb-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleBeginAdventure}
          loading={saving}
        >
          ⚔️ Begin Adventure
        </Button>
      </div>
    </div>
  );
}

function ReviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center bg-parchment/50 rounded border border-gold/20 py-2 px-1">
      <div className="text-[9px] font-display uppercase tracking-wider text-stone">{label}</div>
      <div className="text-base font-display text-dark-ink leading-tight">{value}</div>
    </div>
  );
}

function ReviewDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-display uppercase tracking-wider text-stone mb-0.5">{label}</div>
      <div className="text-dark-ink text-xs font-body leading-relaxed">{value}</div>
    </div>
  );
}
