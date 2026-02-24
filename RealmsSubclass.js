/*	-WHAT IS THIS?-
    This file adds optional material to "MPMB's Character Record Sheet" found at https://flapkan.com/mpmb/charsheets
    Import this file using the "Add Extra Materials" bookmark.
    -KEEP IN MIND-
    It is recommended to enter the code in a fresh sheet before adding any other information (i.e. before making your character with it).
*/

/*	-INFORMATION-
    Subject:	2025 UA Realms Subclasses https://media.dndbeyond.com/compendium-images/ua/forgotten-realms-subclasses/OXcW3UjTCurUcQy7/UA2025-RealmsSubclasses.pdf
    Effect:		This script adds the 2025 UA Realms Subclasses. It should be added after PokeSimmer's 2024 scripts https://github.com/thepokesimmer/2024-PHB.
    Code by:	Rocky, special thanks to Trackatnite for help with Bladesinger and Three Scion, and PokeSimmer for 2024 scripts.
    Date:		2025-2-4 (sheet v13)
*/

var iFileName = "RealmsSubclasses.js";

RequiredSheetVersion("13.2.0");

SourceList["U25"] = {
    name: "UA Realms",
    abbreviation: "UAR",
    group: "Unearthed Arcana",
    url: "https://media.dndbeyond.com/compendium-images/ua/forgotten-realms-subclasses/OXcW3UjTCurUcQy7/UA2025-RealmsSubclasses.pdf",
    date: "2025/02/4"
};

AddSubClass("bard", "college of the moon", {
    regExpSearch : /^(?=.*(college|bard|minstrel|troubadour|jongleur))(?=.*moon).*$/i,
    subname : "College of the Moon",
    source : [["U25", 1]],
    features : {
        "subclassfeature3" : {
            name : "Moonshae Folktales",
            source : [["U25", 1]],
            minlevel : 3,
            description : "\n   " + "As a Magic action, invoke a folktale's power until you use the feature again." +
                          "\n    - Tale of Life: When restoring Hit Points with a spell, expend a Bardic Inspiration die to add its roll to healing (once per turn)." +
                          "\n    - Tale of Gloam: When giving Bardic Inspiration as a Bonus Action, take the Disengage or Hide action as part of that Bonus Action." +
                          "\n    - Tale of Mirth: As a Reaction, expend a Bardic Inspiration die when an enemy succeeds on a saving throw. Subtract the die roll from their save, potentially causing failure.",
            action : [["action", " (invoke tale)"]]
        },
        "subclassfeature3.1" : {
            name : "Primal Lorist",
            source : [["U25", 1]],
            minlevel : 3,
            spellcastingBonus : [{
                name : "Primal Lorist",
                "class" : "druid",
                level : [0, 0],
                firstCol : 'atwill'
            }],
            skillProfs : [["Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Survival"], 1]
        },
        "subclassfeature6" : {
            name : "Blessing of the Moonwells",
            source : [["U25", 1]],
            minlevel : 6,
            description : "When concentrating on moon beam cast with this feature, I glow faintly (dim light, 5-ft) and when a creature fails its saving throw against Moonbeam, another creature you see within 60 ft regains 2d4 Hit Points.",
            spellcastingBonus : {
                name : "Blessing of the Moonwells",
                spells : ["moonbeam"],
                selection : ["moonbeam"],
                prepared : true
            },
            usages : 1,
            recovery : ["long rest"],
            altResource: "SS 3+",
            action : [["bonus action", " (cast Moonbeam)"]]
        },
        "subclassfeature14" : {
            name : "Bolstered Folktales",
            source : [["U25", 1]],
            minlevel : 14,
            description : "\n    - Tale of Life or Mirth: Can roll 1d6 instead of expending a Bardic Inspiration die." +
                          "\n    - Tale of Gloam: Teleport up to 30 ft to an unoccupied space you can see as part of the Bonus Action.",
        }
    }
});

AddSubClass("cleric", "knowledge domain", {
    regExpSearch : /^(?=.*(cleric|priest|clergy|acolyte))(?=.*(knowledge|wisdom|learning)).*$/i,
    subname : "UA Knowledge Domain",
    source : [["UA2025", 1]],
    spellcastingExtra : [
        "command", "comprehend languages", "detect magic", "detect thoughts", 
        "identify", "mind spike", "dispel magic", "nondetection", 
        "tongues", "arcane eye", "banishment", "confusion",
        "legend lore", "scrying", "synaptic static"
    ],
    features : {
        "subclassfeature3" : {
            name : "Blessings of Knowledge",
            source : [["UA2025", 1]],
            minlevel : 3,
            description : "\n   " + "Gain proficiency with one type of Artisan's Tools and two skills from Arcana, History, Nature, or Religion." +
                          "\n   " + "You have Expertise in the two chosen skills.",
            skillstxt : "Choose two from Arcana, History, Nature, and Religion. You also gain Expertise in these skills.",
            toolProfs : [["Artisan's Tools", 1]]
        },
        "subclassfeature3.1" : {
            name : "Mind Magic",
            source : [["UA2025", 1]],
            minlevel : 3,
            description : "\n As a Magic action, expend one use of Channel Divinity to cast a prepared Knowledge Domain spell without expending a spell slot or needing material components.",
            action : [["action (magic)", "(Channel Divinity)"]]
        },
        "subclassfeature6" : {
            name : "Unfettered Mind",
            source : [["UA2025", 1]],
            minlevel : 6,
            description : "\n   Gain telepathy out to 60 feet. Contact a number of creatures equal to your Wisdom modifier simultaneously." +
                          "\n   If your total for an Intelligence check is lower than your Wisdom score, you can use that score instead."
        },
        "subclassfeature17" : {
            name : "Divine Foreknowledge",
            source : [["UA2025", 1]],
            minlevel : 17,
            description : "\n   Oncer per long rest (or SS 6+) use a Bonus Action to gain Advantage on all D20 Tests for one hour.",
            usages: 1,
            recovery: ["long rest"],
            altResource: "SS 6+",
            action: [["bonus action"]]
        }
    }
});

AddSubClass("fighter", "purple dragon knight", {
    regExpSearch: /^(?=.*purple)(?=.*dragon)(?=.*knight).*$/i,
    subname: "UA Purple Dragon Knight",
    source: [["U25", 0]],
    features: {
        "subclassfeature3": {
            name: "Knightly Envoy",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "I learn one language of my choice",
                "I can cast the Comprehend Languages spell as a ritual using Intelligence as my spellcasting ability"
            ]),
            languageProfs: [1],
            spellcastingBonus: [{
                name: "Comprehend Languages (Ritual)",
                spells: ["comprehend languages"],
                selection: ["comprehend languages"],
                firstCol: "R"
            }]
        },
        "subclassfeature3.1": {
            name: "Purple Dragon Companion",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "I am bonded with an amethyst dragon hatchling as my companion",
                "The dragon is friendly to me and my allies and obeys my commands",
                "In combat, it acts during my turn, taking only the Dodge action unless I use a bonus action to command otherwise"
            ]),
            action: [["bonus action", "Command Dragon"]],
            creaturesAdd : [["Purple Dragon Companion", true]],
            creatureOptions: [{
                name: "Purple Dragon Companion",
                source: [["U25", 0]],
                size: 4, // Small
                type: "Dragon",
                alignment: "Neutral",
                ac: "13+Int",
                hp: "4 + (Fighter level × 4)",
                hd: ["Fighter", 6],
                speed: "30 ft, fly 30 ft, swim 30 ft",
                scores: [16, 16, 12, 8, 13, 10], // Str, Dex, Con, Int, Wis, Cha
                saves: ["+3", "+3", "+1", "-1", "+1", "+0"], // Str, Dex, Con, Int, Wis, Cha
                senses: "Darkvision 60 ft",
                passivePerception: 11,
                languages: "Understands the languages you know; telepathy 30 ft",
                challengeRating: "0",
                proficiencyBonus: 2,
                proficiencyBonusLinked: true,
                attacksAction: 1,
                attacks: [{
                    name: "Rend",
                    ability: 1,
                    damage: [1, 6, "force"],
                    range: "Melee (5 ft)",
                    description: "Plus Intelligence modifier Force damage",
                    modifiers: ["+3", "", ""], // Attack, Damage, Range
                    abilitytodamage: false
                }],
                attacks : [{
					name : "Bite",
					ability : 1,
					damage : [1, 6, "piercing"],
					modifiers : ["", "Prof"],
					range : "Melee (5 ft)",
					description : "", //+1d6 damage of the chosen Draconic Essense type
					abilitytodamage : false
				}],
                features: [{
                    name: "Amphibious",
                    description: "The dragon can breathe both air and water."
                }, {
                    name: "Stalwart Bond",
                    description: "Add half your Proficiency Bonus (round down) to any ability check or saving throw the dragon makes."
                }],
                actions: [{
                    name: "Gravity Breath (2/Day)",
                    description: "Constitution Saving Throw: DC 8 + Proficiency Bonus + Intelligence modifier, each creature in a 15-foot Cone. Failure: The target is pulled up to 15 feet straight toward the dragon or pushed 15 feet straight away from the dragon (your choice)."
                }],
                calcChanges : {
					hp : function (totalHD, HDobj, prefix) {
						if (!classes.known.fighter) return;
						var fighterLvl = classes.known.fighter ? classes.known.fighter.level : classes.known.fighter.level;
						var fighterLvlM = 5 * fighterLvl;
						HDobj.alt.push(5 + fighterLvlM);
						HDobj.altStr.push(" = 5 as a base\n + 5 \xD7 " + fighterLvl + " from five times its rider's fighter level (" + fighterLvl + ")");
					},
					setAltHp : true
				}
            }]            
        },
        "subclassfeature7": {
            name: "Dragon Rider",
            source: [["U25", 0]],
            minlevel: 7,
            description: desc([
                "The dragon grows to Medium size and can serve as a mount if I am Medium or smaller",
                "While riding it, the dragon falls at the end of its turn if airborne and only held aloft by its Fly Speed",
                "Its Gravity Breath improves to a 30-ft cone and deals an additional 2d6 Force damage on failed saves"
            ]),
            eval:
              function(prefix) {
                  PickDropdown(prefix + 'Comp.Desc.Size', 3); // Medium
              },
              removeeval:
              function(prefix) {
                  PickDropdown(prefix + 'Comp.Desc.Size',4)//reverting small 
              }
        },
        "subclassfeature10": {
            name: "Rallying Surge",
            source: [["U25", 0]],
            minlevel: 10,
            description: desc([
                "When I use my Action Surge, I can choose up to three allies within a 30-ft emanation who can take a Reaction to either Advance or Retreat:",
                " - Advance: Make one weapon attack or Unarmed Strike (dragon can make a Rend attack)",
                " - Retreat: Move up to half their Speed without provoking Opportunity Attacks"
            ])
        },
        "subclassfeature15": {
            name: "Amethyst Pinnacle",
            source: [["U25", 0]],
            minlevel: 15,
            description: desc([
                "My purple dragon grows to Large size and its Speed and Fly Speed increase to 40 ft",
                "The dragon no longer falls at the end of a turn if airborne while I’m riding it",
                "Tandem Attack: I can forego one attack to command the dragon to Rend, or two attacks for Gravity Breath"
            ]),
            eval: function(prefix) {
                PickDropdown(prefix + 'Comp.Desc.Size', 2); // Large
                var sMoveStr = (typePF ? ",\n" : ", ") + "fly 40 ft";
                if (What("Unit System") === "metric") sMoveStr = ConvertToMetric(sMoveStr, 0.5);
                tDoc.getField(prefix + "Comp.Use.Speed").value += sMoveStr;
            },
            removeeval: function(prefix) {
                PickDropdown(prefix + 'Comp.Desc.Size', 3); // Revert to Medium
                var sMoveStr = (typePF ? ",\n" : ", ") + "fly 40 ft";
                if (What("Unit System") === "metric") sMoveStr = ConvertToMetric(sMoveStr, 0.5);
                Value(prefix + "Comp.Use.Speed", What(prefix + "Comp.Use.Speed").replace(sMoveStr, ""));
            },
        },
        "subclassfeature18": {
            name: "Enduring Commander",
            source: [["U25", 0]],
            minlevel: 18,
            description: desc([
                "I and my purple dragon gain Resistance to Force and Psychic damage"
            ]),
            dmgres: ["Force", "Psychic"],
        },

    }
});

AddSubClass("paladin", "oath of the genie", {
    regExpSearch: /^(?=.*genie)(?=.*paladin|oath).*$/i,
    subname: "Oath of the Genie",
    source: [["U25", 0]],
    features: {
        "subclassfeature3": {
            name: "Elemental Smite",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "After casting Divine Smite, I can use Channel Divinity for one of these effects:",
                " \u2022 Dao's Crush: Target is Grappled and Restrained (escape DC = spell save DC)",
                " \u2022 Djinni's Escape: Teleport 30 ft and gain mist form until end of next turn",
                " \u2022 Efreeti's Fury: Deal extra 2d4 Fire damage",
                " \u2022 Marid's Surge: 10-ft emanation Str save or pushed 15 ft and knocked prone"
            ]),
            action: [["reaction", "Elemental Smite (after Divine Smite)"]],
            spellcastingExtra: ["chromatic orb", "elementalism", "thunderous smite", "mirror image", "phantasmal force", "fly", "gaseous form", "conjure minor elementals", "summon elemental", "banishing smite", "contact other plane"]
        },
        "subclassfeature3.1": {
            name: "Genie's Splendor",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "When not wearing Medium or Heavy armor, I add my Charisma modifier to AC (min +1)",
                "I gain proficiency in one skill: Acrobatics, Intimidation, Performance, or Persuasion"
            ]),
            skillstxt: "Choose one from: Acrobatics, Intimidation, Performance, or Persuasion",
            extraAC: {
                mod: "Cha",
                text: "While not wearing medium or heavy armor, I add my Charisma modifier to AC.",
                stopeval: function(v) { return v.heavyArmor || v.mediumArmor; }
            }
        },
        "subclassfeature7": {
            name: "Aura of Elemental Shielding",
            source: [["U25", 0]],
            minlevel: 7,
            description: desc([
                "At the start of my turn, choose Acid, Cold, Fire, Lightning, or Thunder damage",
                "Allies in my Aura of Protection have resistance to that damage type"
            ])
        },
        "subclassfeature15": {
            name: "Elemental Rebuke",
            source: [["U25", 0]],
            minlevel: 15,
            description: desc([
                "As a reaction when hit by an attack, I can halve the damage against myself",
                "The attacker must make a Dex save or take 4d10 + Cha mod damage (half on success)",
                "Damage type is my choice of: Acid, Cold, Fire, Lightning, or Thunder"
            ]),
            action: [["reaction", ""]],
            usages: "Charisma modifier per ",
            usagescalc: "event.value = Math.max(1, What('Cha Mod'));",
            recovery: "long rest"
        },
        "subclassfeature20": {
            name: "Noble Scion",
            source: [["U25", 0]],
            minlevel: 20,
            description: desc([
                "As a bonus action (or SS 5+), for 10 minutes, I gain:",
                " \u2022 Flight: 60 ft flying speed and hover",
                " \u2022 Minor Wish: As a reaction, I can turn an ally's failed D20 Test in my aura into a success"
            ]),
            action: [["bonus action", ""], ["reaction", "Minor Wish"]],
            recovery: "long rest",
            altResource: "SS 5+",
            usages: 1
        }
    }
});

AddSubClass("ranger", "winter walker", {
    regExpSearch: /^(?=.*winter)(?=.*walker).*$/i,
    subname: "Winter Walker",
    source: [["U25", 0]],
    features: {
        "subclassfeature3": {
            name: "Frigid Explorer",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "I have resistance to Cold damage. When I hit with a weapon, I can deal additional Cold damage once per target's turn. This extra damage ignores Cold resistance"
            ]),
            additional: levels.map(function(n) {
                return n < 11 ? "1d4" : "1d6";
            }),
            dmgres: ["Cold"],
            spellcastingExtra: ["ice knife", "pass without trace", "remove curse", "ice storm", "cone of cold"]
        },
        "subclassfeature3.1": {
            name: "Hunter's Rime",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "When I cast Hunter's Mark, I gain temporary HP equal to 1d10 + ranger level",
                "While a creature is marked by my Hunter's Mark, it can't take the Disengage action"
            ]),
            additional : levels.map(function (n) {
				return "1d10+" + n;
			})   
        },
        "subclassfeature7": {
            name: "Fortifying Soul",
            source: [["U25", 0]],
            minlevel: 7,
            description: desc([
                "After a short rest, I can choose creatures I see (equal to Wis mod, min 1)",
                "Each chosen creature regains 1d10 + ranger level HP",
                "They also have advantage on saves vs. Frightened for 1 hour"
            ]),
            usages: 1,
            recovery: "long rest",
            additional : levels.map(function (n) {
				return "1d10+" + n;
			})   
        },
        "subclassfeature11": {
            name: "Chilling Retribution",
            source: [["U25", 0]],
            minlevel: 11,
            description: desc([
                "As a reaction when hit by an attack, I can force the attacker to make a Wisdom savec or be frightened until the end of my next turn with 0 speed"
            ]),
            action: [["reaction", ""]],
            usages: "Wisdom modifier per ",
            usagescalc: "event.value = Math.max(1, What('Wis Mod'));",
            recovery: "long rest"
        },
        "subclassfeature15": {
            name: "Frozen Haunt",
            source: [["U25", 0]],
            minlevel: 15,
            description: desc([
                "When I cast Hunter's Mark, I can adopt a ghostly, snowy form until the spell ends:",
                " \u2022 Frozen Soul: I'm immune to Cold damage and deal 2d4 Cold damage in 15-ft emanation",
                " \u2022 Partially Incorporeal: Immune to grappled/prone/restrained; move through creatures/object as difficult terrain",
                "Take 1d10 Force damage if ending turn inside a creature/object"
            ]),
            usages: 1,
            recovery: "long rest",
            altResource: "SS 4+"
        }
    }
});

AddSubClass("rogue", "scion of the three", {
    regExpSearch: /^(?=.*scion)(?=.*three).*$/i,
    subname: "Scion of the Three",
    source: [["U25", 0]],
    features: {
        "subclassfeature3": {
            name: "Bloodthirst",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "My Sneak Attack deals extra weapon damage vs. Bloodied equal to half my rogue level (round up)",
                "When an enemy I see drops to 0 HP, I can use my reaction to teleport within 30 ft",
                "After teleporting, I can make one melee attack"
            ]),
            action: [["reaction", "Bloodthirst Teleport"]],
            usages: "Intelligence modifier per ",
            usagescalc: "event.value = Math.max(1, What('Int Mod'));",
            recovery: "long rest",
            calcChanges: {
                atkAdd: [
                    function(fields, v) {
                        if (v.isSneakAttack) {
                            fields.Description += (fields.Description ? '; ' : '') + 'Extra ' + Math.ceil(classes.known.rogue.level/2) + ' damage vs. Bloodied';
                        }
                    },
                    "My Sneak Attack deals extra damage against Bloodied targets."
                ]
            }
        },
        "subclassfeature3.1": {
            name: "Dread Allegiance",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "After a long rest, I choose one of the Dead Three and gain its benefits:",
                "\u2022 Bane: Psychic resistance and Minor Illusion cantrip",
                "\u2022 Bhaal: Poison resistance and Blade Ward cantrip",
                "\u2022 Myrkul: Necrotic resistance and Chill Touch cantrip"
            ]),
            spellcastingBonus: [{
                name: "Dread Allegiance",
                spells: ["minor illusion", "blade ward", "chill touch"],
                selection: ["minor illusion", "blade ward", "chill touch"],
                firstCol: "checkbox",
            }],
            spellChanges : {
                "minor illusion" : {
                    name : "Minor Illusion (Bane)",
                    changes :  "Gained from Bane"
                },
                "blade ward" : {
                    name : "Blade Ward (Bhaal)",
                    changes :  "Gained from Bhaal"
                },
                "chill touch" : {
                    name : "Chill Touch (Myrkul)",
                    changes :  "Gained from Myrkul"
                }
            },
            dmgres: ["Psychic (Bane)", "Poison (Bhaal)", "Necrotic (Myrkul)"],
        },
        "subclassfeature9": {
            name: "Strike Fear",
            source: [["U25", 0]],
            minlevel: 9,
            description: desc([
                "I gain the Terrify Cunning Strike option:",
                "Terrify (Cost: 1d6): Target must make a Wisdom save or become frightened for 1 minute",
                "The frightened target can repeat the save at the end of each of its turns"
            ])
        },
        "subclassfeature13": {
            name: "Aura of Malevolence",
            source: [["U25", 0]],
            minlevel: 13,
            description: desc([
                "At the start of my turn, chosen creatures within 10 ft take damage equal to my Int mod (min 1)",
                "Damage type matches my Dread Allegiance resistance and ignores resistance",
                "The aura is inactive while I am incapacitated"
            ])
        },
        "subclassfeature17": {
            name: "Dread Incarnate",
            source: [["U25", 0]],
            minlevel: 17,
            description: desc([
                "I gain the following benefits:",
                "\u2022 Battle Tyrant: I have advantage on attacks against frightened creatures",
                "\u2022 Murderous Intent: I can treat 1s and 2s as 3s on Sneak Attack damage dice"
            ])
        }
    }
});

AddSubClass("sorcerer", "spellfire", {
    regExpSearch: /^(?=.*spellfire).*$/i,
    subname: "Spellfire",
    source: [["U25", 0]],
    features: {
        "subclassfeature3": {
            name: "Spellfire Burst",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "When I spend Sorcery Points during my turn, I can use one of these effects once per turn:",
                "\u2022 Bolstering Flames: Grant 1d4 + Cha mod temp HP to self or creature within 30 ft",
                "\u2022 Radiant Fire: Force Dex save on creature within 30 ft or take 1d6 Fire/Radiant damage"
            ])
        },
        "subclassfeature3.1": {
            name: "Spellfire Spells",
            source: [["U25", 0]],
            minlevel: 3,
            description: "\n   I learn additional spells, which do not count against my number of spells known",
            spellcastingExtra: ["cure wounds", "guiding bolt", "lesser restoration", "scorching ray", "aura of vitality", "dispel magic", "fire shield", "wall of fire", "greater restoration", "flame strike"]
        },
        "subclassfeature6": {
            name: "Absorb Spells",
            source: [["U25", 0]],
            minlevel: 6,
            description: desc([
                "I always have Counterspell prepared. When a target fails its save against my Counterspell, I regain 1d4 Sorcery Points"
            ]),
            spellcastingBonus: [{
                name: "Absorb Spells",
                spells: ["counterspell"],
                selection: ["counterspell"],
                firstCol: "atwill"
            }]
        },
        "subclassfeature14": {
            name: "Honed Spellfire",
            source: [["U25", 0]],
            minlevel: 14,
            description: desc([
                "My Spellfire Burst improves:",
                "\u2022 Bolstering Flames now adds my sorcerer level to the temporary HP",
                "\u2022 Radiant Fire now deals 3d6 damage instead of 1d6"
            ])
        },
        "subclassfeature18": {
            name: "Crown of Spellfire",
            source: [["U25", 0]],
            minlevel: 18,
            description: desc([
                "As a bonus action, I gain these benefits for 1 minute:",
                "\u2022 Burning Life Force: When hit by an attack, I can spend Hit Dice (max = Cha mod)",
                "   Reduce damage by total rolled + sorcerer level (once per turn)",
                "\u2022 Flight: 60 ft flying speed and hover",
                "\u2022 Spell Avoidance: Succeed on saves vs. spells = no damage, fail = half damage",
                "   This doesn't work while incapacitated",
                "I can use this again by spending 7 sorcery points (no action required)"
            ]),
            action: [["bonus action", ""]],
            usages: 1,
            recovery: "long rest",
            altResource: "7 SP"
        }
    }
});

AddSubClass("wizard", "bladesinging", {
    regExpSearch: /(bladesinging|bladesinger)/i,
    subname: "UA Tradition of Bladesinging",
    source: [["U25", 0]],
    features: {
        "subclassfeature3": {
            name: "Training in War and Song",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "I gain proficiency with all melee martial weapons without Two-Handed or Heavy properties",
                "I can use a melee weapon I'm proficient with as a spellcasting focus for wizard spells",
                "I gain proficiency in one skill: Acrobatics, Athletics, Performance, or Persuasion"
            ]),
            weaponProfs: [false, true, "melee martial (no Two-Handed or Heavy)"],
            skillstxt: "Choose one from: Acrobatics, Athletics, Performance, or Persuasion"
        },
        "subclassfeature3.1": {
            name: "Bladesong",
            source: [["U25", 0]],
            minlevel: 3,
            description: desc([
                "As a bonus action, I can start the Bladesong for 1 minute if not wearing armor/shield",
                "It ends if I'm incapacitated, wear armor/shield, or use two hands to attack",
                "While active, I gain these benefits:",
                " \u2022 Intelligence modifier (min +1) to AC",
                " \u2022 Walking speed increases by 10 feet",
                " \u2022 Can use Intelligence instead of Strength/Dexterity for weapon attacks/damage",
                " \u2022 Add Intelligence modifier to Constitution saves for concentration"
            ]),
            action: [["bonus action", "Bladesong (Start)"]],
            usages: "Intelligence modifier per ",
            usagescalc: "event.value = Math.max(1, What('Int Mod'));",
            recovery: "long rest",
            extraAC: {
                mod: "Int",
                text: "While Bladesong is active, I add my Intelligence modifier to AC.",
                stopeval: function(v) { return v.heavyArmor || v.mediumArmor || v.usingShield; }
            },
            calcChanges : {
				atkAdd : [
					function (fields, v) {
						if (What('Int Mod') > What(AbilityScores.abbreviations[fields.Mod - 1] + ' Mod') && fields.Proficiency && /^(?=.*bladesong)(?!.*((^|[^+-]\b)2|\btwo).?hand(ed)?s?\b)|\bheavy\b.*$/i.test(v.WeaponText)) {
							fields.Mod = 4;
						};
					},
					"If I include the word 'bladesong' in the name of a weapon that is not two-handed or heavy, it will use intelligence for its attack and damage rolls."
				]
			}
        },
        "subclassfeature6": {
            name: "Extra Attack",
            source: [["U25", 0]],
            minlevel: 6,
            description: desc([
                "I can attack twice when I take the Attack action on my turn and I can cast a wizard cantrip in place of an attack"
            ])
        },
        "subclassfeature10": {
            name: "Song of Defense",
            source: [["U25", 0]],
            minlevel: 10,
            description: desc([
                "As a reaction while Bladesong is active, I can expend a spell slot to reduce damage",
                "The damage I take is reduced by 5 × the level of the spell slot expended"
            ]),
            action: [["reaction", "Song of Defense"]]
        },
        "subclassfeature14": {
            name: "Song of Victory",
            source: [["U25", 0]],
            minlevel: 14,
            description: "\n   After I cast a spell with a casting time of an action, I can make one weapon attack as a bonus action",
            action: [["bonus action", "Attack (after spell)"]]
        }
    }
});