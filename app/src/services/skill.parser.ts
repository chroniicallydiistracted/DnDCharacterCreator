import { ALL_SKILLS, type Skill } from '../types/character';

/** Parse MPMB skillstxt like "Choose 2: Athletics, Acrobatics, Stealth, or Perception" */
export function parseSkillChoice(text: string | undefined): { count: number; options: Skill[] } {
  if (!text) return { count: 0, options: [] };

  const countMatch = text.match(/choose\s+(\w+)/i);
  let count = 1;
  if (countMatch) {
    const word = countMatch[1].toLowerCase();
    const nums: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    count = (nums[word] ?? parseInt(word, 10)) || 1;
  }

  // "any" → all skills
  if (/any skill/i.test(text)) return { count, options: [...ALL_SKILLS] };

  const colonIdx = text.indexOf(':');
  const rawOptions = colonIdx >= 0 ? text.slice(colonIdx + 1) : text;

  const options: Skill[] = [];
  for (const skill of ALL_SKILLS) {
    if (rawOptions.toLowerCase().includes(skill.toLowerCase())) {
      options.push(skill);
    }
  }

  return { count, options: options.length ? options : [...ALL_SKILLS] };
}

/** Parse background scorestxt like "+2 and +1 -or- +1 to each from Intelligence, Wisdom, and Charisma" */
export interface BackgroundAsiOption {
  label: string;
  bonuses: Array<{ ability: string; value: number }>;
  playerChooses: boolean; // true = player picks which ability gets which value
}

export function parseBackgroundAsi(scorestxt: string[] | undefined): BackgroundAsiOption[] {
  if (!scorestxt?.length) return [];

  const results: BackgroundAsiOption[] = [];

  for (const line of scorestxt) {
    // Detect abilities listed in the text
    const abilityNames = ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'];
    const mentioned = abilityNames.filter(a => line.toLowerCase().includes(a.toLowerCase()));

    // "+2 and +1" style (player assigns from the listed abilities)
    const twoOne = line.match(/\+2.*?\+1/);
    if (twoOne && mentioned.length >= 2) {
      results.push({
        label: '+2 / +1 (player assigns)',
        bonuses: [
          { ability: 'choose', value: 2 },
          { ability: 'choose', value: 1 },
        ],
        playerChooses: true,
      });
    }

    // "+1 to each" style (all listed get +1)
    const allOne = line.match(/\+1\s+to\s+each/i);
    if (allOne && mentioned.length >= 2) {
      results.push({
        label: `+1 to each (${mentioned.join(', ')})`,
        bonuses: mentioned.map(a => ({ ability: a, value: 1 })),
        playerChooses: false,
      });
    }

    // Fallback: if we only got one option from parsing, offer both +2/+1 and +1/+1/+1
    if (results.length === 0 && mentioned.length >= 2) {
      results.push(
        { label: '+2 / +1', bonuses: [{ ability: 'choose', value: 2 }, { ability: 'choose', value: 1 }], playerChooses: true },
        { label: '+1 to each', bonuses: mentioned.map(a => ({ ability: a, value: 1 })), playerChooses: false },
      );
    }
  }

  return results.length ? results : [
    { label: '+2 / +1 (choose abilities)', bonuses: [{ ability: 'choose', value: 2 }, { ability: 'choose', value: 1 }], playerChooses: true },
    { label: '+1 / +1 / +1 (choose abilities)', bonuses: [{ ability: 'choose', value: 1 }, { ability: 'choose', value: 1 }, { ability: 'choose', value: 1 }], playerChooses: true },
  ];
}
