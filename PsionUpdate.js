/* -WHAT IS THIS?-
This file adds the updated Psion class from Unearthed Arcana 2025 to "MPMB's Character Record Sheet"
Import this file using the "Add Extra Materials" bookmark.

Subject: Class - Psion Update
Effect: This script adds the updated "Psion" class and its subclasses from UA 2025
Code by: Updated from Rocky's original
Date: 2025-10-07 (sheet v13)
*/

var iFileName = "Psion_UA2025_Updated.js";
RequiredSheetVersion("13.2.0");

SourceList["UA25P"] = {
    name: "Unearthed Arcana 2025 - Psion Update",
    abbreviation: "UA25P",
    abbreviationSpellsheet: "P",
    group: "Unearthed Arcana",
    date: "2025/10/07",
    url: "https://media.dndbeyond.com/compendium-images/ua/psion-update/kZh2hf4yC7KS45wW/UA2025-Psion+Update.pdf",
};

// Add new spells to spell list
SpellsList["telekinetic fling"] = {
    name: "Telekinetic Fling",
    classes: ["psion"],
    source: ["UA25P", 5],
    level: 0,
    school: "Evoc",
    time: "1 a",
    range: "60 ft",
    components: "S",
    duration: "Instantaneous",
    description: "1 object 1-5 lbs within 10 ft wreathed in psionic energy; ranged spell atk 1d10 Force dmg; object falls undamaged",
    descriptionCantripDie: "Ranged spell attack; `CD`d10 Force dmg; object falls undamaged after",
    descriptionFull: "Choose one nonmagical object weighing 1 to 5 pounds within 10 feet of you that isn't being worn or carried to wreathe in psionic energy and fire at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Force damage. On a hit or miss, the object falls to the ground undamaged.\n\n" + "Cantrip Upgrade: The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
};

SpellsList["life siphon"] = {
    name: "Life Siphon",
    classes: ["psion"],
    source: ["UA25P", 12],
    level: 1,
    school: "Evoc",
    time: "1 a",
    range: "120 ft",
    components: "S",
    duration: "Instantaneous",
    description: "Ranged spell atk 1d10 Psychic dmg; can expend 1 HD to add 1d10 dmg; +1d10 and +1 HD per SL",
    descriptionFull: "You fire an orb of psionic energy fueled by your life force at a creature you can see within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Psychic damage and you can expend one Hit Point Die to increase the damage by 1d10.\n\n" + "Using a Higher-Level Spell Slot: The damage increases by 1d10 and the number of Hit Dice you can expend increases by one for each spell slot level above 1."
};

SpellsList["sanctuary"] = {
    name: "Sanctuary",
    classes: ["artificer", "cleric", "psion"],
    source: [["P", 272], ["UA25P", 5]],
    level: 1,
    school: "Abjur",
    time: "1 bns",
    range: "30 ft",
    components: "V,S,M",
    compMaterial: "A small silver mirror",
    duration: "1 min",
    save: "Wis",
    description: "1 crea; attackers must save or choose new target or lose atk/spell; breaks if target attacks/casts spell",
    descriptionFull: "You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw. On a failed save, the creature must choose a new target or lose the attack or spell. This spell doesn't protect the warded creature from area effects, such as the explosion of a fireball.\n   If the warded creature makes an attack, casts a spell that affects an enemy, or deals damage to another creature, this spell ends."
};

SpellsList["shield"] = {
    name: "Shield",
    classes: ["psion", "sorcerer", "wizard"],
    source: [["P", 275], ["UA25P", 5]],
    level: 1,
    school: "Abjur",
    time: "1 rea",
    timeFull: "1 reaction, which you take when you are hit by an attack or targeted by the magic missile spell",
    range: "Self",
    components: "V,S",
    duration: "1 rnd",
    description: "+5 AC until start of next turn; negates magic missile",
    descriptionFull: "An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile."
};

SpellsList["thunderwave"] = {
    name: "Thunderwave",
    classes: ["bard", "druid", "psion", "sorcerer", "wizard"],
    source: [["P", 282], ["UA25P", 5]],
    level: 1,
    school: "Evoc",
    time: "1 a",
    range: "S:15-ft cube",
    components: "V,S",
    duration: "Instantaneous",
    save: "Con",
    description: "All creatures 2d8 Thunder dmg and pushed 10 ft away; save halves and not pushed; unsecured objects pushed",
    descriptionFull: "A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn't pushed.\n   In addition, unsecured objects that are completely within the area of effect are automatically pushed 10 feet away from you by the spell's effect, and the spell emits a thunderous boom audible out to 300 feet.\n\n" + AtHigherLevels + "When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st."
};

SpellsList["ectoplasmic trail"] = {
    name: "Ectoplasmic Trail",
    classes: ["psion", "warlock"],
    source: ["UA25P", 11],
    level: 2,
    school: "Necro",
    time: "1 bns",
    range: "Self",
    components: "V,S",
    duration: "Instantaneous",
    description: "Move through occupied spaces; creatures entered take 2d8 Necrotic dmg at start of turn, speed -10; +10ft spd/SL",
    descriptionFull: "You cloak yourself in spirits that leave ectoplasm in your wake until the end of your turn. While cloaked, you can move through occupied spaces as if they were Difficult Terrain, and moving doesn't provoke Opportunity Attacks. If you end your turn in such a space, you are returned to the last unoccupied space you were in.\n   While cloaked, whenever you enter the space of a creature, the creature becomes covered in ectoplasm until the end of your next turn. A creature covered in ectoplasm has its Speed reduced by 10 feet and takes 2d8 Necrotic damage at the start of its turn. A creature can be covered in ectoplasm only once during a turn.\n\n" + "Using a Higher-Level Spell Slot: While cloaked, your Speed increases by 10 feet for each spell slot level above 2."
};

SpellsList["ego whip"] = {
    name: "Ego Whip",
    classes: ["psion"],
    source: ["UA25P", 11],
    level: 2,
    school: "Ench",
    time: "1 rea",
    timeFull: "1 reaction, which you take when a creature you can see within 30 feet of yourself makes a Charisma-based ability check or saving throw",
    range: "120 ft",
    components: "V",
    duration: "Instantaneous",
    save: "Cha",
    description: "Target subtracts 1d8 from Cha check/save; no save",
    descriptionFull: "The creature makes Charisma saving throw. On a failed save, the target must subtract 1d8 from the ability check or saving throw."
};

SpellsList["tasha's mind whip"] = {
    name: "Tasha's Mind Whip",
    classes: ["psion", "sorcerer", "wizard"],
    source: ["UA25P", 15],
    level: 2,
    school: "Ench",
    time: "1 a",
    range: "90 ft",
    components: "V",
    duration: "Instantaneous",
    save: "Int",
    description: "1+1/SL crea 3d6 Psychic dmg, no opportunity atks, choose move/action/bonus on next turn; save halves no other effect",
    descriptionFull: "You psychically lash out at one creature you can see within range. The target must make an Intelligence saving throw. On a failed save, the target takes 3d6 Psychic damage and can't make Opportunity Attacks until the end of its next turn. On its next turn, it must choose whether it gets a move, an action, or a Bonus Action; it gets only one of the three. On a successful save, the target takes half as much damage only.\n\n" + "Using a Higher-Level Spell Slot: You can target one additional creature for each spell slot level above 2."
};

SpellsList["bleeding darkness"] = {
    name: "Bleeding Darkness",
    classes: ["psion", "warlock", "wizard"],
    source: ["UA25P", 11],
    level: 3,
    school: "Evoc",
    time: "1 a",
    range: "60 ft",
    components: "V,S,M\u0192",
    compMaterial: "a vial of rare ink worth 50+ GP",
    duration: "Conc, 1 min",
    save: "Con",
    description: "10-ft sphere above; pours darkness in 10-ft rad 40-ft cyl; diff ter; 3d8 Cold dmg, blinded; move sphere 20ft; +1d8/SL",
    descriptionFull: "You create an inky void in a 10-foot-radius Sphere at a point you can see above yourself within range. When you cast the spell, magical Darkness pours from the sphere, filling a 10-foot-radius, 40-foot-tall Cylinder originating from the Sphere until the start of your next turn. The Cylinder is Difficult Terrain, and no light—magical or otherwise—can illuminate the area. When the Darkness appears, each creature in the area must succeed on a Constitution saving throw or take 3d8 Cold damage and have the Blinded condition until the end of its next turn. A creature also makes this save when it enters the spell's area for the first time on a turn or ends its turn there. A creature makes this save only once per turn.\n   Until the spell ends, you can take a Magic action to move the Sphere up to 20 feet horizontally and cause the Sphere to pour magical Darkness until the start of your next turn.\n\n" + "Using a Higher-Level Spell Slot: The damage increases by 1d8 for each spell slot level above 3."
};

SpellsList["enemies abound"] = {
    name: "Enemies Abound",
    classes: ["bard", "psion", "sorcerer", "warlock", "wizard"],
    source: ["UA25P", 12],
    level: 3,
    school: "Ench",
    time: "1 a",
    range: "120 ft",
    components: "V,S",
    duration: "Conc, 1 min",
    save: "Int",
    description: "1 crea frightened, regards all as enemies, random targets, must opportunity atk; save each time takes dmg",
    descriptionFull: "Choose a creature you can see within range. The target must succeed on an Intelligence saving throw or have the Frightened condition for the duration. While Frightened, the target loses the ability to distinguish friend from foe and is affected in the following ways:\n • The target regards all creatures it can see as enemies.\n • Whenever the target chooses a creature other than itself for an attack, spell, or other ability, it must choose at random from among the creatures it can see within range of that attack, spell, or other ability.\n • The target must make an Opportunity Attack each time it is able to.\n   Each time the target takes damage, it makes another Intelligence saving throw. On a successful save, the spell ends."
};

SpellsList["intellect fortress"] = {
    name: "Intellect Fortress",
    classes: ["artificer", "bard", "psion", "sorcerer", "warlock", "wizard"],
    source: ["UA25P", 12],
    level: 3,
    school: "Abjur",
    time: "1 a",
    range: "30 ft",
    components: "V",
    duration: "Conc, 1 h",
    description: "1+1/SL willing crea gains Psychic resist, adv on Int/Wis/Cha saves",
    descriptionFull: "For the duration, one willing creature you can see within range has Resistance to Psychic damage as well as Advantage on Intelligence, Wisdom, and Charisma saving throws.\n\n" + "Using a Higher-Level Spell Slot: You can target one additional creature for each spell slot level above 3."
};

SpellsList["summon astral entity"] = {
    name: "Summon Astral Entity",
    classes: ["psion", "sorcerer", "warlock", "wizard"],
    source: ["UA25P", 14],
    level: 3,
    school: "Conj",
    time: "1 a",
    range: "90 ft",
    components: "V,S,M\u0192",
    compMaterial: "a gem or crystal worth 300+ GP",
    duration: "Conc, 1 h",
    description: "Summon psionic spirit; Crystal/Ectoplasmic/Ghostly Entity; obeys commands; see book (300gp cons)",
    descriptionFull: "You call forth the spirit of a psionic entity. It manifests in an unoccupied space that you can see within range and uses the Psionic Spirit stat block. When you cast the spell, choose Crystal Entity, Ectoplasmic Entity, or Ghostly Entity. The creature resembles an astral entity of that kind, which determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n   The creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.\n\n" + "Using a Higher-Level Spell Slot: Use the spell slot's level for the spell's level in the stat block."
};

SpellsList["telekinetic crush"] = {
    name: "Telekinetic Crush",
    classes: ["psion", "sorcerer", "warlock"],
    source: ["UA25P", 15],
    level: 3,
    school: "Trans",
    time: "1 a",
    range: "120 ft",
    components: "V",
    duration: "Instantaneous",
    save: "Str",
    description: "30-ft cube; all crea 5d6 Force dmg and prone; save halves, no prone; +1d6/SL",
    descriptionFull: "You create a field of crushing telekinetic force in a 30-foot Cube within range. Each creature in the area makes a Strength saving throw. On a failed save, the target takes 5d6 Force damage and has the Prone condition. On a successful save, the target takes half as much damage only.\n\n" + "Using a Higher-Level Spell Slot: The damage increases by 1d6 for each spell slot level above 3."
};

SpellsList["life inversion field"] = {
    name: "Life Inversion Field",
    classes: ["cleric", "psion", "sorcerer"],
    source: ["UA25P", 12],
    level: 4,
    school: "Abjur",
    time: "1 a",
    range: "Self",
    components: "V,S",
    duration: "Conc, 1 min",
    save: "Con",
    description: "30-ft emanation; I regain 4d8 HP; when I regain HP, 1 crea in aura takes Necrotic dmg = half HP regained; +1d8/SL",
    descriptionFull: "An aura radiates from you in a 30-foot Emanation for the duration. When you create the aura, you regain 4d8 Hit Points. Whenever you regain Hit Points, you can choose a creature you can see in the aura and force it to make a Constitution saving throw. On a failed save, the creature takes Necrotic damage equal to half the amount of Hit Points you regained (round up). A creature makes this save only once per turn.\n\n" + "Using a Higher-Level Spell Slot: The healing increase by 1d8 for each spell slot level above 4."
};

SpellsList["raulothim's psychic lance"] = {
    name: "Raulothim's Psychic Lance",
    classes: ["bard", "psion", "sorcerer", "warlock", "wizard"],
    source: ["UA25P", 13],
    level: 4,
    school: "Ench",
    time: "1 a",
    range: "120 ft",
    components: "V",
    duration: "Instantaneous",
    save: "Int",
    description: "1 crea (or named) 7d6 Psychic dmg, incapacitated until start my next turn; save halves, no incapacitated; +1d6/SL",
    descriptionFull: "You unleash a shimmering lance of psychic power from your forehead at a creature that you can see within range. Alternatively, you can utter a creature's name (a pseudonym, title, or nickname doesn't work). If the named target is within range, it becomes the spell's target even if you can't see it. If the named target isn't within range or you use an invalid name, the lance dissipates without effect.\n   The target must make an Intelligence saving throw. On a failed save, the target takes 7d6 Psychic damage and has the Incapacitated condition until the start of your next turn. On a successful save, the target takes half as much damage only.\n\n" + "Using a Higher-Level Spell Slot: The damage increases by 1d6 for each spell slot level above 4."
};

SpellsList["mental prison"] = {
    name: "Mental Prison",
    classes: ["bard", "psion", "sorcerer", "wizard"],
    source: ["UA25P", 13],
    level: 6,
    school: "Illus",
    time: "1 a",
    range: "60 ft",
    components: "S",
    duration: "Conc, 1 min",
    save: "Int",
    description: "1 crea 8d10 Psychic dmg, charmed, restrained in illusion; save half, spell ends; moved/atk through: 5d10, ends",
    descriptionFull: "You attempt to bind a creature within an illusory cell that only it perceives. One creature you can see within range must succeed on an Intelligence saving throw or take 8d10 Psychic damage and have the Charmed condition for the duration. On a successful save, the target takes half damage only and the spell ends.\n   While Charmed, the target has the Restrained condition and perceives the area around its space as dangerous to it in some way you create. You might cause the target to perceive itself as being surrounded by fire, floating razors, or hideous maws filled with dripping teeth. Whatever form the illusion takes, the target can't see or hear anything beyond it. If the target is moved from the illusion, makes a melee attack through it, or reaches any part of its body through it, the target takes 5d10 Psychic damage and the spell ends."
};

SpellsList["psionic blast"] = {
    name: "Psionic Blast",
    classes: ["psion", "wizard"],
    source: ["UA25P", 13],
    level: 6,
    school: "Evoc",
    time: "1 a",
    range: "S:60-ft cone",
    components: "V,S,M",
    duration: "Instantaneous",
    save: "Int",
    description: "60-ft cone all crea 6d8 Psychic dmg, stunned until start my next turn; save half, not stunned; +1d8/SL",
    descriptionFull: "You unleash a concussive burst of psionic energy. Each creature in a 60-foot Cone originating from you makes an Intelligence saving throw. On a failed save, the creature takes 6d8 Psychic damage and has the Stunned condition until the start of your next turn. On a successful save, the creature takes half as much damage only.\n\n" + "Using a Higher-Level Spell Slot: The damage increases by 1d8 for each spell slot level above 6."
};

SpellsList["thought form"] = {
    name: "Thought Form",
    classes: ["psion"],
    source: ["UA25P", 15],
    level: 6,
    school: "Trans",
    time: "1 bns",
    range: "Self",
    components: "V,M\u0192",
    compMaterial: "brain matter in a vessel worth 500+ GP",
    duration: "Conc, 1 min",
    description: "Transform into psionic spirit; Poison/Psychic immune, fly 60ft hover, pass through creatures; Psionic Recharge",
    descriptionFull: "You briefly transform into a psionic spirit. You gain the following benefits until the spell ends.\n   Ghostly Form: You have Immunity to Poison and Psychic damage, and you have Immunity to the Exhaustion condition.\n   Incorporeal Movement: You have a Fly Speed of 60 feet and can hover. You can move through occupied spaces as if they were Difficult Terrain. If you end your turn in such a space, you take 1d10 Force damage. If the spell ends in such a space, you are returned to the last unoccupied space you were in.\n   Psionic Recharge: As a Magic action, you can touch a creature (which can be yourself) and roll 1d6. The creature regains one expended spell slot, the level of which equals half the number rolled (round up) or lower. Once a creature regains a spell slot from this spell, that creature can't do so again until it finishes a Long Rest."
};

SpellsList["abi-dalzim's horrid wilting"] = {
    name: "Abi-Dalzim's Horrid Wilting",
    classes: ["psion", "sorcerer", "wizard"],
    source: ["UA25P", 11],
    level: 8,
    school: "Necro",
    time: "1 a",
    range: "150 ft",
    components: "V,S,M",
    compMaterial: "a bit of sponge",
    duration: "Instantaneous",
    save: "Con",
    description: "30-ft cube; all crea 12d8 Necrotic dmg; save halves; Constructs auto save, Plants auto fail; plants wither",
    descriptionFull: "You draw the moisture from every creature in a 30-foot Cube centered on a point within range. Each creature in that area makes a Constitution saving throw, taking 12d8 Necrotic damage on a failed save or half as much damage on a successful one. Constructs automatically succeed at the save, and Plant creatures automatically fail the save.\n   Nonmagical plants in the area that aren't creatures, such as trees and shrubs, wither and die instantly."
};

SpellsList["psychic scream"] = {
    name: "Psychic Scream",
    classes: ["bard", "psion", "sorcerer", "warlock"],
    source: ["UA25P", 13],
    level: 9,
    school: "Ench",
    time: "1 a",
    range: "90 ft",
    components: "S",
    duration: "Instantaneous",
    save: "Int",
    description: "10 crea (Int>2) 14d6 Psychic dmg, stunned; save halves, not stunned; repeat save end turn; 0HP head explodes",
    descriptionFull: "You unleash the power of your mind to blast the intellect of up to ten creatures of your choice that you can see within range. Creatures that have an Intelligence score of 2 or lower are unaffected.\n   Each target must make an Intelligence saving throw. On a failed save, the target takes 14d6 Psychic damage and has the Stunned condition. On a successful save, the target takes half as much damage only. If the target is reduced to 0 Hit Points by this damage, its head explodes if it has one.\n   At the end of each of its turns, the Stunned target repeats the save, ending the condition on itself on a success."
};

// Add all spells to Psion spell list
[
    // Cantrips
    "blade ward", "dancing lights", "friends", "light", "mage hand", "mending", "message",
    "mind sliver", "minor illusion", "prestidigitation", "telekinetic fling", "true strike",
    
    // 1st Level
    "animal friendship", "charm person", "command", "comprehend languages", "detect magic",
    "dissonant whispers", "feather fall", "identify", "jump", "life siphon", "longstrider",
    "mage armor", "sanctuary", "shield", "silent image", "sleep", "speak with animals",
    "tasha's hideous laughter", "tenser's floating disk", "thunderwave",
    
    // 2nd Level
    "animal messenger", "blindness/deafness", "calm emotions", "crown of madness", "detect thoughts",
    "ectoplasmic trail", "ego whip", "enhance ability", "enlarge/reduce", "enthrall", "heat metal",
    "hold person", "invisibility", "knock", "levitate", "locate animals or plants", "locate object",
    "magic mouth", "mind spike", "mirror image", "phantasmal force", "see invisibility", "shatter",
    "silence", "suggestion", "tasha's mind whip", "zone of truth",
    
    // 3rd Level
    "bestow curse", "bleeding darkness", "clairvoyance", "dispel magic", "enemies abound", "fear",
    "fly", "hypnotic pattern", "intellect fortress", "major image", "nondetection", "sending",
    "summon astral entity", "telekinetic crush", "tongues",
    
    // 4th Level
    "arcane eye", "banishment", "charm monster", "compulsion", "confusion", "dimension door",
    "freedom of movement", "greater invisibility", "hallucinatory terrain", "life inversion field",
    "locate creature", "phantasmal killer", "polymorph", "raulothim's psychic lance", "summon aberration",
    
    // 5th Level
    "animate objects", "awaken", "contact other plane", "dominate person", "dream", "geas",
    "hold monster", "legend lore", "mislead", "modify memory", "rary's telepathic bond", "scrying",
    "seeming", "synaptic static", "telekinesis", "teleportation circle",
    
    // 6th Level
    "blade barrier", "disintegrate", "eyebite", "find the path", "mass suggestion", "mental prison",
    "move earth", "otto's irresistible dance", "programmed illusion", "psionic blast", "thought form",
    "true seeing",
    
    // 7th Level
    "etherealness", "forcecage", "mirage arcane", "plane shift", "power word fortify", "project image",
    "reverse gravity", "teleport",
    
    // 8th Level
    "abi-dalzim's horrid wilting", "antimagic field", "antipathy/sympathy", "befuddlement",
    "dominate monster", "glibness", "maze", "mind blank", "power word stun", "telepathy",
    
    // 9th Level
    "astral projection", "foresight", "power word heal", "power word kill", "psychic scream",
    "shapechange", "time stop", "weird"

].forEach(function (s) {
    if (SpellsList[s] && SpellsList[s].classes && SpellsList[s].classes.indexOf("psion") === -1)
        SpellsList[s].classes.push("psion");
});

// Main Psion Class
ClassList["psion"] = {
    regExpSearch: /psion/i,
    name: "Psion",
    source: ["UA25P", 1],
    primaryAbility: "Intelligence",
    abilitySave: 4,
    prereqs: "Intelligence 13",
    die: 6,
    saves: ["Int", "Wis"],
    skillstxt: {
        primary: "Choose 2 from Arcana, Insight, Intimidation, Investigation, Medicine, Perception, Persuasion"
    },
    armorProfs: {
        primary: [false, false, false, false]
    },
    weaponProfs: {
        primary: [true, false]
    },
    equipment: "Psion starting equipment:" +
        "\n \u2022 Spear, 2 daggers, light crossbow, 20 bolts, case, dungeoneer's pack, and 6 GP;" +
        "\n \u2022 Or 50 GP to buy your equipment.",
    subclasses: ["Psion Subclass", []],
    attacks: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    spellcastingFactor: 1,
    spellcastingKnown: {
        cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        spells: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]
    },
    features: {
        "spellcasting": {
            name: "Spellcasting",
            source: ["UA25P", 3],
            minlevel: 1,
            description: desc([
                "I can cast prepared psion spells using Intelligence as my spellcasting ability",
                "Psionic Spellcasting: My psion spells don't require Verbal or Material components",
                "Exception: Material components that are consumed or have a cost specified"
            ]),
            additional: levels.map(function (n, idx) {
                return [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4][idx] + " cantrips known";
            })
        },
        "psionic power": {
            name: "Psionic Power",
            source: ["UA25P", 2],
            minlevel: 1,
            description: desc([
                "I have Psionic Energy Dice that fuel my psionic abilities",
                "I regain 1 expended die on a short rest, all on a long rest",
                "Telekinetic Propel: Bonus action, target Large or smaller creature within 30 ft",
                "  Target makes Str save or moved 5 ft toward/away from me",
                "  Can roll 1 die: distance = 5 ft × roll; die expended only if target fails save",
                "Telepathic Connection: I have 30 ft telepathy",
                "  Bonus action, roll 1 die: increase telepathy range by 10 ft × roll for 1 hour",
                "  First use after long rest doesn't expend die; all other times expends die"
            ]),
            additional: levels.map(function (n) {
                var dieSize = n < 5 ? "d6" : n < 11 ? "d8" : n < 17 ? "d10" : "d12";
                var dieCount = n < 5 ? 4 : n < 9 ? 6 : n < 13 ? 8 : n < 17 ? 10 : 12;
                return dieCount + dieSize + " dice";
            }),
            usages: levels.map(function (n) {
                return n < 5 ? 4 : n < 9 ? 6 : n < 13 ? 8 : n < 17 ? 10 : 12;
            }),
            recovery: "long rest",
            action: [["bonus action", "Telekinetic Propel"], ["bonus action", "Telepathic Connection"]],
            extraLimitedFeatures: [{
                name: "Psionic Energy Die (Short Rest)",
                usages: 1,
                recovery: "short rest"
            }]
        },
        "subtle telekinesis": {
            name: "Subtle Telekinesis",
            source: ["UA25P", 3],
            minlevel: 1,
            description: desc([
                "I know the Mage Hand cantrip",
                "I can cast it without Somatic components, and make the hand Invisible when cast"
            ]),
            spellcastingBonus: {
                name: "Subtle Telekinesis",
                spells: ["mage hand"],
                selection: ["mage hand"],
                firstCol: "atwill"
            },
            spellChanges: {
                "mage hand": {
                    components: "V",
                    description: "Invisible spectral hand can carry up to 10 lb; 1 a to control; can't attack/activate magic items/carry multiple items",
                    changes: "Using Subtle Telekinesis, I can cast Mage Hand without somatic components and make it invisible."
                }
            }
        },
        "psionic discipline": {
            name: "Psionic Discipline",
            source: ["UA25P", 3],
            minlevel: 2,
            description: desc([
                "I learn psionic techniques fueled by my Psionic Energy Dice",
                "I can use only one Discipline per turn and only once per turn",
                "I can replace one discipline when I gain a psion level"
            ]),
            additional: levels.map(function (n) {
                return n < 2 ? "" : n < 5 ? "2 disciplines" : n < 10 ? "3 disciplines" : n < 13 ? "4 disciplines" : n < 17 ? "5 disciplines" : "6 disciplines";
            }),
            extraTimes: levels.map(function (n) {
                return n < 2 ? 0 : n < 5 ? 2 : n < 10 ? 3 : n < 13 ? 4 : n < 17 ? 5 : 6;
            }),
            extraname: "Psionic Discipline",
            extrachoices: ["Biofeedback", "Bolstering Precognition", "Destructive Thoughts", "Devilish Tongue", "Expanded Awareness", "Id Insinuation", "Inerrant Aim", "Observant Mind", "Psionic Backlash", "Psionic Guards", "Sharpened Mind"],
            "biofeedback": {
                name: "Biofeedback",
                source: ["UA25P", 4],
                description: desc([
                    "When I cast a Necromancy or Transmutation psion spell, I can expend Psionic Energy Dice",
                    "Up to my Int mod; roll them and gain temp HP = total + Int mod (min 1)"
                ])
            },
            "bolstering precognition": {
                name: "Bolstering Precognition",
                source: ["UA25P", 4],
                description: desc([
                    "When I cast an Abjuration or Divination psion spell, I can expend 1 Psionic Energy Die",
                    "Choose a creature within 60 ft (can be me); roll die, creature gains bonus to next D20 Test",
                    "Bonus = roll, lasts until end of my next turn"
                ])
            },
            "destructive thoughts": {
                name: "Destructive Thoughts",
                source: ["UA25P", 4],
                description: desc([
                    "When I cast Conjuration or Evocation psion spell forcing save, can expend Psionic Energy Dice",
                    "Up to my Int mod; creature takes Psychic dmg = total + Int mod regardless of save result"
                ])
            },
            "devilish tongue": {
                name: "Devilish Tongue",
                source: ["UA25P", 4],
                description: desc([
                    "When I take the Influence action, I can roll 1 Psionic Energy Die and add to check",
                    "Die expended only if this causes me to succeed on the check"
                ])
            },
            "expanded awareness": {
                name: "Expanded Awareness",
                source: ["UA25P", 4],
                description: desc([
                    "When I take the Search action, I can roll 1 Psionic Energy Die and add to check",
                    "Die expended only if this causes me to succeed on the check"
                ])
            },
            "id insinuation": {
                name: "Id Insinuation",
                source: ["UA25P", 4],
                description: desc([
                    "When I cast Enchantment or Illusion psion spell forcing save, expend 1 Psionic Energy Die",
                    "One target I can see subtracts half the roll (round up) from its save against the spell"
                ])
            },
            "inerrant aim": {
                name: "Inerrant Aim",
                source: ["UA25P", 5],
                description: desc([
                    "When I miss with an attack roll, I can roll 1 Psionic Energy Die and add to attack",
                    "Die expended only if this causes the attack to hit"
                ])
            },
            "observant mind": {
                name: "Observant Mind",
                source: ["UA25P", 5],
                description: desc([
                    "When I take the Study action, I can roll 1 Psionic Energy Die and add to check",
                    "Die expended only if this causes me to succeed on the check"
                ])
            },
            "psionic backlash": {
                name: "Psionic Backlash",
                source: ["UA25P", 5],
                description: desc([
                    "Reaction when creature I can see hits me with attack; expend 1 Psionic Energy Die",
                    "Roll it; reduce damage by 2 × roll + Int mod (min 2)",
                    "Attacker makes Wis save; fail: takes Psychic dmg = damage I reduced"
                ]),
                action: [["reaction", " (when hit)"]]
            },
            "psionic guards": {
                name: "Psionic Guards",
                source: ["UA25P", 5],
                description: desc([
                    "At start of my turn, expend 1 Psionic Energy Die for benefits until start of next turn:",
                    "Immunity to Charmed and Frightened; Advantage on Int saves",
                    "If Charmed or Frightened when used, condition ends; can use different discipline this turn"
                ])
            },
            "sharpened mind": {
                name: "Sharpened Mind",
                source: ["UA25P", 5],
                description: desc([
                    "At start of turn, expend 1 die to hone psionics; roll and record number for 1 min:",
                    "My weapon attacks, psion spells, psion features ignore Psychic resistance",
                    "Once per turn when dealing Psychic dmg, replace 1 damage die with recorded number",
                    "Can use different discipline this turn"
                ])
            }
        },
        "subclassfeature3": {
            name: "Psion Subclass",
            source: ["UA25P", 3],
            minlevel: 3,
            description: desc([
                "Choose a Psion Subclass to commit to and put it in the \"Class\" field",
                "Choose either Metamorph, Psykinetic, or Telepath"
            ])
        },
        "ability score improvement": {
            name: "Ability Score Improvement",
            source: ["UA25P", 4],
            minlevel: 4,
            description: desc([
                "I can increase one ability score by 2, or two ability scores by 1",
                "Alternatively, I can take a feat instead if the DM allows it"
            ]),
            additional: levels.map(function (n) {
                return n < 4 ? "" : (n < 8 ? 1 : n < 12 ? 2 : n < 16 ? 3 : 4) + " feat(s)/ASI(s)";
            })
        },
        "psionic restoration": {
            name: "Psionic Restoration",
            source: ["UA25P", 4],
            minlevel: 5,
            description: "I can meditate for 1 minute; at the end, I regain expended Psionic Energy Dice",
            usages: 1,
            recovery: "long rest"
        },
        "psionic surge": {
            name: "Psionic Surge",
            source: ["UA25P", 4],
            minlevel: 7,
            description: desc([
                "After rolling Psionic Energy Dice, I can expend 1 Hit Point Die",
                "Treat any roll of 1, 2, or 3 on those Psionic Energy Dice as a 4"
            ])
        },
        "psionic reserves": {
            name: "Psionic Reserves",
            source: ["UA25P", 4],
            minlevel: 18,
            description: "When I roll Initiative, I regain expended Psionic Energy Dice until I have 4"
        },
        "epic boon": {
            name: "Epic Boon",
            source: ["UA25P", 4],
            minlevel: 19,
            description: "I gain an Epic Boon feat or another feat of my choice for which I qualify"
        },
        "enkindled life force": {
            name: "Enkindled Life Force",
            source: ["UA25P", 4],
            minlevel: 20,
            description: desc([
                "Once per turn when I roll Psionic Energy Dice for psion feature or discipline:",
                "I can expend 1 or 2 Hit Point Dice",
                "For each HD expended, roll additional Psionic Energy Die and add to total",
                "These additional rolls don't expend the Psionic Energy Dice"
            ])
        }
    }
};

// Metamorph Subclass
AddSubClass("psion", "metamorph", {
    regExpSearch: /metamorph/i,
    subname: "Metamorph",
    source: ["UA25P", 7],
    features: {
        "subclassfeature3": {
            name: "Metamorph Spells",
            source: ["UA25P", 7],
            minlevel: 3,
            description: desc([
                "I always have certain spells prepared that don't count against spells prepared"
            ]),
            spellcastingExtra: ["alter self", "cure wounds", "inflict wounds", "lesser restoration", "aura of vitality", "haste", "polymorph", "stoneskin", "contagion", "mass cure wounds"],
            spellcastingExtraApplyNonconform: true
        },
        "subclassfeature3.1": {
            name: "Mutable Form",
            source: ["UA25P", 7],
            minlevel: 3,
            description: desc([
                "Bonus action, expend 1 Psionic Energy Die to stretch limbs for 1 minute",
                "Roll die; gain temp HP = roll + Int mod (min 1); gain: +5 ft reach, +5 ft speed",
                "Touch spells with 1 action casting time have 10 ft range"
            ]),
            action: [["bonus action", ""]]
        },
        "subclassfeature3.2": {
            name: "Organic Weapons",
            source: ["UA25P", 8],
            minlevel: 3,
            description: desc([
                "Magic action to reform free hand into Bone Blade, Flesh Maul, or Viscera Launcher",
                "Can use before attack roll when taking Attack action; retains form until changed/unconscious",
                "I can use Int for attack and damage rolls instead of Str or Dex"
            ]),
            action: [["action", ""]],
            weaponOptions: [{
                regExpSearch: /^(?=.*bone)(?=.*blade).*$/i,
                name: "Bone Blade",
                source: ["UA25P", 8],
                ability: 4,
                type: "Simple",
                damage: [1, 8, "piercing"],
                range: "Melee",
                description: "Finesse; Adv if ally within 5 ft of target (not incapacitated)",
                abilitytodamage: true,
                selectNow: true
            }, {
                regExpSearch: /^(?=.*flesh)(?=.*maul).*$/i,
                name: "Flesh Maul",
                source: ["UA25P", 8],
                ability: 4,
                type: "Simple",
                damage: [1, 10, "bludgeoning"],
                range: "Melee",
                description: "Hit: target has disadv on next Str/Con save before start of its next turn",
                abilitytodamage: true,
                selectNow: true
            }, {
                regExpSearch: /^(?=.*viscera)(?=.*launcher).*$/i,
                name: "Viscera Launcher",
                source: ["UA25P", 8],
                ability: 4,
                type: "Simple",
                damage: [1, 6, "acid"],
                range: "30/90 ft",
                description: "Ranged; Once per turn: +1d6 acid damage on hit",
                abilitytodamage: true,
                selectNow: true
            }]
        },
        "subclassfeature6": {
            name: "Extra Attack",
            source: ["UA25P", 8],
            minlevel: 6,
            description: desc([
                "I can attack twice instead of once when taking the Attack action",
                "I can cast a psion cantrip (1 action) in place of one attack"
            ])
        },
        "subclassfeature6.1": {
            name: "Flesh Weaver",
            source: ["UA25P", 8],
            minlevel: 6,
            description: desc([
                "When I use Mutable Form, I can expend additional Psionic Energy Die for benefits:",
                "Organic Defense: +2 AC",
                "Empowered Healing: When spell restores HP, expend 1 die, roll, add to HP restored"
            ])
        },
        "subclassfeature10": {
            name: "Improved Mutable Form",
            source: ["UA25P", 8],
            minlevel: 10,
            description: desc([
                "Mutable Form lasts 10 minutes and I choose one additional benefit:",
                "Stony Epidermis: Adv on Con saves for concentration; resist 1 damage type (choice)",
                "Superior Stride: Dash as bonus action (unarmored); climb/swim speed = speed",
                "Unnatural Flexibility: +1 AC; move through 1-inch spaces; 5 ft to escape restraints/grapple"
            ])
        },
        "subclassfeature14": {
            name: "Life-Bending Weapons",
            source: ["UA25P", 8],
            minlevel: 14,
            description: desc([
                "When I hit with Organic Weapon, roll 1 Psionic Energy Die (doesn't expend)",
                "Target takes extra Necrotic dmg = roll",
                "Alternatively, expend 1 die: target takes Necrotic dmg = roll",
                "  Chosen creatures in 30-ft emanation regain HP = roll + Int mod; once per turn"
            ])
        }
    }
});

// Psykinetic Subclass
AddSubClass("psion", "psykinetic", {
    regExpSearch: /psykinetic/i,
    subname: "Psykinetic",
    source: ["UA25P", 9],
    features: {
        "subclassfeature3": {
            name: "Psykinetic Spells",
            source: ["UA25P", 9],
            minlevel: 3,
            description: "I always have certain spells prepared that don't count against spells prepared",
            spellcastingExtra: ["cloud of daggers", "levitate", "shield", "thunderwave", "slow", "telekinetic crush", "otiluke's resilient sphere", "stone shape", "telekinesis", "wall of force"],
            spellcastingExtraApplyNonconform: true
        },
        "subclassfeature3.1": {
            name: "Stronger Telekinesis",
            source: ["UA25P", 9],
            minlevel: 3,
            description: "When I cast Mage Hand, range increases by 30 ft and hand can carry up to 20 lbs",
            spellChanges: {
                "mage hand": {
                    range: "60 ft",
                    description: "Invisible hand can carry 20 lb; 1 a to control; can't attack/activate magic items",
                    changes: "Using Stronger Telekinesis, my Mage Hand range increases by 30 ft and it can carry 20 lbs."
                }
            }
        },
        "subclassfeature3.2": {
            name: "Telekinetic Techniques",
            source: ["UA25P", 9],
            minlevel: 3,
            description: desc([
                "When I use Telekinetic Propel, I can roll 1d4 instead of expending Psionic Energy Die",
                "When target fails save, I can impose one effect:",
                "Boost: target's speed +10 ft until start of my next turn",
                "Disorient: target can't make opportunity attacks until start of its next turn",
                "Telekinetic Bolt: target takes Force dmg = number rolled"
            ])
        },
        "subclassfeature6": {
            name: "Destructive Trance",
            source: ["UA25P", 9],
            minlevel: 6,
            description: desc([
                "At start of turn, expend 1 Psionic Energy Die to enter destructive state for 10 min",
                "I gain 20 ft fly speed and hover",
                "When I cast psion spell with spell slot, roll Psionic Energy Die (doesn't expend)",
                "Add roll to one damage roll of the spell"
            ])
        },
        "subclassfeature6.1": {
            name: "Rebounding Field",
            source: ["UA25P", 9],
            minlevel: 6,
            description: desc([
                "When I cast Shield causing triggering attack to miss, can expend 1 Psionic Energy Die",
                "Attacker makes Dex save; roll 1 die",
                "Fail: attacker takes Force dmg = roll + Int mod; Success: half damage",
                "Either way, I gain temp HP = damage dealt"
            ])
        },
        "subclassfeature10": {
            name: "Enhanced Telekinetic Crush",
            source: ["UA25P", 9],
            minlevel: 10,
            description: desc([
                "When I cast Telekinetic Crush, can expend 1 Psionic Energy Die to modify spell:",
                "Target's speed halved until start of my next turn (regardless of save)",
                "Roll the die and add to one damage roll of the spell"
            ]),
            spellChanges: {
                "telekinetic crush": {
                    description: "30-ft cube all 5d6+die Force dmg, prone, speed halved; save half dmg no prone/halve; +1d6/SL",
                    changes: "Using Enhanced Telekinetic Crush, I can expend a die to halve speed and add die to damage."
                }
            }
        },
        "subclassfeature14": {
            name: "Heightened Telekinesis",
            source: ["UA25P", 9],
            minlevel: 14,
            description: desc([
                "I can cast Telekinesis by expending 4 Psionic Energy Dice instead of spell slot",
                "When cast this way, can modify: no concentration, duration 1 min, target Gargantuan"
            ])
        }
    }
});

// Telepath Subclass
AddSubClass("psion", "telepath", {
    regExpSearch: /telepath/i,
    subname: "Telepath",
    source: ["UA25P", 10],
    features: {
        "subclassfeature3": {
            name: "Mind Infiltrator",
            source: ["UA25P", 10],
            minlevel: 3,
            description: desc([
                "When I cast Detect Thoughts, can expend 1 Psionic Energy Die to modify:",
                "Spell requires no components or concentration",
                "When using Read Thoughts, target doesn't know I'm probing if it fails save"
            ])
        },
        "subclassfeature3.1": {
            name: "Telepath Spells",
            source: ["UA25P", 10],
            minlevel: 3,
            description: "I always have certain spells prepared that don't count against spells prepared",
            spellcastingExtra: ["bane", "command", "detect thoughts", "mind spike", "counterspell", "slow", "compulsion", "confusion", "modify memory", "yolande's regal presence"],
            spellcastingExtraApplyNonconform: true
        },
        "subclassfeature3.2": {
            name: "Telepathic Distraction",
            source: ["UA25P", 10],
            minlevel: 3,
            description: desc([
                "Reaction when creature I can see within telepathy range hits with attack",
                "Roll 1 Psionic Energy Die and subtract from attack roll, potentially causing miss",
                "Die expended only if target misses the attack"
            ]),
            action: [["reaction", " (when creature hits)"]]
        },
        "subclassfeature6": {
            name: "Bulwark Mind",
            source: ["UA25P", 10],
            minlevel: 6,
            description: desc([
                "At start of turn, expend 1 Psionic Energy Die to fortify mind for 10 minutes:",
                "Resistance to Psychic damage",
                "When I make Int/Wis/Cha save, add Psionic Energy Die roll to save (doesn't expend die)",
                "Can't use if I have Incapacitated condition"
            ])
        },
        "subclassfeature6.1": {
            name: "Potent Thoughts",
            source: ["UA25P", 10],
            minlevel: 6,
            description: "I have 60 ft telepathy; I add Int mod to damage from psion cantrips",
            calcChanges: {
                atkCalc: [
                    function (fields, v, output) {
                        if (v.thisWeapon[3] && /\bpsion\b/i.test(v.thisWeapon[4]) && SpellsList[v.thisWeapon[3]] && SpellsList[v.thisWeapon[3]].level === 0 && /\d/.test(fields.Damage_Die)) {
                            output.extraDmg += What('Int Mod');
                        }
                    },
                    "My Psion cantrips get my Intelligence modifier added to their damage."
                ]
            }
        },
        "subclassfeature10": {
            name: "Telepathic Bolstering",
            source: ["UA25P", 10],
            minlevel: 10,
            description: desc([
                "Reaction when I or creature within telepathy range fails check or misses attack",
                "Expend 1 Psionic Energy Die, roll, add to d20",
                "Die expended only if check succeeds or attack hits"
            ]),
            action: [["reaction", " (failed check/missed attack)"]]
        },
        "subclassfeature14": {
            name: "Scramble Minds",
            source: ["UA25P", 10],
            minlevel: 14,
            description: desc([
                "I can cast Confusion by expending 4 Psionic Energy Dice instead of spell slot",
                "When cast this way, modify: sphere radius 30 ft, choose 1 crea to auto-succeed save",
                "When affected creature starts turn, I choose their behavior instead of rolling"
            ])
        }
    }
});

// Note: Psi Warper subclass scored well and doesn't need playtesting, per design note on page 7
// Psi Warper subclass
AddSubClass("psion", "psi warper", {
    regExpSearch: /psi.warper/i,
    subname: "Psi Warper",
    source: ["UA25P", 0],
    features: {
        "subclassfeature3": {
            name: "Teleportation",
            source: ["UA25P", 0],
            minlevel: 3,
            description: desc([
                "I can cast Misty Step once without expending a spell slot per long rest",
                "I can restore this use by expending 1 Psionic Energy Die (no action required)"
            ]),
            spellcastingExtra: ["expeditious retreat", "feather fall", "misty step", "shatter", "blink", "haste", "banishment", "dimension door", "steel wind strike", "teleportation circle"],
            spellcastingExtraApplyNonconform: true,
            spellcastingBonus: {
                name: "Teleportation",
                spells: ["misty step"],
                selection: ["misty step"],
                firstCol: "oncelr"
            }
        },
        "subclassfeature3.2": {
            name: "Warp Propel",
            source: ["UA25P", 0],
            minlevel: 3,
            description: desc([
                "When a target fails its save against my Telekinetic Propel:",
                "Instead of pushing, I can teleport target to unoccupied space within 30 ft horizontal to me"
            ])
        },
        "subclassfeature6": {
            name: "Warp Space",
            source: ["UA25P", 0],
            minlevel: 6,
            description: desc([
                "When I cast Shatter, I can expend 1 Psionic Energy Die:",
                "Sphere radius becomes 20 ft; failed saves are pulled to center of sphere"
            ])
        },
        "subclassfeature6.1": {
            name: "Teleporter Combat",
            source: ["UA25P", 0],
            minlevel: 6,
            description: desc([
                "Immediately after I cast Misty Step:",
                "I can cast one psion cantrip with 1 action casting time as part of the bonus action"
            ])
        },
        "subclassfeature10": {
            name: "Duplicitous Target",
            source: ["UA25P", 0],
            minlevel: 10,
            description: desc([
                "When a creature I can see makes an attack against me, I can use my reaction:",
                "Expend 1 Psionic Energy Die, choose willing creature within 30 ft without incapacitated",
                "We teleport and swap places; the willing creature becomes target of the attack"
            ]),
            action: [["reaction", " (when targeted by attack)"]]
        },
        "subclassfeature14": {
            name: "Mass Teleportation",
            source: ["UA25P", 0],
            minlevel: 14,
            description: desc([
                "As a magic action, expend 4 Psionic Energy Dice:",
                "Choose Huge or smaller creatures within 30 ft, up to Int modifier (min 1)",
                "Teleport each to unoccupied space within 150 ft; unwilling get Wis save"
            ]),
            action: [["action", ""]]
        }
    }
});

// Psykinetic subclass
AddSubClass("psion", "psykinetic", {
    regExpSearch: /psykinetic/i,
    subname: "Psykinetic",
    source: ["UA25P", 0],
    features: {
        "subclassfeature3": {
            name: "Telekinetic Techniques",
            source: ["UA25P", 0],
            minlevel: 3,
            description: desc([
                "When I use Telekinetic Propel, I can add one effect:",
                "Boost: Target's speed increases by 10 ft until start of my next turn",
                "Disorient: Target can't make opportunity attacks until start of its next turn",
                "Telekinetic Bolt: If target fails save, takes force damage = die roll"
            ]),
            spellcastingExtra: ["cloud of daggers", "levitate", "shield", "thunderwave", "slow", "telekinetic crush", "otiluke's resilient sphere", "stone shape", "telekinesis", "wall of force"],
            spellcastingExtraApplyNonconform: true
        },
        "subclassfeature6": {
            name: "Empowered Attack Mode",
            source: ["UA25P", 0],
            minlevel: 6,
            description: desc([
                "While Attack Mode is active:",
                "I gain 60 ft fly speed and can hover",
                "When I cast a psion spell, I add Int modifier to one damage roll"
            ])
        },
        "subclassfeature6.1": {
            name: "Rebounding Field",
            source: ["UA25P", 0],
            minlevel: 6,
            description: desc([
                "When I cast Shield and cause triggering attack to miss, I can expend 1 Psionic Energy Die:",
                "Attacker makes Dex save; roll 2 dice: fail = force damage and I gain temp HP equal to total",
                "Success = half damage only"
            ])
        },
        "subclassfeature10": {
            name: "Enhanced Telekinetic Crush",
            source: ["UA25P", 0],
            minlevel: 10,
            description: desc([
                "When I cast Telekinetic Crush, I can expend 1 Psionic Energy Die:",
                "Regardless of save result, target's speed is halved until start of my next turn"
            ])
        },
        "subclassfeature14": {
            name: "Heightened Telekinesis",
            source: ["UA25P", 0],
            minlevel: 14,
            description: desc([
                "When I cast Telekinesis, I can expend 4 Psionic Energy Dice:",
                "Spell doesn't require concentration, duration becomes 1 minute",
                "I can target Gargantuan creatures and objects"
            ])
        }
    }
});