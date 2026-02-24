/*	-INFORMATION-
	Subject:	Subclasses (a.k.a. Archetype) & Magic Items
	Effect:		This script adds the subclasses from XUA25AS & their updates from XUA25AU. These Subclasses are a transciption of the subclasses found in XUA25AS & XUA25AU, transcribed by MasterJedi2014. The Transmuter's Stone & Potent Stone features of the Transmutation Wizard have been made into Magic Items.
	Code by:	MasterJedi2014, using MorePurpleMoreBetter's code as reference
	Date:		2025-12-06 (sheet v13.2.3)
	Notes:		This file will start by shunting the old subclasses into "Legacy" subclasses using code primarily developed by Shroo.
				It will thereafter define the new UA subclasses, followed by the "Transmuter's Stone" & "Potent Transmuter's Stone" Magic Items.
*/

var iFileName = "XUA25AU Content [by MasterJedi2014] V6.js";
RequiredSheetVersion("13.2.3");

/*	-SCRIPT AUTHOR NOTE-
	This file should be installed AFTER the other 2024 PHB & DMG scripts made by ThePokésimmer.
*/

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
// >>> Define Sources for everything first >>> //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

SourceList["XUA25AS"] = {
	name : "Unearthed Arcana 2025: Arcane Subclasses",
	abbreviation : "XUA25AS",
	date : "2025/06/26",
	group : "UA:5.24E",
	url : "https://media.dndbeyond.com/compendium-images/ua/arcane-subclasses/zepvK7DBkeSt6dqv/UA2025-ArcaneSubclasses.pdf",
};

SourceList["XUA25AU"] = {
	name : "Unearthed Arcana 2025: Arcane Updates",
	abbreviation : "XUA25AU",
	date : "2025/09/18",
	group : "UA:5.24E",
	url : "https://media.dndbeyond.com/compendium-images/ua/arcane-subclasses-update/LEwFmioFBYHWqzpd/UA2025-ArcaneSubclassesUpdate.pdf",
};

SourceList["MJ:HB"] = {
	name : "MasterJedi2014's Homebrew",
	abbreviation : "MJ:HB",
	date : "2024/04/20",
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
// >>> Define functions used for refactoring old classes & subclasses >>> //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

// Coded By: ThePokésimmer with contributions from morepurplemorebetter (Joost), MasterJedi2014, Shroo, Reading Toskr, TrackAtNite, evanelric, TappyTap, Mente, Rocky, ShadowzAll, and Jeremy
// Functions
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
function legacyClassRefactor(classKey, newClass) {
  if (!(classKey in ClassList)) {
    ClassList[classKey] = newClass;
  } else {
    newClass.subclasses = ClassList[classKey].subclasses;
    ClassList[classKey] = newClass;
  }
}
function archiveSubClass(classKey, subClass, newClassName) {
  subClass.subname = subClass.subname + " - 2014";
  if ('fullname' in subClass) {
    subClass.fullname = subClass.fullname + " - 2014";
  }
  subClass.source = [["LEGACYCLASS", 1]];
  for (var i of ClassList[classKey].subclasses[1]) {
    if (ClassSubList[i].regExpSearch.test(newClassName)) {
      var regex = "(?=^.*" + subClass.regExpSearch.source + ".*$)(?!^" + escapeRegExp(newClassName) + "$)";
      ClassSubList[i].regExpSearch = new RegExp(regex, 'i');
    }
  }
}
function legacySubClassRefactor(classKey, subClassKey, nSC) {
  var newSubClassName = classKey + "-" + subClassKey;
  var prv = null;
  if (newSubClassName in ClassSubList) {
    prv = ClassSubList[newSubClassName];
    AddSubClass(classKey, subClassKey + "_2014", prv);
    ClassSubList[newSubClassName] = nSC;
  } else {
    if ('replaces' in nSC && classKey + '-' + nSC.replaces in ClassSubList) {
        prv = ClassSubList[classKey + '-' + nSC.replaces];
      }
    AddSubClass(classKey, subClassKey, nSC);
  }
  if (prv != null) {
    var newRegex = nSC.regExpSearch;
    var bc = ClassList[classKey];
    var newClassName = nSC.fullname ? nSC.fullname : bc.name + " (" + nSC.subname + ")";
    archiveSubClass(classKey, prv, newClassName);
    nSC.regExpSearch = newRegex;
  }
    return nSC;
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
// >>> Define new/replacement subclass content >>> //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

legacySubClassRefactor("cleric", "arcana", {
  regExpSearch: /^(?=.*(cleric))(?=.*(arcana)).*$/i,
  subname: "Arcana Domain",
  source: [["XUA25AS", 1]],
  replaces: "arcana domain",
  spellcastingExtra: ["detect magic", "magic missile", "magic weapon", "nystul's magic aura", "counterspell", "dispel magic", "arcane eye", "leomund's secret chest", "bigby's hand", "teleportation circle"],
  features: {
    "subclassfeature3": {
      name : "Arcane Initiate",
	  source : [["XUA25AS", 2]],
	  minlevel : 3,
	  description : desc([
		"I gain Expertise with Arcana and two wizard cantrips that count as cleric cantrips",
	  ]),
	  skills : ["Arcana", "full"],
	  spellcastingBonus : [{
		name : "Arcane Initiate",
		"class" : "wizard",
		level : [0, 0],
		times : 2
	  }],
    },
    "subclassfeature3.1": {
      name : "Channel Divinity: Modify Magic",
	  source : [["XUA25AS", 2]],
	  minlevel : 3,
	  description : desc([
		"When I cast a spell, I can expend one use of my Channel Divinity \u0026 change the spell in one of the following ways (no action required).",
		" \u2022 Fortifying Spell. One target of the spell gains a number of Temp HP equal to 2d8 + my Cleric level.",
		" \u2022 Tenacious Spell. When I cast a spell that forces a creature to make a saving throw, choose one target of the spell I can see. Roll 1d6 \u0026 apply the number rolled as a penalty to the target's saving throw."
	  ]),
    },
    "subclassfeature6": {
      name: "Dispelling Recovery",
      source: [["XUA25AS", 2]],
      minlevel: 6,
      description: desc([
        "Immediately after I cast a spell with a spell slot that restores HP to a creature or ends a condition on a creature, I can cast Dispel Magic on the creature as a Bonus Action without expending a spell slot.",
		"I can use this feature a number of times equal to my Wis modifier (minimum of once), \u0026 I regain all expended uses when I finish a Long Rest."
      ]),
	  action : [["bonus action", "Channel Divinity: Dispelling Recovery"]],
	  usages : "Wisdom modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Wis Mod'));",
	  recovery : "long rest",
    },
    "subclassfeature17": {
      name : "Arcane Mastery",
	  source : [["XUA25AS", 2]],
	  minlevel : 17,
	  description : desc([
		"I add four wizards spells, a 6th, 7th, 8th, and 9th-level spell, to my domain spells.",
		"As any domain spell, these spells are automatically prepared and count as cleric spells.",
		"Whenever I gain a Cleric level, I can replace one of these spells with another Wizard spell of the same level.",
	  ]),
	  spellcastingBonus : [{
		name : "Arcane Mastery (6)",
		"class" : "wizard",
		level : [6, 6],
		firstCol : 'markedbox'
	  }, {
		name : "Arcane Mastery (7)",
		"class" : "wizard",
		level : [7, 7],
		firstCol : 'markedbox'
	  }, {
		name : "Arcane Mastery (8)",
		"class" : "wizard",
		level : [8, 8],
		firstCol : 'markedbox'
	  }, {
		name : "Arcane Mastery (9)",
		"class" : "wizard",
		level : [9, 9],
		firstCol : 'markedbox'
	  }],
    },
  },
});
legacySubClassRefactor("fighter", "arcane archer", {
  regExpSearch: /^(?=.*(arcane))(?=.*(archer)).*$/i,
  subname: "Arcane Archer",
  source: [["XUA25AU", 2]],
  replaces: "arcane archer",
  features: {
    "subclassfeature3": {
      name : "Arcane Archer Lore",
	  source : [["XUA25AU", 2]],
	  minlevel : 3,
	  description : desc([
		"I gain Proficiency in Arcana \u0026 Nature. If I already have Prof in one or both, I instead gain Prof with a skill (or 2) of my choice.",
		"I know either the Druidcraft or Prestidigitation cantrip. Intelligence is my spellcasting ability for it.",
	  ]),
	  skills : [
		"Arcana",
		"Nature",
	  ],
	  spellcastingBonus : [{
		name : "Arcane Archer Lore",
		spellcastingAbility : 4,
		selection : ["druidcraft", "prestidigitation"],
		times : 1
	  }],
    },
    "subclassfeature3.1": {
      name : "Arcane Shot",
	  source : [["XUA25AU", 2]],
	  minlevel : 3,
	  description : desc([
		'Arcane Shot Options. I learn two Arcane Shot options of my choice from the "Choose Feature" button above.',
		"  I learn an additional Arcane Shot option of my choice when I reach Fighter lvls 7, 10, 15, \u0026 18. When I learn a new Arcane Shot option, I can replace one option I know with a different one.",
		"Using Arcane Shot. Once per turn when I make a ranged attack using a weapon with the Ammunition property, I can apply one of my Arcane Shot options to that attack. I decide to use the option when I hit a creature and deal damage to it unless the option doesn't involve an attack roll.",
		"  I can use this feature my Int mod (min 1) number of times per Short/Long Rest, regaining all uses after a Short/Long Rest.",
		"Saving Throws. If an Arcane Shot option requires a saving throw, the DC equals 8 + my Int mod + my Prof Bonus.",
	  ]),
	  additional : levels.map(function (n) {
		return n < 2 ? "" : (n < 7 ? 2 : n < 10 ? 3 : n < 15 ? 4 : n < 18 ? 5 : 6) + " Arcane Shot options known; 1d" + (n < 10 ? 6 : n < 15 ? 8 : n < 18 ? 10 : 12) + " Arcane Shot Die size";
	  }),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "short rest",
	  extraname: "Arcane Shot",
	  extrachoices: ["Banishing Shot", "Beguiling Shot", "Bursting Shot", "Enfeebling Shot", "Grasping Shot", "Piercing Shot", "Seeking Shot", "Shadow Shot"],
	  extraTimes: [0, 0, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6],
	  "banishing shot": {
		name: "Banishing Shot",
		description: desc([
		  "My magic temporarily sequesters my target in a harmless demiplane. The creature I hit takes additional Psychic damage equal to one roll of my Arcane Shot Die and must succeed on a Charisma saving throw or be banished. While banished, the creature has the Incapacitated condition and a Speed of 0. At the end of its next turn, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space.",
		]),
	  },
	  "beguiling shot": {
		name: "Beguiling Shot",
		description: desc([
		  "My magic causes the ammunition to temporarily beguile my target. The creature I hit takes additional Psychic damage equal to two rolls of my Arcane Shot Die and must succeed on a Wisdom saving throw or have the Charmed condition until the start of my next turn, treating either myself or one of my allies within 30 feet of the target (my choice) as the charmer. The Charmed condition ends early if the charmer attacks the target, deals damage to it, or forces it to make a saving throw.",
		]),
	  },
	  "bursting shot": {
		name: "Bursting Shot",
		description: desc([
		  "I imbue my ammunition with explosive force energy. Immediately after I deal damage to the creature, my target and each creature within a 10-foot Emanation originating from the target takes Force damage equal to two rolls of my Arcane Shot Die.",
		]),
	  },
	  "enfeebling shot": {
		name: "Enfeebling Shot",
		description: desc([
		  "My ammunition saps my target's strength. The creature I hit takes additional Necrotic damage equal to two rolls of my Arcane Shot Die. The target must also succeed on a Constitution saving throw or have the Poisoned condition until the end of its next turn. Whenever a target Poisoned in this way hits with an attack roll, it subtracts an amount equal to one roll of my Arcane Shot Die from the total damage of that attack.",
		]),
	  },
	  "grasping shot": {
		name: "Grasping Shot",
		description: desc([
		  "My ammunition creates clutching brambles around my target. The creature I hit takes additional Slashing damage equal to one roll of my Arcane Shot Die and must succeed on a Strength saving throw or have the Restrained condition for 1 minute or until I use this option again. The target or a creature within reach of it can take an Action to make a Strength (Athletics) check against my Arcane Shot DC, removing the brambles and ending the Restrained condition on the target on a successful check.",
		]),
	  },
	  "piercing shot": {
		name: "Piercing Shot",
		description: desc([
		  "I give my ammunition an ethereal quality. When I use this option, I don't make an attack roll for the attack. Instead, the ammunition shoots forward in a 30-foot Line that is 1 foot wide, originating from me, then vanishes. The Line ignores cover, as the ammunition phases through solid objects. Each creature in the Line must make a Dexterity saving throw. On a failed save, a creature takes damage as if it were hit plus additional Piercing damage equal to two rolls of my Arcane Shot Die. On a successful save, a creature takes half as much damage.",
		]),
	  },
	  "seeking shot": {
		name: "Seeking Shot",
		description: desc([
		  "I grant my ammunition the ability to seek out a target. When I use this option, I don't make an attack roll for the attack. Instead, choose one creature I have seen in the last minute. The ammunition flies toward that creature, moving around corners if necessary and ignoring Half Cover and Three-Quarters Cover. If the target is within your weapon's long range, the target must make a Dexterity saving throw. Otherwise, the ammunition disappears after traveling as far as it can. On a failed save, the target takes damage as if it were hit plus additional Force damage equal to two rolls of my Arcane Shot Die, and I learn the target's current location. On a successful save, the target takes half as much damage only.",
		]),
	  },
	  "shadow shot": {
		name: "Shadow Shot",
		description: desc([
		  "My magic occludes my foe's vision with shadows. The creature I hit takes additional Psychic damage equal to one roll of my Arcane Shot Die, and it must succeed on a Wisdom saving throw or have the Blinded condition until the end of its next turn.",
		]),
	  },
    },
    "subclassfeature7": {
      name: "Curving Shot",
      source: [["XUA25AU", 2]],
      minlevel: 7,
      description: desc([
        "If I make an attack roll with a weapon with the Ammunition property and miss, as a Bonus Action immediately after the attack, I can make an extra attack with the same piece of ammo against a different target that I can see, that is within the weapon's range \u0026 \u2264 60' of the attack's original target.",
      ]),
	  action : [["bonus action", " "]],
    },
	"subclassfeature7.1": {
      name: "Magical Ammunition",
      source: [["XUA25AU", 2]],
      minlevel: 7,
      description: desc([
        "As a Magic action, I can imbue a piece of nonmagical ammo with one of the following magical properties \u0026 fire it at a solid surface I can see within range.",
		"On a hit, the ammo's effect activates, and the ammo attaches to the surface for the duration of the effect, after which, it is destroyed.",
		"I can do this once per Short Rest or by expending a use of Second Wind (no action required).",
		"Darkening Shot. Magical shadows fill a 15' Emanation originating from the ammo for 1 minute. Nonmagical flames in the Emanation are extinguished, \u0026 creatures within have a -5 penalty to Wis (Perception) checks and Passive Perception.",
		"Unlocking Shot. A burst of magic fills a 15' Emanation originating from the ammo while also emitting a loud knock audible up to 300' away.",
		"  Any object in the Emanation that is held shut by a mundane lock or is stuck/barred becomes unlocked, unstuck, or unbarred. If the object has multiple locks, only one is unlocked.",
		"Vine Shot. A 60' long vine grows from the ammo. You and other creatures can then climb it. The vine withers away after 10 minutes.",
      ]),
	  action : [["action", " "]],
	  usages : 1,
	  recovery : "short rest",
	  altResource : "1 SW",
    },
	"subclassfeature10": {
      name: "Ever Ready Shot",
      source: [["XUA25AU", 2]],
      minlevel: 10,
      description: desc([
        "When I roll Initiative, I regain one expended use of Arcane Shot."
      ]),
    },
	"subclassfeature15": {
      name: "Arcane Burst",
      source: [["XUA25AU", 2]],
      minlevel: 15,
      description: desc([
        "I can push creatures away from me with my arcane mastery. When I use Indomitable, each creature of my choice in a 10' Emanation originating from me muct scceed on a Strength saving throw against my Arcane Shot DC or be pushed up to 20' straight away from me."
      ]),
    },
	"subclassfeature18": {
      name: "Masterful Shots",
      source: [["XUA25AU", 3]],
      minlevel: 18,
      description: desc([
        "When a creature I can see misses me with an attack roll, I can use my Reaction to move up to half my Speed away from the attacker without provoking Opportunity Attacks.",
		"I can then make a ranged attack roll against the attacker as part of this Reaction if the attacker is within the weapon's range."
      ]),
	  action : [["reaction", " "]],
    },
  },
});
AddSubClass("monk", "tattooed warrior", {
  regExpSearch: /^(?=.*(monk))(?=.*(tattooed))(?=.*(warrior)).*$/i,
  subname: "Tattooed Warrior",
  source: [["XUA25AU", 4]],
  features: {
    "subclassfeature3": {
      name : "Magic Tattoos",
	  source : [["XUA25AU", 4]],
	  minlevel : 3,
	  description : desc([
		"I gain magical tattoos on my body at various levels. The tattoos appear on my body wherever I wish. Damage or injury doesn't impair my magic tattoos' function. A magic tattoo's depiction can look like a brand, scarification, a birthmark, patterns of scale, or any other cosmetic alteration.",
		"If a tattoo's effect requires a saving throw, the DC equals 8 + my Wis mod + your Prof Bonus. My spellcasting ability for spells granted by a tattoo is Wisdom.",
		"Whenever I finish a Long Rest, I can reshape one of my magic tattoos, changing the option I chose from one list to another option on the same list.",
	  ]),
	  extraname: "Beast Tattoos",
	  extrachoices: ["Bat Tattoo", "Butterfly Tattoo", "Crane Tattoo", "Horse Tattoo", "Tortoise Tattoo"],
	  extraTimes: [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	  "bat tattoo": {
		name: "Bat Tattoo",
		description: desc([
		  "I know the Dancing Lights cantrip. I also gain Blindsight with a range of 10 ft.",
		]),
		spellcastingBonus : [{
		  name : "Bat Tattoo",
		  spellcastingAbility : 5,
		  spells : ["dancing lights"],
		  selection : ["dancing lights"],
		}],
	  },
	  "butterfly tattoo": {
		name: "Butterfly Tattoo",
		description: desc([
		  "I know the Light cantrip. When I make a High Jump, I can use my Dex mod instead of my Str mod to determine how high I can jump.",
		]),
		spellcastingBonus : [{
		  name : "Butterfly Tattoo",
		  spellcastingAbility : 5,
		  spells : ["light"],
		  selection : ["light"],
		}],
	  },
	  "crane tattoo": {
		name: "Crane Tattoo",
		description: desc([
		  "I know the Guidance cantrip. When I miss a creature with an attack granted by my Flurry of Blows, I have Advantage on my next attack roll against that creature before the end of my next turn.",
		]),
		spellcastingBonus : [{
		  name : "Crane Tattoo",
		  spellcastingAbility : 5,
		  spells : ["guidance"],
		  selection : ["guidance"],
		}],
	  },
	  "horse tattoo": {
		name: "Horse Tattoo",
		description: desc([
		  "I know the Message cantrip. When I expend 1 Focus Point to use Step of the Wind, my Speed increases by 10 ft until the start of my next turn.",
		]),
		spellcastingBonus : [{
		  name : "Horse Tattoo",
		  spellcastingAbility : 5,
		  spells : ["message"],
		  selection : ["message"],
		}],
	  },
	  "tortoise tattoo": {
		name: "Tortoise Tattoo",
		description: desc([
		  "I know the Spare the Dying cantrip. When I expend 1 Focus Point to use Patient Defense, I have a +1 bonus to AC until the start of my next turn.",
		]),
		spellcastingBonus : [{
		  name : "Tortoise Tattoo",
		  spellcastingAbility : 5,
		  spells : ["spare the dying"],
		  selection : ["spare the dying"],
		}],
	  },
    },
    "subclassfeature6": {
      name: "Celestial Tattoo",
      source: [["XUA25AU", 4]],
      minlevel: 6,
      description: desc([
        'I gain an additional magic tattoo depicting a celestial phenomenon. Use the "Choose Feature" button above to choose your tattoo.',
      ]),
	  extraname: "Celestial Tattoo",
	  extrachoices: ["Comet Tattoo", "Eclipse Tattoo", "Sunburst Tattoo"],
	  extraTimes: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	  "comet tattoo": {
		name: "Comet Tattoo",
		description: desc([
		  "When I take the Search action, I can expend 1 Focus Point to add 1 roll of my Martial Arts die to the Wisdom check.",
		]),
	  },
	  "eclipse tattoo": {
		name: "Eclipse Tattoo",
		description: desc([
		  "When I take the Hide action, I can expend 1 Focus Point to add 1 roll of my Martial Arts die to the Dexterity (Stealth) check.",
		]),
	  },
	  "sunburst tattoo": {
		name: "Sunburst Tattoo",
		description: desc([
		  "When I take the Study action, I can expend 1 Focus Point to add 1 roll of my Martial Arts die to the Intelligence check.",
		]),
	  },
    },
	"subclassfeature11": {
      name: "Nature Tattoo",
      source: [["XUA25AU", 4]],
      minlevel: 11,
      description: desc([
        'I gain an additional magic tattoo depicting a natural feature. Use the "Choose Feature" button above to choose your tattoo.',
      ]),
	  extraname: "Nature Tattoo",
	  extrachoices: ["Sea Storm Tattoo: Cold", "Sea Storm Tattoo: Lightning", "Sea Storm Tattoo: Thunder", "Volcano Tattoo: Acid", "Volcano Tattoo: Fire", "Volcano Tattoo: Poison"],
	  extraTimes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	  "sea storm tattoo: cold": {
		name: "Sea Storm Tattoo: Cold",
		description: desc([
		  "I gain Resistance to Cold dmg. Whenever I finish a Short or Long Rest, or use my Uncanny Metabolism feature, I can change this Resistance to Lightning or Thunder.",
		]),
		dmgres : ["Cold"],
	  },
	  "sea storm tattoo: lightning": {
		name: "Sea Storm Tattoo: Lightning",
		description: desc([
		  "I gain Resistance to Lightning dmg. Whenever I finish a Short or Long Rest, or use my Uncanny Metabolism feature, I can change this Resistance to Cold or Thunder.",
		]),
		dmgres : ["Lightning"],
	  },
	  "sea storm tattoo: thunder": {
		name: "Sea Storm Tattoo: Thunder",
		description: desc([
		  "I gain Resistance to Thunder dmg. Whenever I finish a Short or Long Rest, or use my Uncanny Metabolism feature, I can change this Resistance to Cold or Lightning.",
		]),
		dmgres : ["Thunder"],
	  },
	  "volcano tattoo: acid": {
		name: "Volcano Tattoo: Acid",
		description: desc([
		  "I gain Resistance to Acid dmg. Whenever I finish a Short or Long Rest, or use my Uncanny Metabolism feature, I can change this Resistance to Fire or Poison.",
		]),
		dmgres : ["Acid"],
	  },
	  "volcano tattoo: fire": {
		name: "Volcano Tattoo: Fire",
		description: desc([
		  "I gain Resistance to Fire dmg. Whenever I finish a Short or Long Rest, or use my Uncanny Metabolism feature, I can change this Resistance to Acid or Poison.",
		]),
		dmgres : ["Fire"],
	  },
	  "volcano tattoo: poison": {
		name: "Volcano Tattoo: Poison",
		description: desc([
		  "I gain Resistance to Poison dmg. Whenever I finish a Short or Long Rest, or use my Uncanny Metabolism feature, I can change this Resistance to Acid or Fire.",
		]),
		dmgres : ["Poison"],
	  },
    },
    "subclassfeature17": {
      name : "Monster Tattoo",
	  source : [["XUA25AU", 5]],
	  minlevel : 17,
	  description : desc([
		'I gain a magic tattoo depicting a supernatural creature. Use the "Choose Feature" button above to choose your tattoo.',
	  ]),
	  extraname: "Monster Tattoo",
	  extrachoices: ["Beholder Tattoo", "Chromatic Dragon Tattoo", "Displacer Beast Tattoo", "Troll Tattoo"],
	  extraTimes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
	  "beholder tattoo": {
		name: "Beholder Tattoo",
		description: desc([
		  "At the start of my turn, I can expend 1 Focus Point to gain a Fly Speed equal to my Speed \u0026 can hover for 10 min.",
		  "Additionally, as a Magic action, I can expend 1 Focus Point to fire four rays from my eyes. I can fire them at one or more target(s) I can see within 120 ft. Make a Ranged Spell Attack for each ray, using Wis as my spellcasting ability. On a hit, the attack deals Force damage equal to one roll of my Martial Arts die plus my Wis mod.",
		]),
		speed : {
		  fly : { spd : "walk", enc : 0 },
		},
	  },
	  "chromatic dragon tattoo": {
		name: "Chromatic Dragon Tattoo",
		description: desc([
		  "When I take the Attack action on my turn, I can expend 1 Focus Point to replace one of my attacks with an exhalation of magical energy in a 30-ft Cone. Choose a damage type: Acid, Cold, Fire, Lightning, or Poison. Each creature in that area makes a Dex save to take half dmg. On a failed save, a creature takes dmg of the chosen type equal to two rolls of my Martial Arts die plus my Wis mod.",
		]),
	  },
	  "displacer beast tattoo": {
		name: "Displacer Beast Tattoo",
		description: desc([
		  "When I expend a Focus Point to use Flurry of Blows or Step of the Wind, I can expend 1 Focus Point to cast Mirror Image as part of that Bonus Action.",
		]),
		spellcastingBonus : [{
		  name : "Displacer Beast Tattoo",
		  spellcastingAbility : 5,
		  spells : ["mirror image"],
		  selection : ["mirror image"],
		  firstCol : 1,
		}],
		spellFirstColTitle : "FP",
	  },
	  "troll tattoo": {
		name: "Troll Tattoo",
		description: desc([
		  "At the start of each of my turns, I regain HP equal to 5 + Wis mod if I am Bloodied and have at least 1 HP. Any severed body part regrows after I finish a Short or Long Rest.",
		]),
	  },
    },
  },
});
AddSubClass("sorcerer", "ancestral", {
  regExpSearch : /^(?=.*(sorcerer|witch))(?=.*(ancestral)).*$/i,
  subname : "Ancestral Sorcery",
  fullname : "Ancestral Sorcerer",
  source : [["XUA25AS", 5]],
  spellcastingExtra : ["command", "guidance", "locate object", "protection from evil and good", "resistance", "spiritual weapon", "magic circle", "spirit guardians", "divination", "locate creature", "legend lore", "yolande's regal presence"],
  spellcastingExtraApplyNonconform: true,
  features : {
    "subclassfeature3": {
      name : "Ancestor's Lore",
	  source : [["XUA25AS", 5]],
	  minlevel : 3,
	  description : desc([
		"I can add my Cha Mod (min 1) to my Int (Arcana, History, Investigation, Nature, and Religion) checks. I gain Prof in my choice of one of the aforementioned skills.",
	  ]),
	  addMod: [
        {type: "skill", field: "Arcana", mod: "Cha", text: "I can add my Charisma modifier to Arcana rolls."},
		{type: "skill", field: "History", mod: "Cha", text: "I can add my Charisma modifier to History rolls."},
		{type: "skill", field: "Investigation", mod: "Cha", text: "I can add my Charisma modifier to Investigation rolls."},
		{type: "skill", field: "Nature", mod: "Cha", text: "I can add my Charisma modifier to Nature rolls."},
		{type: "skill", field: "Religion", mod: "Cha", text: "I can add my Charisma modifier to Religion rolls."},
      ],
	  skillstxt: {
		primary: "Choose 1: Arcana, History, Investigation, Nature, or Religion",
	  },
    },
    "subclassfeature3.1": {
      name : "Visage of the Ancestor",
	  source : [["XUA25AS", 5]],
	  minlevel : 3,
	  description : desc([
		"I choose the form my ancestor takes, which might resemble the ancestor in life or a symbolic creature. While my Innate Sorcery feature is active, this form appears in a spectral haze around me, and I have Adv on any ability check I make as part of the Influence action.",
	  ]),
	  savetxt : {
		text : ["Adv on Influence action checks"],
	  },
    },
    "subclassfeature6": {
      name: "Superior Spell Disruption",
      source: [["XUA25AS", 5]],
      minlevel: 6,
      description: desc([
        "My ancestor's spellcasting mastery aids me in breaking spells. I always have Counterspell and Dispel Magic prepared.",
		"While my Innate Sorcery feature is active, I can cast each spell without expending a spell slot. If I cast Counterspell in this way, the target has Disadv on its Con saving throw. If I cast Dispel Magic in this way, I have Adv on my ability checks to end ongoing spells. Once I cast either spell without a spell slot, I must finish a Long Rest before I can cast the spell in this way again."
      ]),
	  spellcastingBonus : [{
		name : "Superior Spell Disruption",
		spellcastingAbility : 6,
		selection : ["counterspell", "dispel magic"],
		times : 2
	  }],
	  limfeaname : "Sup Spell Disrupt: Counterspell",
	  usages : 1,
	  recovery : "long rest",
	  extraLimitedFeatures : [{
		name : "Sup Spell Disrupt: Dispel Magic",
		usages : 1,
		recovery : "long rest",
	  }],
    },
	"subclassfeature14": {
	  name : "Ancestral Majesty",
	  source : [["XUA25AS", 6]],
	  minlevel : 14,
	  description : desc([
		"My ancestor's visage evokes awe or dread. While my Innate Sorcery feature is active, I am surrounded by a magical aura in a 5-foot Emanation.",
		"Whenever a creature I can see enters the Emanation or ends its turn there, I can force that creature to make a Cha saving throw.",
		"On a failed save, the target has the either the Prone or Frightened condition (my choice) until the end of my next turn. A creature makes this save only once per turn.",
	  ]),
	  action : [["reaction", "Ancestral Majesty (free action)"]],
	},
	"subclassfeature14.1": {
	  name : "Steady Spellcaster",
	  source : [["XUA25AS", 6]],
	  minlevel : 14,
	  description : desc([
		"While I am concentrating on a Sorcerer spell, it can't be broken by taking damage.",
	  ]),
	  savetxt : {
		immune : ["losing Concentration by taking dmg"],
	  },
	},
    "subclassfeature18": {
      name : "Ancestor's Ward",
	  source : [["XUA25AS", 6]],
	  minlevel : 18,
	  description : desc([
		"My ancestor's protection redirects harmful magic away from me. While my Innate Sorcery feature is active, I gain Adv on saving throws against spells.",
		"Once during my use of Innate Sorcery, when I fail a saving throw against a spell, I can choose to succeed instead.",
	  ]),
	  savetxt : {
		adv_vs : ["spells while Innate Sorcery active"],
	  },
	  limfeaname : "Ancestor's Ward (during Innate Sorcery)",
	  usages : 1,
	  recovery : "Innate Sorc",
    },
  },
});
legacySubClassRefactor("warlock", "the hexblade", {
  regExpSearch : /^(?=.*hexblade)(?=.*warlock).*$/i,
  subname: "the Hexblade",
  source: [["XUA25AS", 6]],
  replaces: "the hexblade",
  spellcastingExtra: ["arcane vigor", "hex", "shield", "wrathful smite", "bestow curse", "conjure barrage", "freedom of movement", "staggering strike", "animate objects", "steel wind strike"],
  spellcastingExtraApplyNonconform: true,
  features: {
    "subclassfeature3": {
      name : "Hexblade's Curse",
	  source : [["XUA25AS", 6]],
	  minlevel : 3,
	  description : desc([
		"As a Bonus Action, I can curse a creature I can see within 30 ft of me for 1 minute",
		"\u2022 While I'm not wearing armor or wielding a Shield, I gain +2 to AC while \u2264 10 ft from cursed target",
		"\u2022 If the target dies while cursed, I regain HP equal to 1d8 + Cha mod",
		"The curse ends after 1 minute, when the target dies, I dismiss it (no action required), or I die",
		"Alternatively, I can use this feature as part of casting a spell that curses a target",
		"When doing so, the target of the spell is the target of my Hexblade's Curse,",
		"  \u0026 its duration is either 1 min or the spell's duration, whichever is longer"
	  ]),
	  recovery : "long rest",
	  usages : "Charisma modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Cha Mod'));",
	  action : [["bonus action", ""]],
    },
    "subclassfeature3.1": {
      name : "Unyielding Will",
	  source : [["XUA25AS", 7]],
	  minlevel : 3,
	  description : desc([
		"Once per round, when I succeed on a saving throw to maintain Concentration, each creature of my choice in a 10 ft Emanation originating from me takes 2d6 Necrotic dmg.",
		"Additionally, once per Long Rest, when I fail a saving throw to maintain Concentration, I can choose to succeed instead, \u0026 I gain a number of Temp HP equal to 1d10 + my Warlock lvl.",
	  ]),
	  usages : 1,
	  recovery : "long rest",
    },
    "subclassfeature6": {
      name: "Malign Brutality",
      source: [["XUA25AS", 7]],
      minlevel: 6,
      description: desc([
        "After I cast a level 1+ spell that has a casting time of an Action, I can make one attack with a weapon as a Bonus Action.",
		"When I hit the target cursed by my Hexblade's Curse with an attack roll, the target has Disadv on the next saving throw it makes before the start of my next turn.",
		"When the target of my Hexblade's Curse ends its turn \u2265 30 ft from me, I can move up to my Speed straight toward the target."
      ]),
	  action : [["bonus action", " Extra Attack"]],
    },
	"subclassfeature10" : {
	  name : "Armor of Hexes",
	  source : [["XUA25AS", 7]],
	  minlevel : 10,
	  description : desc([
		"As a Reaction when a Hexblade's Curse recipient hits me with an attack, I can reduce the dmg taken by an amount equal to my Warlock lvl."
	  ])
	},
    "subclassfeature14": {
      name : "Masterful Hex",
	  source : [["XUA25AS", 7]],
	  minlevel : 14,
	  description : desc([
		"My attack rolls against my curse target score a critical hit on a roll of 19 and 20.",
		"I regain one expended use of Hexblade's Curse when I finish a Short Rest or use my Magical Cunning feature.",
		"Once per Long Rest or Pact Magic slot (no action required), when I deal damage to my curse target, I can cause my curse to explode with sinister energy.",
		"The target and each creature of my choice in a 30-foot Emanation originating from the target take 3d6 Necrotic, Psychic, or Radiant damage (my choice), and their Speed is reduced by 10 ft until the start of my next turn.",
	  ]),
	  calcChanges : {
		atkAdd : [
		  function (fields, v) {
			if (!v.isDC && /curse/i.test(v.WeaponTextName) && !v.CritChance) {
			  v.CritChance = 19;
			  fields.Description += (fields.Description ? '; ' : '') + 'Crit on 19-20; 1 per LR/SS, add 3d6 Nec, Psy, or Rad dmg in 30ft emanation';
			}
		  },
		  "If I include the word 'Curse' in the name of a weapon, the automation will treat the attack as being against a target of the Hexblade's Curse: adding my Explosive Hex and the increased chance of a critical hit to the description.",
		  19
		],
	  }
    },
  },
});
legacySubClassRefactor("wizard", "conjuration", {
  regExpSearch: /(conjuration|conjurer)/i,
  subname : "School of Conjuration",
  fullname : "Conjurer",
  source: [["XUA25AU", 5]],
  replaces: "school of conjuration",
  features: {
    "subclassfeature3": {
      name: "Conjuration Savant",
      source: [["XUA25AU", 5]],
      minlevel: 3,
	  spellcastingBonus: [{
		name: "Conjuration Savant (3)",
		"class": "wizard",
		school: "Conj",
		times : levels.map( function(n) {
			return n < 3 ? 0 : 2;
		}),
		level: [1, 2],
	  }, {
		name: "Conjuration Savant (5)",
		"class": "wizard",
		school: "Conj",
		times : levels.map( function(n) {
			return n < 5 ? 0 : 1;
		}),
		level: [1, 3],
	  }, {
		name: "Conjuration Savant (7)",
		"class": "wizard",
		school: "Conj",
		times : levels.map( function(n) {
			return n < 7 ? 0 : 1;
		}),
		level: [1, 4],
	  }, {
		name: "Conjuration Savant (9)",
		"class": "wizard",
		school: "Conj",
		times : levels.map( function(n) {
			return n < 9 ? 0 : 1;
		}),
		level: [1, 5],
	  }, {
		name: "Conjuration Savant (11)",
		"class": "wizard",
		school: "Conj",
		times : levels.map( function(n) {
			return n < 11 ? 0 : 1;
		}),
		level: [1, 6],
	  }, {
		name: "Conjuration Savant (13)",
		"class": "wizard",
		school: "Conj",
		times : levels.map( function(n) {
			return n < 13 ? 0 : 1;
		}),
		level: [1, 7],
	  }, {
		name: "Conjuration Savant (15)",
		"class": "wizard",
		school: "Conj",
		times : levels.map( function(n) {
			return n < 15 ? 0 : 1;
		}),
		level: [1, 8],
	  }, {
		name: "Conjuration Savant (17)",
		"class": "wizard",
		school: "Conj",
		times : levels.map( function(n) {
			return n < 17 ? 0 : 1;
		}),
		level: [1, 9],
	  }],
      description: desc([
        "I gain two Wizard spells from the Conjuration school, level 2 or lower, for free. I gain a spell in this way each time I gain access to a new level of spell slots in this class.",
      ]),
    },
    "subclassfeature3.1" : {
	  name : "Benign Transposition",
	  source : [["XUA25AU", 5]],
	  minlevel : 3,
	  description : desc([
        "As an Bonus Action, I can teleport to an unoccupied place within 30 ft that I can see.",
		"Instead, I can swap places with a willing Medium or smaller creature in 30 ft that I can see.",
		"I can do this Int mod (min of 1) per Long Rest.",
	  ]),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : ["", "", "long rest", "long rest", "long rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest", "short rest"],
	  action : [["bonus action", ""]]
	},
    "subclassfeature6": {
      name: "Distant Transposition",
      source: [["XUA25AU", 5]],
      minlevel: 6,
      description: desc([
        "The range of my Benign Transposition feature increases to 60 ft. Additionally, I regain my expended use after a Short or Long Rest."
      ]),
    },
	"subclassfeature6.1" : {
	  name : "Durable Summons",
	  source : [["XUA25AU", 6]],
	  minlevel : 6,
	  description : desc([
        "Any creature I summon or create with a Conjuration spell \u0026 a spell slot has Temp HP equal to twice my Wizard lvl. While it has these Temp HP, the creature has Resistance to every dmg type except Force, Necrotic, Psychic, \u0026 Radiant.",
	  ]),
	  calcChanges : {
		spellAdd : [
		  function (spellKey, spellObj, spName) {
			if (spellKey.indexOf("conjure") !== -1 && !(/barrage|volley|knowbot/i).test(spellKey)) {
			  spellObj.description = spellObj.description.replace(/verbal commands/i, "command").replace(/^summon /i, '') + "; +2xWiz lvl temp hp";
			  return true;
			} else if ((/find (greater )?(steed|familiar)/i).test(spellKey)) {
			  spellObj.description = spellObj.description.replace(/Gain the services of a ([^;]+)/i, "A $1 (+2xWiz lvl temp hp)");
			  return true;
			}
		  },
		  "Any creature I summon or create with a Conjuration spell \u0026 a spell slot gains Temp HP equal to twice my Wizard lvl."
		]
	  }
	},
	"subclassfeature10" : {
	  name : "Focused Conjuration",
	  source : [["XUA25AU", 6]],
	  minlevel : 10,
	  description : desc([
        "While I am concentrating on a Conjuration spell, it can't be broken by taking damage.",
	  ]),
	  savetxt : {
		immune : ["losing Concentration by taking dmg"],
	  },
	},
    "subclassfeature14": {
      name : "Splintered Summons",
	  source : [["XUA25AU", 6]],
	  minlevel : 14,
	  description : desc([
		"When I cast Summon Aberration, Summon Construct, Summon Dragon, Summon Elemental, or Summon Fey using a spell slot, I can modify the spell to summon two creatures with the spell instead of one. Each creature is of the same kind, uses the stat block and rules denoted by the spell, and manifests in a different unoccupied space of my choice within the spell's range, but the summoned creatures' HP are halved. If I lose Concentration on the spell, both creatures disappear.",
	  ]),
	  usages : 1,
	  recovery : "long rest",
	  altResource : "SS 5+",
    },
  },
});
legacySubClassRefactor("wizard", "enchantment", {
  regExpSearch: /(enchantment|enchanter)/i,
  subname : "School of Enchantment",
  fullname : "Enchanter",
  source: [["XUA25AU", 6]],
  replaces: "school of enchantment",
  features: {
    "subclassfeature3": {
      name: "Enchantment Savant",
      source: [["XUA25AU", 6]],
      minlevel: 3,
	  spellcastingBonus: [{
		name: "Enchantment Savant (3)",
		"class": "wizard",
		school: "Ench",
		times : levels.map( function(n) {
			return n < 3 ? 0 : 2;
		}),
		level: [1, 2],
	  }, {
		name: "Enchantment Savant (5)",
		"class": "wizard",
		school: "Ench",
		times : levels.map( function(n) {
			return n < 5 ? 0 : 1;
		}),
		level: [1, 3],
	  }, {
		name: "Enchantment Savant (7)",
		"class": "wizard",
		school: "Ench",
		times : levels.map( function(n) {
			return n < 7 ? 0 : 1;
		}),
		level: [1, 4],
	  }, {
		name: "Enchantment Savant (9)",
		"class": "wizard",
		school: "Ench",
		times : levels.map( function(n) {
			return n < 9 ? 0 : 1;
		}),
		level: [1, 5],
	  }, {
		name: "Enchantment Savant (11)",
		"class": "wizard",
		school: "Ench",
		times : levels.map( function(n) {
			return n < 11 ? 0 : 1;
		}),
		level: [1, 6],
	  }, {
		name: "Enchantment Savant (13)",
		"class": "wizard",
		school: "Ench",
		times : levels.map( function(n) {
			return n < 13 ? 0 : 1;
		}),
		level: [1, 7],
	  }, {
		name: "Enchantment Savant (15)",
		"class": "wizard",
		school: "Ench",
		times : levels.map( function(n) {
			return n < 15 ? 0 : 1;
		}),
		level: [1, 8],
	  }, {
		name: "Enchantment Savant (17)",
		"class": "wizard",
		school: "Ench",
		times : levels.map( function(n) {
			return n < 17 ? 0 : 1;
		}),
		level: [1, 9],
	  }],
      description: desc([
        "I gain two Wizard spells from the Enchantment school, level 2 or lower, for free. I gain a spell in this way each time I gain access to a new level of spell slots in this class.",
      ]),
    },
    "subclassfeature3.1": {
      name : "Enchanting Conversationalist",
	  source : [["XUA25AU", 6]],
	  minlevel : 3,
	  description : desc([
		"I gain Prof in my choice of one of the following skills: Deception, Intimidation, or Persuasion.",
		"I can add my Int Mod (min 1) to checks made with the chosen skill.",
	  ]),
	  extraname: "Enchanting Conversationalist: Skill",
	  extrachoices: ["Deception", "Intimidation", "Persuasion"],
	  extraTimes: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	  "deception": {
		name: "Deception",
		description: desc([
		  "I gain Prof in Deception & add my Int Mod (min 1) to checks made with this skill.",
		]),
		skills : ["Deception"],
		addMod: [
		  {type: "skill", field: "Deception", mod: "Int", text: "I can add my Intelligence modifier to Deception rolls."},
		],
	  },
	  "intimidation": {
		name: "Intimidation",
		description: desc([
		  "I gain Prof in Intimidation & add my Int Mod (min 1) to checks made with this skill.",
		]),
		skills : ["Intimidation"],
		addMod: [
		  {type: "skill", field: "Intimidation", mod: "Int", text: "I can add my Intelligence modifier to Intimidation rolls."},
		],
	  },
	  "persuasion": {
		name: "Persuasion",
		description: desc([
		  "I gain Prof in Persuasion & add my Int Mod (min 1) to checks made with this skill.",
		]),
		skills : ["Persuasion"],
		addMod: [
		  {type: "skill", field: "Persuasion", mod: "Int", text: "I can add my Intelligence modifier to Persuasion rolls."},
		],
	  },
    },
	 "subclassfeature3.2": {
      name : "Hypnotic Presence",
	  source : [["XUA25AS", 6]],
	  minlevel : 3,
	  description : desc([
		"As a Magic Action, compell a creature within 10 ft of me to make a Wis save against my spell save DC or have the Charmed condition for 1 minute or until my Concentration ends, the target is more than 10 ft away, the target can neither se nor hear me, or the target takes damage.",
		"While Charmed in this way, the target has the Incapacitated condition and a Speed of 0. I can use this feature once per Long Rest, \u0026 I can regain a use by expending a lvl 1+ spell slot (no action required)."
	  ]),
	  action : [["action", " "]],
	  usages : 1,
	  recovery : "long rest",
	  altResource : "SS 1+",
    },
	"subclassfeature6": {
      name: "Split Enchantment",
      source: [["XUA25AU", 7]],
      minlevel: 6,
      description: desc([
        "When I cast an Enchantment spell, such as Charm Person, that can be cast with a higher-level spell slot to target an additional creature, increase the spell's effective level by 1.",
      ]),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
    },
    "subclassfeature10": {
      name: "Instinctive Charm",
      source: [["XUA25AU", 7]],
      minlevel: 6,
      description: desc([
        "When a creature \u2264 30 ft of me that I can see hits me with an attack roll, I can take a Reaction to force the attacker to make a Wis save against my spell save DC.",
		"On a failed save, the attack misses instead, and if there is another creature wotjom ramge of the attack other than the attacker, the attacker targets that creature with the triggering attack, using the same attack roll.",
		"If multiple creatures are within the attack's range, I choose which one to target",
		"I can do this again after a Long Rest or casting an Enchantment spell with a spell slot."
      ]),
	  action : [["reaction", " "]],
	  usages : 1,
	  recovery : "long rest",
    },
    "subclassfeature14": {
      name : "Alter Memories",
	  source : [["XUA25AU", 7]],
	  minlevel : 14,
	  description : desc([
		"I can reliably enchant creatures \u0026 alter their memories. I always have the Modify Memory spell prepared.",
		"When I cast the spell, you can target a 2nd creature with it if that creature is within range of the spell.",
	  ]),
	  spellcastingBonus : [{
		name : "Alter Memories",
		spells : ["modify memory"],
		selection : ["modify memory"],
		firstCol : "markedbox",
	  }],
    },
  },
});
legacySubClassRefactor("wizard", "necromancy", {
  regExpSearch: /necromancy|necromancer|necromantic/i,
  subname : "School of Necromancy",
  fullname : "Necromancer",
  source: [["XUA25AS", 9]],
  replaces: "school of necromancy",
  features: {
    "subclassfeature3": {
      name: "Necromancy Savant",
      source: [["XUA25AU", 7]],
      minlevel: 3,
	  spellcastingBonus: [{
		name: "Necromancy Savant (3)",
		"class": "wizard",
		school: "Necro",
		times : levels.map( function(n) {
			return n < 3 ? 0 : 2;
		}),
		level: [1, 2],
	  }, {
		name: "Necromancy Savant (5)",
		"class": "wizard",
		school: "Necro",
		times : levels.map( function(n) {
			return n < 5 ? 0 : 1;
		}),
		level: [1, 3],
	  }, {
		name: "Necromancy Savant (7)",
		"class": "wizard",
		school: "Necro",
		times : levels.map( function(n) {
			return n < 7 ? 0 : 1;
		}),
		level: [1, 4],
	  }, {
		name: "Necromancy Savant (9)",
		"class": "wizard",
		school: "Necro",
		times : levels.map( function(n) {
			return n < 9 ? 0 : 1;
		}),
		level: [1, 5],
	  }, {
		name: "Necromancy Savant (11)",
		"class": "wizard",
		school: "Necro",
		times : levels.map( function(n) {
			return n < 11 ? 0 : 1;
		}),
		level: [1, 6],
	  }, {
		name: "Necromancy Savant (13)",
		"class": "wizard",
		school: "Necro",
		times : levels.map( function(n) {
			return n < 13 ? 0 : 1;
		}),
		level: [1, 7],
	  }, {
		name: "Necromancy Savant (15)",
		"class": "wizard",
		school: "Necro",
		times : levels.map( function(n) {
			return n < 15 ? 0 : 1;
		}),
		level: [1, 8],
	  }, {
		name: "Necromancy Savant (17)",
		"class": "wizard",
		school: "Necro",
		times : levels.map( function(n) {
			return n < 17 ? 0 : 1;
		}),
		level: [1, 9],
	  }],
      description: desc([
        "I gain two Wizard spells from the Necromancy school, level 2 or lower, for free. I gain a spell in this way each time I gain access to a new level of spell slots in this class.",
      ]),
    },
    "subclassfeature3.1": {
      name : "Necromancy Spellbook",
	  source : [["XUA25AU", 8]],
	  minlevel : 3,
	  description : desc([
		" \u2022 Necrotic Resistance. I have Resistance to Necrotic dmg.",
		" \u2022 Grim Harvest. When I cast a Necromancy spell using a spell slot, choose an Undead creature I can see \u2264 60 ft of me to regain a number of HP equal to the level of the spell slot + my Wiz Lvl.",
		" \u2022 Undead Familiar. The Find Familiar spell appears in my spellbook. When I cast the spell, I choose one of the normal forms for my familiar or one of the following special forms: Skeleton or Zombie.",
	  ]),
	  dmgres : ["Necrotic"],
	  spellcastingBonus : [{
		name : "Undead Familiar",
		spells : ["find familiar"],
		selection : ["find familiar"],
		firstCol : "markedbox",
	  }],
    },
    "subclassfeature6": {
      name: "Grave Power",
      source: [["XUA25AU", 8]],
      minlevel: 6,
      description: desc([
        "While holding my spellbook, I gain the following benefits:",
		" \u2022 Grave Resilience. When I use Arcane Recovery, my Exhaustion lvl, if any, decreases by 1.",
		" \u2022 Overwhelming Necrosis. Damage from my Wizard spells \u0026 Wizard features ignores Resistance to Necrotic dmg.",
      ]),
    },
	"subclassfeature6.1": {
      name: "Undead Thralls",
      source: [["XUA25AS", 10]],
      minlevel: 6,
      description: desc([
        "I always have Animate Dead prepared \u0026 can cast it once per Long Rest without expending a spell slot. When I start casting the spell, I can modify it so that the spell's effective level is increased by 1.",
		"When I cast a Necromancy spell with a spell slot that creates or summons Undead, the Undead gain the following benefits:",
		" \u2022 Undead Fortitude. The Undead's HP, current \u0026 max, increase by a number equal to the lvl of spell slot used plus my Int mod for the spell's duration.",
		" \u2022 Withering Strike. Whenever the Undead hits a creature with an attack roll, the Undead deals extra Necrotic dmg equal to my Int mod (min of 1 Necrotic dmg).",
      ]),
	  spellcastingBonus : [{
		name : "Undead Thralls",
		spells : ["animate dead"],
		selection : ["animate dead"],
		firstCol : "oncelr",
	  }],
	  limfeaname : "Undead Thralls: Animate Dead",
	  usages : 1,
	  recovery : "long rest",
    },
	"subclassfeature10": {
      name: "Harvest Undead",
      source: [["XUA25AU", 8]],
      minlevel: 10,
      description: desc([
        "Immediately after I become Bloodied but aren't killed outright from taking dmg, I can use my Reaction to reduce an Undead creature under my control within sight to 0 HP, immediately regaining my Wiz lvl in HP.",
      ]),
	  action : [["reaction", " "]],
    },
    "subclassfeature14": {
      name : "Death's Master",
	  source : [["XUA25AU", 8]],
	  minlevel : 14,
	  description : desc([
		"While holding my spellbook, I gain the following additional benefits:",
		" \u2022 Bolster Undead. As a Bonus Action, choose any number of Undead I have created/summoned with a Necromancy spell that are \u2264 60 ft of myself. Those Undead each gain Temp HP equal to my Wizard lvl. Once an Undead gains Temp HP from this feature, it can't gain them in this way again for the next 24hrs.",
		" \u2022 Extinguish Undead. When an Undead creature within sight is reduced to 0 HP, I can cause it to explode with necrotic energy. Roll a number of d6s equal to half the creature's unexpended HD (round up, min of 1d6) \u0026 add them together. Each creature in a 10 ft Emanation originating from the from the Undead makes a Dex save or takes Necrotic dmg equal to the number rolled \u0026 can't take Reactions until the start of its next turn. On a successful save, a target only takes half dmg. When I use this feature to explode an Undead I don't control, I must also expend a lvl 5+ spell slot to do so.",
	  ]),
	  action : [["bonus action", "Death's Master: Bolster Undead"], ["reaction", "Death's Master: Extinguish Undead"]],
    },
  },
});
legacySubClassRefactor("wizard", "transmutation", {
  regExpSearch: /(transmutation|transmuter)/i,
  subname : "School of Transmutation",
  fullname : "Transmuter",
  source: [["XUA25AU", 9]],
  replaces: "school of transmutation",
  features: {
    "subclassfeature3": {
      name: "Transmutation Savant",
      source: [["XUA25AU", 9]],
      minlevel: 3,
	  spellcastingBonus: [{
		name: "Transmutation Savant (3)",
		"class": "wizard",
		school: "Trans",
		times : levels.map( function(n) {
			return n < 3 ? 0 : 2;
		}),
		level: [1, 2],
	  }, {
		name: "Transmutation Savant (5)",
		"class": "wizard",
		school: "Trans",
		times : levels.map( function(n) {
			return n < 5 ? 0 : 1;
		}),
		level: [1, 3],
	  }, {
		name: "Transmutation Savant (7)",
		"class": "wizard",
		school: "Trans",
		times : levels.map( function(n) {
			return n < 7 ? 0 : 1;
		}),
		level: [1, 4],
	  }, {
		name: "Transmutation Savant (9)",
		"class": "wizard",
		school: "Trans",
		times : levels.map( function(n) {
			return n < 9 ? 0 : 1;
		}),
		level: [1, 5],
	  }, {
		name: "Transmutation Savant (11)",
		"class": "wizard",
		school: "Trans",
		times : levels.map( function(n) {
			return n < 11 ? 0 : 1;
		}),
		level: [1, 6],
	  }, {
		name: "Transmutation Savant (13)",
		"class": "wizard",
		school: "Trans",
		times : levels.map( function(n) {
			return n < 13 ? 0 : 1;
		}),
		level: [1, 7],
	  }, {
		name: "Transmutation Savant (15)",
		"class": "wizard",
		school: "Trans",
		times : levels.map( function(n) {
			return n < 15 ? 0 : 1;
		}),
		level: [1, 8],
	  }, {
		name: "Transmutation Savant (17)",
		"class": "wizard",
		school: "Trans",
		times : levels.map( function(n) {
			return n < 17 ? 0 : 1;
		}),
		level: [1, 9],
	  }],
      description: desc([
        "I gain two Wizard spells from the Transmutation school, level 2 or lower, for free. I gain a spell in this way each time I gain access to a new level of spell slots in this class.",
      ]),
    },
    "subclassfeature3.1": {
      name : "Transmuter's Stone",
	  source : [["XUA25AU", 9]],
	  minlevel : 3,
	  description : desc([
		"When I finish a Long Rest, I can create a magic stone called a Transmuter's Stone that lasts until I use this feature again.",
		"A creature with the stone in its possession gains Prof in Con saves \u0026 a benefit from one of the following options, which I choose when I create the stone.",
		"I can change the stone's benefit when I cast a Transmutation spell using a spell slot.",
		" \u2022 Darkvision. The bearer gains Darkvision with a range of 60 ft or increases the range of its Darkvision by 60 ft.",
		" \u2022 Speed. The bearer's Speed increases by 10 ft.",
		" \u2022 Resistance. The bearer gains Resistance to Acid, Cold, Fire, Lightning, Poison, or Thunder dmg (my choice each time I choose this benefit).",
		"NOTE: Because this item can be given to others, the automation will not add the item to this character. The player has to add it themself if it is to go on this character.",
	  ]),
    },
	"subclassfeature3.2": {
      name : "Wondrous Alteration",
	  source : [["XUA25AU", 9]],
	  minlevel : 3,
	  description : desc([
		"I always have the spell Alter Self prepared \u0026 can cast it once per Long Rest without a spell slot.",
		"While under the effects of Alter Self, I gain an additional benefit for each of its options:",
		" \u2022 Aquatic Adaptation. While underwater, I can take the Dash action as a Bonus Action.",
		" \u2022 Change Appearance. I have Adv on Cha (Deception) checks.",
		" \u2022 Natural Weapons. The damage of my new growth increases to 2d6 damage of the type associated with the growth. I also have Adv on Con saves to maintain Concentration.",
	  ]),
	  spellcastingBonus : [{
		name : "Wondrous Alteration",
		spells : ["alter self"],
		selection : ["alter self"],
		firstCol : "oncelr",
	  }],
	  savetxt : {
		text : ["Adv on Cha (Deception) checks (AlterSelf: Chng Appear)"],
		adv_vs : ["Con to maintain Conc (AlterSelf: Nat Wea)"],
	  },
	  limfeaname : "Wondrous Alteration: Alter Self",
	  usages : 1,
	  recovery : "long rest",
    },
    "subclassfeature6": {
      name: "Empowered Transmutation",
      source: [["XUA25AU", 9]],
      minlevel: 6,
      description: desc([
        "When I cast a Transmutation spell that doesn't deal dmg, such as Fly, with a spell slot, I can increase the spell's effective level by 1.",
		"I can use this feature a number of times equal to my Int mod (min 1), \u0026 I regain all expended uses when I finish a Long Rest."
      ]),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
    },
	"subclassfeature10": {
      name : "Potent Stone",
	  source : [["XUA25AU", 9]],
	  minlevel : 10,
	  description : desc([
		"My Transmuter's Stone is more versatile. I choose up to two options when I create my transmuter's stone.",
		"I can choose each option other than Resistance only once. If I choose Resistance twice, I must choose different damage types.",
		"I can change either or both benefits when I cast a Transmutation spell using a spell slot.",
		"I also gain the following options for my Transmuter's Stone:",
		" \u2022 Mighty Build. The bearer has Adv on Str saves. The bearer also counts as one size larger when determining its carrying capacity.",
		" \u2022 Tremorsense. The bearer gains Tremorsense with a range of 30 ft.",
		"NOTE: Choosing multiple benefits is done by adding another Transmuter's Stone item to the sheet of the character with the Stone. Additionally, the upgraded stone with additional options is called Potent Transmuter's Stone.",
	  ]),
    },
	"subclassfeature10.1": {
      name : "Shapechanger",
	  source : [["XUA25AU", 10]],
	  minlevel : 10,
	  description : desc([
		"I always have the spell Polymorph prepared \u0026 can cast it once per Long Rest without a spell slot.",
		"Once per Long Rest when I target myself with the spell, I can modify the spell to gain the benefits below.",
		" \u2022 Game Statistics. I retain my personality, memories, \u0026 ability to speak. I also retain my Int, Wis, \u0026 Cha scores; class features; languages; \u0026 feats.",
		" \u2022 Transmute Spells. I can cast Transmutation spells while shape-shifted, except for any spell with a Material component that has a cost specified or is consumed by the spell.",
	  ]),
	  spellcastingBonus : [{
		name : "Shapechanger",
		spells : ["polymorph"],
		selection : ["polymorph"],
		firstCol : "oncelr",
	  }],
	  limfeaname : "Shapechanger: Polymorph",
	  recovery : "long rest",
	  usages : 1,
	  extraLimitedFeatures : [{
		name : "Shapechanger: Polymorph Self",
		usages : 1,
		recovery : "long rest",
	  }],
    },
    "subclassfeature14": {
      name : "Master Transmuter",
	  source : [["XUA25AS", 11]],
	  minlevel : 14,
	  description : desc([
		"As a Magic action while carrying my Transmuter's Stone, I can consume the reserve of transmutation magic stored inside to choose one of the following benefits.",
		"After using my Transmuter's Stone in this way, it crumbles to dust. I can prevent this crumbling by expending a lvl 5+ spell slot as part of the Magic action to use this feature.",
		" \u2022 Major Transformation. I can transmute one nonmagical object—no larger than a 10 ft Cube or eight connected 5 ft Cubes—into another nonmagical object of similar size and mass \u0026 of equal or lesser value. I must spend 10 min handling the object(s) to transform it(them).",
		" \u2022 Panacea. One creature I touch regains a number of HP equal to half its max HP (round down) \u0026 ends any magical contagions and curses, including the target's Attunement to a cursed item. The Poisoned or Petrified conditions are also removed from the target.",
		" \u2022 Restore Life. I cast Raise Dead without a spell slot, using the stone in place of the normally required Material components.",
		" \u2022 Restore Youth. Obe willing creature I touch permanently appears 3d10 years younger, to a minimum of young adulthood. Any Exhaustion lvls, if any, also decrease to 0.",
	  ]),
	  limfeaname : "Master Transmuter",
	  usages : 1,
	  recovery : "long rest",
	  altResource : "SS 5+",
    },
  },
});
MagicItemsList["transmuter's stone"] = {
  name : "Transmuter's Stone",
  source : [["XUA25AU", 9]],
  type : "wondrous item",
  rarity : "common",
  description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 a benefit from one of the item's options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Select the benefit the Transmuter chose using the little square button in this magic item line.",
  descriptionFull : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 a benefit from one of the item's options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot.",
  allowDuplicates : true,
  choices : ['Darkvision', 'Speed', 'Resistance: Acid', 'Resistance: Cold', 'Resistance: Fire', 'Resistance: Lightning', 'Resistance: Poison', 'Resistance: Thunder'],
  "darkvision" : {
	name : "Transmuter's Stone (Darkvision)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 the following benefit, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Darkvision: The bearer gains Darkvision with a range of 60 feet or increases the range of its Darkvision by 60 feet.",
	rarity : "common",
	vision : [["Darkvision", "fixed 60"], ["Darkvision", "+60"]],
	saves : ["Con"],
	allowDuplicates : false,
  },
  "speed" : {
	name : "Transmuter's Stone (Speed)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 the following benefit, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Speed: The bearer's Speed increases by 10 feet.",
	rarity : "common",
	speed : {
	  allModes : { bonus : "+10" },
	},
	saves : ["Con"],
	allowDuplicates : false,
  },
  "resistance: acid" : {
	name : "Transmuter's Stone (Resistance: Acid)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 the following benefit, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Acid damage.",
	rarity : "common",
	dmgres : ["Acid"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: cold" : {
	name : "Transmuter's Stone (Resistance: Cold)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 the following benefit, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Cold damage.",
	rarity : "common",
	dmgres : ["Cold"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: fire" : {
	name : "Transmuter's Stone (Resistance: Fire)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 the following benefit, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Fire damage.",
	rarity : "common",
	dmgres : ["Fire"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: lightning" : {
	name : "Transmuter's Stone (Resistance: Lightning)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 the following benefit, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Lightning damage.",
	rarity : "common",
	dmgres : ["Lightning"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: poison" : {
	name : "Transmuter's Stone (Resistance: Poison)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 the following benefit, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Poison damage.",
	rarity : "common",
	dmgres : ["Poison"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: thunder" : {
	name : "Transmuter's Stone (Resistance: Thunder)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 the following benefit, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Thunder damage.",
	rarity : "common",
	dmgres : ["Thunder"],
	saves : ["Con"],
	allowDuplicates : true,
  },
};
MagicItemsList["potent transmuter's stone"] = {
  name : "Potent Transmuter's Stone",
  source : [["XUA25AU", 9]],
  type : "wondrous item",
  rarity : "common",
  description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Select one of the benefits the Transmuter chose using the little square button in this magic item line.",
  descriptionFull : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit when they cast a Transmutation spell using a spell slot.",
  allowDuplicates : true,
  choices : ['Darkvision', 'Speed', 'Mighty Build', 'Tremorsense', 'Resistance: Acid', 'Resistance: Cold', 'Resistance: Fire', 'Resistance: Lightning', 'Resistance: Poison', 'Resistance: Thunder'],
  "darkvision" : {
	name : "Potent Transmuter's Stone (Darkvision)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Darkvision: The bearer gains Darkvision with a range of 60 feet or increases the range of its Darkvision by 60 feet.",
	rarity : "common",
	vision : [["Darkvision", "fixed 60"], ["Darkvision", "+60"]],
	saves : ["Con"],
	allowDuplicates : false,
  },
  "speed" : {
	name : "Potent Transmuter's Stone (Speed)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Speed: The bearer's Speed increases by 10 feet.",
	rarity : "common",
	speed : {
	  allModes : { bonus : "+10" },
	},
	saves : ["Con"],
	allowDuplicates : false,
  },
  "mighty build" : {
	name : "Potent Transmuter's Stone (Mighty Build)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Mighty Build: The bearer has Adv on Str saves. The bearer also counts as one size larger when determining its carrying capacity.",
	rarity : "common",
	carryingCapacity: 2,
	savetxt : {
	  text : ["Adv on Str saves"],
	},
	saves : ["Con"],
	allowDuplicates : false,
  },
  "tremorsense" : {
	name : "Potent Transmuter's Stone (Tremorsense)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Tremorsense: The bearer gains Tremorsense with a range of 30 feet.",
	rarity : "common",
	vision : [["Tremorsense", "fixed 30"]],
	saves : ["Con"],
	allowDuplicates : false,
  },
  "resistance: acid" : {
	name : "Potent Transmuter's Stone (Resistance: Acid)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Acid damage.",
	rarity : "common",
	dmgres : ["Acid"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: cold" : {
	name : "Potent Transmuter's Stone (Resistance: Cold)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Cold damage.",
	rarity : "common",
	dmgres : ["Cold"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: fire" : {
	name : "Potent Transmuter's Stone (Resistance: Fire)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Fire damage.",
	rarity : "common",
	dmgres : ["Fire"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: lightning" : {
	name : "Potent Transmuter's Stone (Resistance: Lightning)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Lightning damage.",
	rarity : "common",
	dmgres : ["Lightning"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: poison" : {
	name : "Potent Transmuter's Stone (Resistance: Poison)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Poison damage.",
	rarity : "common",
	dmgres : ["Poison"],
	saves : ["Con"],
	allowDuplicates : true,
  },
  "resistance: thunder" : {
	name : "Potent Transmuter's Stone (Resistance: Thunder)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic stone called a Potent Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains Prof in Con saves \u0026 two benefits from the item's options, which the Transmuter chooses when they create the stone. They can change one or both of the stone's benefit(s) when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Thunder damage.",
	rarity : "common",
	dmgres : ["Thunder"],
	saves : ["Con"],
	allowDuplicates : true,
  },
};
