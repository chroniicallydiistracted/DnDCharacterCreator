/* -WHAT IS THIS?-
This file adds the Psion class from Unearthed Arcana 2025 to "MPMB's Character Record Sheet" found at https://flapkan.com/mpmb/charsheets
Import this file using the "Add Extra Materials" bookmark.

Subject: Class
Effect: This script adds the "Psion" class and its subclasses from UA 2025
Code by: Rocky
Date: 2025-05-30 (sheet v13)
*/

var iFileName = "Psion.js";
RequiredSheetVersion("13.2.0");

SourceList["UA25P"] = {
    name: "Unearthed Arcana 2025 - The Psion",
    abbreviation: "UA25P",
    abbreviationSpellsheet: "P",
    group: "Unearthed Arcana",
    date: "2025/05/30",
    url: "https://media.wizards.com/2025/dnd/downloads/UA25P_Psion.pdf",
};

// Add spells to Psion spell list
[
    // Cantrips
    "blade ward", "dancing lights", "friends", "light", "mage hand", "mending", "message",
    "mind sliver", "minor illusion", "prestidigitation", "telekinetic fling", "true strike",

    // 1st Level
    "animal friendship", "charm person", "command", "comprehend languages", "detect magic",
    "dissonant whispers", "feather fall", "identify", "jump", "longstrider", "mage armor",
    "silent image", "sleep", "speak with animals", "tasha's hideous laughter", "tenser's floating disk",

    // 2nd Level  
    "animal messenger", "blindness/deafness", "calm emotions", "crown of madness", "detect thoughts",
    "enhance ability", "enlarge/reduce", "enthrall", "heat metal", "hold person", "invisibility",
    "knock", "locate animals or plants", "locate object", "magic mouth", "mind spike", "mirror image",
    "phantasmal force", "see invisibility", "shatter", "silence", "suggestion", "tasha's mind whip",
    "zone of truth",

    // 3rd Level
    "animate dead", "bestow curse", "clairvoyance", "dispel magic", "fear", "fly", "hypnotic pattern",
    "intellect fortress", "major image", "nondetection", "sending", "summon astral entity",
    "telekinetic crush", "tongues",

    // 4th Level
    "arcane eye", "banishment", "charm monster", "compulsion", "confusion", "dimension door",
    "freedom of movement", "greater invisibility", "hallucinatory terrain", "locate creature",
    "phantasmal killer", "polymorph", "raulothim's psychic lance", "summon aberration",

    // 5th Level
    "animate objects", "awaken", "contact other plane", "dominate person", "dream", "geas",
    "hold monster", "legend lore", "mislead", "modify memory", "rary's telepathic bond", "scrying",
    "seeming", "synaptic static", "telekinesis", "teleportation circle",

    // 6th Level
    "blade barrier", "disintegrate", "eyebite", "find the path", "mass suggestion", "move earth",
    "otto's irresistible dance", "programmed illusion", "true seeing",

    // 7th Level
    "etherealness", "forcecage", "mirage arcane", "plane shift", "power word fortify", "project image",
    "reverse gravity", "teleport",

    // 8th Level
    "antipathy/sympathy", "befuddlement", "dominate monster", "glibness", "maze", "mind blank",
    "power word stun", "telepathy",

    // 9th Level
    "astral projection", "foresight", "power word heal", "power word kill", "psychic scream",
    "shapechange", "time stop", "weird"

].forEach(function (s) {
    if (SpellsList[s] && SpellsList[s].classes && SpellsList[s].classes.indexOf("psion") === -1)
        SpellsList[s].classes.push("psion");
});

ClassList["psion"] = {
    regExpSearch: /psion/i,
    name: "Psion",
    source: ["UA25P", 0],
    primaryAbility: "Intelligence",
    abilitySave: 4,
    prereqs: "Intelligence 13",
    die: 6,
    saves: ["Int", "Wis"],
    skills: ["\n\n" + toUni("Psion") + ": Choose 2 from Arcana, Insight, Intimidation, Investigation, Medicine, Perception, Persuasion"],
    armor: [
        [false, false, false, false],
    ],
    weapons: [
        [true, false],
    ],
    equipment: "Psion starting equipment:" +
        "\n \u2022 Spear, 2 daggers, light crossbow, 20 bolts, case, dungeoneer's pack, and 6 gp;" +
        "\n \u2022 Or 50 gp to buy your equipment.",
    subclasses: ["Psion Subclass", []],
    attacks: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    spellcastingFactor: 1,
    spellcastingFactorRoundupMulti: false,
    spellcastingKnown: {
        cantrips: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4],
        spells: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
    },
    features: {
        "spellcasting": {
            name: "Spellcasting",
            source: ["UA25P", 0],
            minlevel: 1,
            description: desc([
                "I can cast psion spells that I have prepared, using Intelligence as my spellcasting ability",
                "I can use an arcane focus as a spellcasting focus for my psion spells",
                "Psionic Spellcasting: My psion spells don't require Verbal or Material components",
                "Exception: Material components that are consumed or have a specified cost"
            ])
        },
        "psionic power": {
            name: "Psionic Power",
            source: ["UA25P", 0],
            minlevel: 1,
            description: desc([
                "I have Psionic Energy Dice that fuel my psionic abilities",
                "I regain 1 expended die on a short rest, all on a long rest",
                "Telekinetic Propel: Bonus action, target Large or smaller creature within 30 ft",
                "  Roll 1 Psionic Energy Die, target makes Str save or pushed/pulled 5 ft × roll",
                "  Die only expended if target fails the save",
                "Telepathic Connection: I have telepathy with 5 ft range",
                "  Bonus action, expend 1 die: increase range by 10 ft × roll for my Psion level in minutes"
            ]),
            additional: levels.map(function (n, idx) {
                var dieSize = n < 5 ? "d6" : n < 11 ? "d8" : n < 17 ? "d10" : "d12";
                var dieCount = n < 5 ? 4 : n < 9 ? 6 : n < 11 ? 8 : n < 13 ? 8 : n < 17 ? 10 : 12;
                return dieCount + " " + dieSize + " dice";
            }),
            usages: levels.map(function (n) {
                return n < 5 ? 4 : n < 9 ? 6 : n < 11 ? 8 : n < 13 ? 8 : n < 17 ? 10 : 12;
            }),
            recovery: "long rest",
            action: [["bonus action", "Telekinetic Propel"], ["bonus action", "Telepathic Connection"]],
            extraLimitedFeatures: [{
                name: "Psionic Power Recover 1 Die",
                usages: "1",
                recovery: "short rest",
            }]
        },
        "subtle telekinesis": {
            name: "Subtle Telekinesis",
            source: ["UA25P", 0],
            minlevel: 1,
            description: desc([
                "I know the Mage Hand cantrip",
                "I can cast it without somatic components and make the hand invisible when cast"
            ]),
            spellcastingBonus: {
                name: "Subtle Telekinesis",
                spells: ["mage hand"],
                selection: ["mage hand"],
                firstCol: "atwill"
            },
            spellChanges: {
                "mage hand": {
                    description: "Invisible hand; no somatic components",
                    changes: "My Subtle Telekinesis class feature makes the spectral hand invisible."
                }
            }
        },
        "psionic discipline": {
            name: "Psionic Discipline",
            source: ["UA25P", 0],
            minlevel: 2,
            description: desc([
                "I learn psionic techniques fueled by my Psionic Energy Dice",
                "I can use only one discipline per turn and only once per turn",
                "I can replace one discipline when I gain a psion level"
            ]),
            additional: levels.map(function (n) {
                return n < 2 ? "" : n < 10 ? "2 disciplines known" : n < 17 ? "4 disciplines known" : "6 disciplines known";
            }),
            extraTimes: levels.map(function (n) {
                return n < 2 ? 0 : n < 10 ? 2 : n < 17 ? 4 : 6;
            }),
            extraname: "Psionic Discipline",
            extrachoices: ["Biofeedback", "Destructive Thoughts", "Devilish Tongue", "Ego Whip", "Expanded Awareness", "Id Insinuation", "Inerrant Aim", "Psionic Backlash", "Psionic Guards", "Swift Precognition", "Tactical Mind"],
            "biofeedback": {
                name: "Biofeedback",
                description: desc([
                    "When I cast a Necromancy or Transmutation psion spell, I can expend 1 Psionic Energy Die",
                    "I gain temporary hit points equal to the roll + my Int modifier (minimum 1)"
                ])
            },
            "destructive thoughts": {
                name: "Destructive Thoughts",
                description: desc([
                    "When I cast a Conjuration or Evocation psion spell and a creature succeeds on its save,",
                    "I can expend 1 Psionic Energy Die; the creature takes psychic damage = roll + Int mod"
                ])
            },
            "devilish tongue": {
                name: "Devilish Tongue",
                description: "When I take the Influence action, I can expend 1 Psionic Energy Die and add the roll to the check"
            },
            "ego whip": {
                name: "Ego Whip",
                description: desc([
                    "When a creature provokes opportunity attack by leaving my reach, I can use my reaction",
                    "I roll 1 Psionic Energy Die, target makes Int save; fail: speed reduced 10 ft,",
                    "subtract roll from next damage roll before end of its next turn; die only expended on fail"
                ]),
                action: [["reaction", " (when creature leaves reach)"]]
            },
            "expanded awareness": {
                name: "Expanded Awareness",
                description: "When I take the Search action, I can expend 1 Psionic Energy Die and add the roll to the check"
            },
            "id insinuation": {
                name: "Id Insinuation",
                description: desc([
                    "When I cast an Enchantment or Illusion psion spell that forces a save, I can expend 2 dice",
                    "One target I can see subtracts the roll of 1 die from its saving throw against the spell"
                ])
            },
            "inerrant aim": {
                name: "Inerrant Aim",
                description: desc([
                    "When I miss with an attack roll, I can roll 1 Psionic Energy Die and add it to the attack",
                    "If this makes the attack hit, the die is expended"
                ])
            },
            "psionic backlash": {
                name: "Psionic Backlash",
                description: desc([
                    "When a creature I can see hits me with an attack, I can use my reaction:",
                    "Expend 1 die, roll 2 dice, subtract each from damage; attacker makes Wis save",
                    "On fail, attacker takes psychic damage equal to the total rolled on both dice"
                ]),
                action: [["reaction", " (when hit by attack)"]]
            },
            "psionic guards": {
                name: "Psionic Guards",
                description: desc([
                    "At start of my turn, I can expend 1 Psionic Energy Die",
                    "Until start of next turn: immunity to charmed/frightened, advantage on Int saves",
                    "If charmed or frightened when used, the condition ends; I can use another discipline this turn"
                ])
            },
            "swift precognition": {
                name: "Swift Precognition",
                description: desc([
                    "When I cast an Abjuration or Divination psion spell with casting time of 1 action,",
                    "I can expend dice = 1 + spell level to change casting time to bonus action"
                ])
            },
            "tactical mind": {
                name: "Tactical Mind",
                description: "When I take the Study action, I can expend 1 Psionic Energy Die and add the roll to the check"
            }
        },
        "psionic modes": {
            name: "Psionic Modes",
            source: ["UA25P", 0],
            minlevel: 2,
            description: desc([
                "As a bonus action, I can choose Attack Mode or Defense Mode for 1 minute",
                "Attack Mode: My damage ignores psychic resistance; expend 1 die to reroll damage dice",
                "Defense Mode: I have psychic resistance; expend 1 die on failed Int/Wis/Cha save as reaction"
            ]),
            usages: 2,
            recovery: "long rest",
            action: [["bonus action", " (choose mode)"], ["reaction", "Defense Mode (failed save)"]],
            dmgres: ["Psychic (Defense mode)"],
        },
        "psionic restoration": {
            name: "Psionic Restoration",
            source: ["UA25P", 0],
            minlevel: 5,
            description: "On a short rest, I can regain expended Psionic Energy Dice up to half my total (round down)",
            usages: 1,
            recovery: "long rest"
        },
        "psionic surge": {
            name: "Psionic Surge",
            source: ["UA25P", 0],
            minlevel: 7,
            description: desc([
                "When I roll initiative, I can expend 1 Hit Point Die to regain 1 use of Psionic Modes",
                "After rolling Psionic Energy Dice, I can expend 1 Hit Point Die to treat 1, 2, or 3 as 4"
            ])
        },
        "enkindled lifeforce": {
            name: "Enkindled Lifeforce",
            source: ["UA25P", 0],
            minlevel: 20,
            description: desc([
                "Once per turn, when I expend 1 Psionic Energy Die for a psion feature or discipline:",
                "I can expend 2 Hit Point Dice to roll 2 additional Psionic Energy Dice and add to total"
            ])
        }
    }
};

// Metamorph subclass
AddSubClass("psion", "metamorph", {
    regExpSearch: /metamorph/i,
    subname: "Metamorph",
    source: ["UA25P", 0],
    features: {
        "subclassfeature3": {
            name: "Organic Weapons",
            source: ["UA25P", 0],
            minlevel: 3,
            description: desc([
                "When I Attack or make opportunity attacks, I can reform my hand into an organic weapon: Bone Blade, Flesh Maul, or Viscera Launcher",
                "I can use Int for attack and damage rolls, and choose psychic or normal damage type"
            ]),
            spellcastingExtra: ["alter self", "cure wounds", "inflict wounds", "lesser restoration", "aura of vitality", "haste", "polymorph", "stoneskin", "contagion", "mass cure wounds"],
            spellcastingExtraApplyNonconform: true,
            weaponOptions: [{
                regExpSearch: /^(?=.*organic)(?=.*bone)(?=.*blade).*$/i,
                name: "Organic Bone Blade",
                source: ["UA25P", 0],
                ability: 4, // Intelligence modifier
                type: "Simple",
                damage: [1, 8, "piercing"],
                range: "Melee",
                description: "Finesse; Advantage if ally within 5 ft of target (not incapacitated); Can deal psychic damage",
                abilitytodamage: true,
                modifiers: ["", "Int"],
                selectNow: true
            }, {
                regExpSearch: /^(?=.*organic)(?=.*flesh)(?=.*maul).*$/i,
                name: "Organic Flesh Maul",
                source: ["UA25P", 0],
                ability: 4, // Intelligence modifier
                type: "Simple",
                damage: [1, 10, "bludgeoning"],
                range: "Melee",
                description: "Target has disadvantage on next Str/Con save before start of its next turn; Can deal psychic damage",
                abilitytodamage: true,
                modifiers: ["", "Int"],
                selectNow: true
            }, {
                regExpSearch: /^(?=.*organic)(?=.*viscera)(?=.*launcher).*$/i,
                name: "Organic Viscera Launcher",
                source: ["UA25P", 0],
                ability: 4, // Intelligence modifier
                type: "Simple",
                damage: [1, 6, "acid"],
                range: "30/90 ft",
                description: "Ranged; +1d6 acid damage once per turn on hit; Can deal psychic damage",
                abilitytodamage: true,
                modifiers: ["", "Int"],
                selectNow: true
            }],
        },
        "subclassfeature3.2": {
            name: "Extend Limbs",
            source: ["UA25P", 0],
            minlevel: 3,
            description: desc([
                "Bonus action, expend 1 Psionic Energy Die for 1 minute:",
                "My reach increases by 5 feet, my speed increases by 5 feet",
                "Touch spells with 1 action casting time have 10 ft range instead"
            ]),
            action: [["bonus action", ""]]
        },
        "subclassfeature6": {
            name: "Extra Attack",
            source: ["UA25P", 0],
            minlevel: 6,
            description: desc([
                "I can attack twice when I take the Attack action",
                "I can cast a psion cantrip with 1 action casting time in place of one attack"
            ])
        },
        "subclassfeature6.1": {
            name: "Quickened Healing",
            source: ["UA25P", 0],
            minlevel: 6,
            description: desc([
                "When I cast Cure Wounds, I can expend 2 Psionic Energy Dice:",
                "Change casting time to bonus action, roll 1 die and add to HP restored"
            ])
        },
        "subclassfeature10": {
            name: "Mutable Form",
            source: ["UA25P", 0],
            minlevel: 10,
            description: desc([
                "Extend Limbs lasts 10 minutes and I gain one additional benefit:",
                "Stony Epidermis: Advantage on concentration saves, resistance to chosen damage type",
                "Superior Stride: Dash as bonus action, climb/swim speed equal to speed (unarmored)",
                "Unnatural Flexibility: +2 AC, move through 1-inch spaces, escape restraints/grapples"
            ])
        },
        "subclassfeature14": {
            name: "Life-Bending Weapons",
            source: ["UA25P", 0],
            minlevel: 14,
            description: desc([
                "Once per turn when I hit with Organic Weapon, I can expend 1 Psionic Energy Die:",
                "All chosen creatures in 10-ft emanation regain HP = roll + Int modifier",
                "One chosen creature in area takes necrotic damage = roll"
            ])
        }
    }
});

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

// Telepath subclass  
AddSubClass("psion", "telepath", {
    regExpSearch: /telepath/i,
    subname: "Telepath",
    source: ["UA25P", 0],
    features: {
        "subclassfeature3": {
            name: "Mind Infiltrator",
            source: ["UA25P", 0],
            minlevel: 3,
            description: desc([
                "When I cast Detect Thoughts, I can expend 2 Psionic Energy Dice:",
                "Spell requires no components or concentration",
                "Target doesn't know I'm probing if it fails the Wisdom save"
            ]),
            spellcastingExtra: ["bane", "command", "detect thoughts", "mind spike", "counterspell", "speak with plants", "compulsion", "confusion", "awaken", "modify memory"],
            spellcastingExtraApplyNonconform: true,
        },
        "subclassfeature3.1": {
            name: "Telepathic Hub",
            source: ["UA25P", 0],
            minlevel: 3,
            description: desc([
                "I have 10 ft telepathy; when I use Telepathic Connection to increase range:",
                "I can contact number of creatures = 1 + die roll simultaneously"
            ])
        },
        "subclassfeature6": {
            name: "Empowered Defense Mode",
            source: ["UA25P", 0],
            minlevel: 6,
            description: desc([
                "While Defense Mode is active:",
                "I add 1d4 to all my saving throws",
                "Creatures I'm telepathically connected to also gain this benefit"
            ])
        },
        "subclassfeature6.1": {
            name: "Potent Thoughts",
            source: ["UA25P", 0],
            minlevel: 6,
            description: desc(["I add my Intelligence modifier to damage from psion cantrips"]),
            calcChanges: {
                atkCalc: [
                    function (fields, v, output) {
                        if (v.thisWeapon[3] && /\bpsion\b/.test(v.thisWeapon[4]) && SpellsList[v.thisWeapon[3]].level === 0 && /\d/.test(fields.Damage_Die)) {
                            output.extraDmg += What('Int Mod');
                        };
                    },
                    "My Psion cantrips get my Intelligence modifier added to their damage."
                ],
            }
        },
        "subclassfeature10": {
            name: "Telepathic Bolstering",
            source: ["UA25P", 0],
            minlevel: 10,
            description: desc([
                "I have 30 ft telepathy; when I or telepathic ally fails check or misses attack:",
                "Reaction to expend 1 Psionic Energy Die, add roll to d20",
                "Die only expended if check succeeds or attack hits"
            ]),
            action: [["reaction", " (failed check/missed attack)"]]
        },
        "subclassfeature14": {
            name: "Scramble Minds",
            source: ["UA25P", 0],
            minlevel: 14,
            description: desc([
                "When I cast Confusion, I can expend 4 Psionic Energy Dice:",
                "Sphere radius becomes 30 ft",
                "Affected creatures roll 2d10 and I choose which determines their behavior"
            ])
        }
    }
});

// New Spells
SpellsList["telekinetic fling"] = {
    name: "Telekinetic Fling",
    classes: ["psion"],
    source: ["UA25P", 0],
    level: 0,
    school: "Evoc",
    time: "1 a",
    range: "60 ft",
    components: "V,M",
    compMaterial: "an arrow, bolt, bullet, or needle worth at least 1 cp",
    duration: "Instantaneous",
    description: "Ranged spell attack; 1d10 Force dmg; ammunition destroyed; +1d10 at CL 5, 11, 17",
    descriptionCantripDie: "Ranged spell attack; `CD`d10 Force dmg; ammunition destroyed",
    descriptionFull: "You brandish the ammunition used to cast this spell and fire it at a creature within range using psionic energy. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage, and the ammunition is destroyed." + AtHigherLevels + "The damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10)."
};

SpellsList["tasha's mind whip"] = {
    name: "Tasha's Mind Whip",
    classes: ["psion", "sorcerer", "wizard"],
    source: ["UA25P", 0],
    level: 2,
    school: "Ench",
    time: "1 a",
    range: "90 ft",
    components: "V",
    duration: "Instantaneous",
    save: "Int",
    description: "1 creature 3d6 psychic dmg, save halves; fail: no opportunity attacks until end next turn, action or bonus action next turn",
    descriptionFull: "You psychically lash out at one creature you can see within range. The target must make an Intelligence saving throw. On a failed save, the target takes 3d6 psychic damage, and it can't make opportunity attacks until the end of its next turn. Moreover, on its next turn, it can take either an action or a bonus action, not both. On a successful save, the target takes half as much damage only." + AtHigherLevels + "You can target one additional creature for each spell slot level above 2nd."
};

SpellsList["intellect fortress"] = {
    name: "Intellect Fortress",
    classes: ["artificer", "bard", "psion", "sorcerer", "warlock", "wizard"],
    source: ["UA25P", 0],
    level: 3,
    school: "Abjur",
    time: "1 a",
    range: "30 ft",
    components: "V",
    duration: "Conc, 1 h",
    description: "1 willing creature gains resistance to psychic dmg, adv. on Int/Wis/Cha saves; +1 target/SL",
    descriptionFull: "For the duration, one willing creature you can see within range has resistance to psychic damage, as well as advantage on Intelligence, Wisdom, and Charisma saving throws." + AtHigherLevels + "You can target one additional creature for each spell slot level above 3rd."
};

SpellsList["summon astral entity"] = {
    name: "Summon Astral Entity",
    classes: ["psion", "sorcerer", "warlock", "wizard"],
    source: ["UA25P", 0],
    level: 3,
    school: "Conj",
    time: "1 a",
    range: "90 ft",
    components: "V,S,M\u0192",
    compMaterial: "a gem or crystal worth 300+ gp",
    duration: "Conc, 1 h",
    description: "Summon psionic spirit; Crystal Entity, Ectoplasmic Entity, or Ghostly Entity; obeys commands",
    descriptionFull: "You call forth the spirit of a psionic entity. It manifests in an unoccupied space that you can see within range and uses the Psionic Spirit stat block. When you cast the spell, choose Crystal Entity, Ectoplasmic Entity, or Ghostly Entity. The creature resembles an astral entity of that kind, which determines certain details in its stat block. The creature disappears when it drops to 0 hit points or when the spell ends.\n\nThe creature is an ally to you and your companions. In combat, the creature shares your initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger." + AtHigherLevels + "Use the spell slot's level for the spell's level in the stat block."
};

SpellsList["telekinetic crush"] = {
    name: "Telekinetic Crush",
    classes: ["psion", "sorcerer", "warlock"],
    source: ["UA25P", 0],
    level: 3,
    school: "Trans",
    time: "1 a",
    range: "120 ft",
    components: "V",
    duration: "Instantaneous",
    save: "Str",
    description: "30-ft cube; all creatures 5d6 Force dmg and prone, save halves dmg only; +1d6/SL",
    descriptionFull: "You create a field of crushing telekinetic force in a 30-foot cube within range. Each creature in the area makes a Strength saving throw. On a failed save, a target takes 5d6 force damage and has the prone condition. On a successful save, a target takes half as much damage only." + AtHigherLevels + "The damage increases by 1d6 for each spell slot level above 3rd."
};

SpellsList["raulothim's psychic lance"] = {
    name: "Raulothim's Psychic Lance",
    classes: ["bard", "psion", "sorcerer", "warlock", "wizard"],
    source: ["UA25P", 0],
    level: 4,
    school: "Ench",
    time: "1 a",
    range: "120 ft",
    components: "V",
    duration: "Instantaneous",
    save: "Int",
    description: "1 creature (or named target) 7d6 psychic dmg, incapacitated until start of my next turn; save halves, no incapacitated; +1d6/SL",
    descriptionFull: "You unleash a shimmering lance of psychic power from your forehead at a creature that you can see within range. Alternatively, you can utter a creature's name (a pseudonym, title, or nickname doesn't work). If the named target is within range, it becomes the spell's target even if you can't see it. If the named target isn't within range or you use an invalid name, the lance dissipates without effect.\n\nThe target must make an Intelligence saving throw. On a failed save, the target takes 7d6 psychic damage and has the incapacitated condition until the start of your next turn. On a successful save, the target takes half as much damage only." + AtHigherLevels + "The damage increases by 1d6 for each spell slot level above 4th."
};

SpellsList["psychic scream"] = {
    name: "Psychic Scream",
    classes: ["bard", "psion", "sorcerer", "warlock"],
    source: ["UA25P", 0],
    level: 9,
    school: "Ench",
    time: "1 a",
    range: "90 ft",
    components: "S",
    duration: "Instantaneous",
    save: "Int",
    description: "10 creatures Int>2: 14d6 psychic dmg, stunned; save halves, no stunned; repeat save at end of turn; 0 HP = head explodes",
    descriptionFull: "You unleash the power of your mind to blast the intellect of up to ten creatures of your choice that you can see within range. Creatures that have an Intelligence score of 2 or lower are unaffected.\n\nEach target must make an Intelligence saving throw. On a failed save, a target takes 14d6 psychic damage and has the stunned condition. On a successful save, a target takes half as much damage only. If the target is reduced to 0 hit points by this damage, its head explodes, assuming it has one.\n\nAt the end of each of its turns, the stunned target repeats the save, ending the condition on itself on a success."
};

// New Wild Talent Feats

FeatsList["atmokinesis"] = {
    name: "Atmokinesis",
    source: ["UA25P", 0],
    description: "Lightning Jolt: Once per turn when casting a spell or hitting with an attack that deals bludgeoning, piercing, slashing, or psychic damage, I can change the damage type to lightning. I know Shocking Grasp and always have Fog Cloud prepared. I can cast Fog Cloud once per long rest without a spell slot. At 3rd level, I also have Gust of Wind prepared. These spells require no verbal or material components.",
    spellcastingBonus: [{
        name: "Atmokinesis",
        spells: ["shocking grasp"],
        selection: ["shocking grasp"],
        firstCol: "atwill"
    }, 
    {
        name: "Atmokinesis Fog Cloud",
        spells: ["fog cloud"],
        selection: ["fog cloud"],
        firstCol: "oncelr"
    },
    {
        name: "Atmokinesis Gust of Wind",
        spells: ["gust of wind"],
        selection: ["gust of wind"],
        firstCol: "oncelr",
        times: levels.map(function (n) {return n < 3 ? 0 : 1;})
    }]
};
FeatsList["biokinesis"] = {
    name: "Biokinesis",
    source: ["UA25P", 0],
    description: "Bend Life Energy: When a spell I cast restores hit points, I can roll 1d4 and add it to the total hit points restored. I can do this Prof Bonus times per long rest. I know Spare the Dying and always have Healing Word prepared. I can cast Healing Word once per long rest without a spell slot. At 3rd level, I also have Arcane Vigor prepared. These spells require no verbal or material components.",
    spellcastingBonus: [{
        name: "Biokinesis",
        spells: ["spare the dying"],
        selection: ["spare the dying"],
        firstCol: "atwill"
    }, 
    {
        name: "Biokinesis Healing Word",
        spells: ["healing word"],
        selection: ["healing word"],
        firstCol: "oncelr"
    },
    {
        name: "Biokinesis Arcane Vigor",
        spells: ["arcane vigor"],
        selection: ["arcane vigor"],
        firstCol: "oncelr",
        times: levels.map(function (n) {return n < 3 ? 0 : 1;})
    }]
};

FeatsList["clairsentience"] = {
    name: "Clairsentience",
    source: ["UA25P", 0],
    description: "Minor Foreknowledge: When I take the Search action, I can give myself advantage on any ability check made as part of that action. I can do this Prof Bonus times per long rest. I know Guidance and always have Detect Evil and Good prepared. I can cast Detect Evil and Good once per long rest without a spell slot. At 3rd level, I also have See Invisibility prepared. These spells require no verbal or material components.",
    spellcastingBonus: [{
        name: "Clairsentience",
        spells: ["guidance"],
        selection: ["guidance"],
        firstCol: "atwill"
    }, 
    {
        name: "Clairsentience Detect Evil and Good",
        spells: ["detect evil and good"],
        selection: ["detect evil and good"],
        firstCol: "oncelr"
    },
    {
        name: "Clairsentience See Invisibility",
        spells: ["see invisibility"],
        selection: ["see invisibility"],
        firstCol: "oncelr",
        times: levels.map(function (n) {return n < 3 ? 0 : 1;})
    }]
};

FeatsList["cryokinesis"] = {
    name: "Cryokinesis",
    source: ["UA25P", 0],
    description: "Ice Manipulation: Once per turn when casting a spell or hitting with an attack that deals bludgeoning, piercing, slashing, or psychic damage, I can change the damage type to cold. I know Ray of Frost and always have Armor of Agathys and Ice Knife prepared. I can cast each once per long rest without a spell slot. These spells require no verbal or material components.",
    spellcastingBonus: [{
        name: "Cryokinesis",
        spells: ["ray of frost"],
        selection: ["ray of frost"],
        firstCol: "atwill"
    }, 
    {
        name: "Cryokinesis Armor of Agathys",
        spells: ["armor of agathys"],
        selection: ["armor of agathys"],
        firstCol: "oncelr"
    },
    {
        name: "Cryokinesis Ice Knife",
        spells: ["ice knife"],
        selection: ["ice knife"],
        firstCol: "oncelr"
    }]
};

FeatsList["empath"] = {
    name: "Empath",
    source: ["UA25P", 0],
    description: "Emotional Sense: When I take the Influence action, I can give myself advantage on any ability check made as part of that action. I can do this Prof Bonus times per long rest. I always have Charm Person prepared and can cast it once per long rest without a spell slot. At 3rd level, I also have Calm Emotions prepared. These spells require no verbal components.",
    spellcastingBonus: [{
        name: "Empath Charm Person",
        spells: ["charm person"],
        selection: ["charm person"],
        firstCol: "oncelr"
    },
    {
        name: "Empath Calm Emotions",
        spells: ["calm emotions"],
        selection: ["calm emotions"],
        firstCol: "oncelr",
        times: levels.map(function (n) {return n < 3 ? 0 : 1;})
    }]
};

FeatsList["flesh morpher"] = {
    name: "Flesh Morpher",
    source: ["UA25P", 0],
    description: "Flexible Flesh: When I make a Dexterity (Acrobatics) or Sleight of Hand check, I gain a bonus equal to my Int modifier (min +1). I can do this Prof Bonus times per long rest. I always have Longstrider prepared and can cast it once per long rest without a spell slot. At 3rd level, I also have Alter Self prepared. These spells require no verbal components.",
    spellcastingBonus: [{
        name: "Flesh Morpher Longstrider",
        spells: ["longstrider"],
        selection: ["longstrider"],
        firstCol: "oncelr"
    },
    {
        name: "Flesh Morpher Alter Self",
        spells: ["alter self"],
        selection: ["alter self"],
        firstCol: "oncelr",
        times: levels.map(function (n) {return n < 3 ? 0 : 1;})
    }]
};

FeatsList["mind whisperer"] = {
    name: "Mind Whisperer",
    source: ["UA25P", 0],
    description: "Limited Telepathy: As a magic action, I can form a telepathic connection with a creature I can see within 120 ft for 1 hour. We can communicate telepathically within 120 ft using a mutual language. Once per short/long rest. I know Mind Sliver and always have Dissonant Whispers prepared. I can cast Dissonant Whispers once per long rest without a spell slot. These spells require no verbal or material components.",
    spellcastingBonus: [{
        name: "Mind Whisperer",
        spells: ["mind sliver"],
        selection: ["mind sliver"],
        firstCol: "atwill"
    }, 
    {
        name: "Mind Whisperer Dissonant Whispers",
        spells: ["dissonant whispers"],
        selection: ["dissonant whispers"],
        firstCol: "oncelr"
    }]
};

FeatsList["psi trickster"] = {
    name: "Psi Trickster",
    source: ["UA25P", 0],
    description: "Cunning Mind: When I make a Charisma (Deception) or Persuasion check, I gain a bonus equal to my Int modifier (min +1). I can do this Prof Bonus times per long rest. I know Minor Illusion and always have Disguise Self prepared. I can cast Disguise Self once per long rest without a spell slot. These spells require no verbal or material components.",
    spellcastingBonus: [{
        name: "Psi Trickster",
        spells: ["minor illusion"],
        selection: ["minor illusion"],
        firstCol: "atwill"
    }, 
    {
        name: "Psi Trickster Disguise Self",
        spells: ["disguise self"],
        selection: ["disguise self"],
        firstCol: "oncelr"
    }]
};

FeatsList["psykineticist"] = {
    name: "Psykineticist",
    source: ["UA25P", 0],
    description: "Psi Boost: When I take the Dash action, I can increase my speed by 10 ft until the start of my next turn. I can do this Prof Bonus times per long rest. I know Telekinetic Fling and always have Thunderwave prepared. I can cast Thunderwave once per long rest without a spell slot. These spells require no verbal components.",
    spellcastingBonus: [{
        name: "Psykineticist",
        spells: ["telekinetic fling"],
        selection: ["telekinetic fling"],
        firstCol: "atwill"
    }, 
    {
        name: "Psykineticist Thunderwave",
        spells: ["thunderwave"],
        selection: ["thunderwave"],
        firstCol: "oncelr"
    }]
};

FeatsList["pyrokinesis"] = {
    name: "Pyrokinesis",
    source: ["UA25P", 0],
    description: "Firestarter: Once per turn when casting a spell or hitting with an attack that deals bludgeoning, piercing, slashing, or psychic damage, I can change the damage type to fire. I know Produce Flame and always have Burning Hands prepared. I can cast Burning Hands once per long rest without a spell slot. At 3rd level, I also have Scorching Ray prepared. These spells require no verbal or material components.",
    spellcastingBonus: [{
        name: "Pyrokinesis",
        spells: ["produce flame"],
        selection: ["produce flame"],
        firstCol: "atwill"
    }, 
    {
        name: "Pyrokinesis Burning Hands",
        spells: ["burning hands"],
        selection: ["burning hands"],
        firstCol: "oncelr"
    },
    {
        name: "Pyrokinesis Scorching Ray",
        spells: ["scorching ray"],
        selection: ["scorching ray"],
        firstCol: "oncelr",
        times: levels.map(function (n) {return n < 3 ? 0 : 1;})
    }]
};