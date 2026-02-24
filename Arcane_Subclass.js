/*	-INFORMATION-
	Subject:	Subclasses (a.k.a. Archetype) & Magic Item
	Effect:		This script adds the subclasses from XUA25AS. These Subclasses are a transciption of the subclasses found in XUA25AS, transcribed by MasterJedi2014. The Transmuter's Stone feature of the Transmutation Wizard has been made into a Magic Item.
	Code by:	MasterJedi2014, using MorePurpleMoreBetter's code as reference
	Date:		2025-07-20 (sheet v13.2.3)
	Notes:		This file will start by shunting the old subclasses into "Legacy" subclasses using code primarily developed by Shroo.
				It will thereafter define the new UA subclasses, followed by the "Transmuter's Stone" Magic Item.
*/

var iFileName = "XUA25AS Content [by MasterJedi2014] V9.js";
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
  source: [["XUA25AS", 2]],
  replaces: "arcane archer",
  features: {
    "subclassfeature3": {
      name : "Arcane Archer Lore",
	  source : [["XUA25AS", 2]],
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
	  source : [["XUA25AS", 2]],
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
		  "My ammunition creates clutching brambles around my target. The creature I hit takes additional Slashing damage equal to one roll of my Arcane Shot Die and must succeed on a Strength saving throw or have the Restrained condition until the start of my next turn. The target or a creature within reach of it can take an Action to make a Strength (Athletics) check against my Arcane Shot DC, removing the brambles and ending the Restrained condition on the target on a successful check.",
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
      source: [["XUA25AS", 3]],
      minlevel: 7,
      description: desc([
        "If I make an attack roll with a weapon with the Ammunition property and miss, as a Bonus Action immediately after the attack, I can make an extra attack with the same",
		"   weapon against a different target that I can see, that is within the weapon's long range, and that isn't behind Total Cover. This extra attack doesn't require ammunition."
      ]),
	  action : [["bonus action", " "]],
    },
	"subclassfeature7.1": {
      name: "Ever Ready Shot",
      source: [["XUA25AS", 3]],
      minlevel: 7,
      description: desc([
        "When I roll Initiative and have no uses of Arcane Shot left, I regain one expended use of it."
      ]),
    },
  },
});
AddSubClass("monk", "tattooed warrior", {
  regExpSearch: /^(?=.*(monk))(?=.*(tattooed))(?=.*(warrior)).*$/i,
  subname: "Tattooed Warrior",
  source: [["XUA25AS", 4]],
  features: {
    "subclassfeature3": {
      name : "Magic Tattoos",
	  source : [["XUA25AS", 4]],
	  minlevel : 3,
	  description : desc([
		"I gain magical tattoos on my body at various levels. The tattoos appear on my body wherever I wish. Damage or injury doesn't impair my magic tattoos' function. A magic tattoo's depiction can look like a brand, scarification, a birthmark, patterns of scale, or any other cosmetic alteration.",
		"If a tattoo's effect requires a saving throw, the DC equals 8 + my Wis mod + your Prof Bonus. My spellcasting ability for spells granted by a tattoo is Wisdom.",
		"Whenever I finish a Long Rest, I can reshape one of my magic tattoos, changing the option I chose from one list to another option on the same list.",
	  ]),
	  extraname: "Beast Tattoos",
	  extrachoices: ["Bat Tattoo", "Butterfly Tattoo", "Chameleon Tattoo", "Crane Tattoo", "Horse Tattoo", "Spider Tattoo", "Tortoise Tattoo"],
	  extraTimes: [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	  "bat tattoo": {
		name: "Bat Tattoo",
		description: desc([
		  "I know the Dancing Lights cantrip. When I expend 1 Focus Point to use Patient Defense or Step of the Wind, I gain Blindsight with a range of 10 feet for 1 minute.",
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
		  "I know the Light cantrip. I can expend 1 Focus Point to cast Silent Image without Material components.",
		]),
		spellcastingBonus : [{
		  name : "Butterfly Tattoo: Light",
		  spellcastingAbility : 5,
		  spells : ["light"],
		  selection : ["light"],
		}, {
		  name : "Butterfly Tattoo: Silent Image",
		  spellcastingAbility : 5,
		  spells : ["silent image"],
		  selection : ["silent image"],
		  firstCol : 1,
		}],
		spellFirstColTitle : "FP",
		prereqeval : function(v) { return classes.known.monk.level >= 3; },
		spellChanges : {
		  "silent image" : {
			components : "V,S",
			compMaterial : "",
			changes : "With the Butterfly Tattoo, I can cast Silent Image without a material component."
		   }
		}
	  },
	  "chameleon tattoo": {
		name: "Chameleon Tattoo",
		description: desc([
		  "I know the Minor Illusion cantrip. I can expend 1 Focus Point to cast Disguise Self.",
		]),
		spellcastingBonus : [{
		  name : "Chameleon Tattoo: Minor Illusion",
		  spellcastingAbility : 5,
		  spells : ["minor illusion"],
		  selection : ["minor illusion"],
		}, {
		  name : "Chameleon Tattoo: Disguise Self",
		  spellcastingAbility : 5,
		  spells : ["disguise self"],
		  selection : ["disguise self"],
		  firstCol : 1,
		}],
		spellFirstColTitle : "FP",
	  },
	  "crane tattoo": {
		name: "Crane Tattoo",
		description: desc([
		  "I know the Guidance cantrip. When I miss a creature with an attack granted by my Flurry of Blows, I have Advantage on attack rolls for any remaining Unarmed Strikes with that use of Flurry of Blows.",
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
		  "I know the Message cantrip. I can expend 1 Focus Point to cast Longstrider without Material components.",
		]),
		spellcastingBonus : [{
		  name : "Horse Tattoo: Message",
		  spellcastingAbility : 5,
		  spells : ["message"],
		  selection : ["message"],
		}, {
		  name : "Horse Tattoo: Longstrider",
		  spellcastingAbility : 5,
		  spells : ["longstrider"],
		  selection : ["longstrider"],
		  firstCol : 1,
		}],
		spellFirstColTitle : "FP",
		prereqeval : function(v) { return classes.known.monk.level >= 3; },
		spellChanges : {
		  "longstrider" : {
			components : "V,S",
			compMaterial : "",
			allowUpCasting : false,
			changes : "With the Horse Tattoo, I can cast Longstrider without a material component."
		   }
		}
	  },
	  "spider tattoo": {
		name: "Spider Tattoo",
		description: desc([
		  "I know the Mending cantrip. When I hit a creature with an attack granted by my Flurry of Blows, the creature has Disadvantage on its next attack roll before the start of my next turn.",
		]),
		spellcastingBonus : [{
		  name : "Spider Tattoo",
		  spellcastingAbility : 5,
		  spells : ["mending"],
		  selection : ["mending"],
		}],
	  },
	  "tortoise tattoo": {
		name: "Tortoise Tattoo",
		description: desc([
		  "I know the Spare the Dying cantrip. I can expend 1 Focus Point to cast False Life without Material components.",
		]),
		spellcastingBonus : [{
		  name : "Tortoise Tattoo: Spare the Dying",
		  spellcastingAbility : 5,
		  spells : ["spare the dying"],
		  selection : ["spare the dying"],
		}, {
		  name : "Tortoise Tattoo: False Life",
		  spellcastingAbility : 5,
		  spells : ["false life"],
		  selection : ["false life"],
		  firstCol : 1,
		}],
		spellFirstColTitle : "FP",
		prereqeval : function(v) { return classes.known.monk.level >= 3; },
		spellChanges : {
		  "false life" : {
			components : "V,S",
			compMaterial : "",
			allowUpCasting : false,
			changes : "With the Tortoise Tattoo, I can cast False Life without a material component."
		   }
		}
	  },
    },
    "subclassfeature6": {
      name: "Celestial Tattoo",
      source: [["XUA25AS", 4]],
      minlevel: 6,
      description: desc([
        'I gain an additional magic tattoo depicting a celestial phenomenon. Use the "Choose Feature" button above to choose your tattoo.',
      ]),
	  extraname: "Celestial Tattoo",
	  extrachoices: ["Comet Tattoo", "Crescent Moon Tattoo", "Eclipse Tattoo", "Sunburst Tattoo"],
	  extraTimes: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	  "comet tattoo": {
		name: "Comet Tattoo",
		description: desc([
		  "I can expend 2 Focus Points to cast Find Traps.",
		]),
		spellcastingBonus : [{
		  name : "Comet Tattoo",
		  spellcastingAbility : 5,
		  spells : ["find traps"],
		  selection : ["find traps"],
		  firstCol : 2,
		}],
		spellFirstColTitle : "FP",
	  },
	  "crescent moon tattoo": {
		name: "Crescent Moon Tattoo",
		description: desc([
		  "I can expend 2 Focus Points to cast Misty Step.",
		]),
		spellcastingBonus : [{
		  name : "Crescent Moon Tattoo",
		  spellcastingAbility : 5,
		  spells : ["misty step"],
		  selection : ["misty step"],
		  firstCol : 2,
		}],
		spellFirstColTitle : "FP",
	  },
	  "eclipse tattoo": {
		name: "Eclipse Tattoo",
		description: desc([
		  "I can expend 2 Focus Points to cast Invisibility without Material components.",
		]),
		spellcastingBonus : [{
		  name : "Eclipse Tattoo",
		  spellcastingAbility : 5,
		  spells : ["invisibility"],
		  selection : ["invisibility"],
		  firstCol : 2,
		}],
		spellFirstColTitle : "FP",
		prereqeval : function(v) { return classes.known.monk.level >= 6; },
		spellChanges : {
		  "invisibility" : {
			components : "V,S",
			compMaterial : "",
			allowUpCasting : false,
			changes : "With the Eclipse Tattoo, I can cast Invisibility without a material component."
		   }
		}
	  },
	  "sunburst tattoo": {
		name: "Sunburst Tattoo",
		description: desc([
		  "I can expend 2 Focus Points to cast Lesser Restoration.",
		]),
		spellcastingBonus : [{
		  name : "Sunburst Tattoo",
		  spellcastingAbility : 5,
		  spells : ["lesser restoration"],
		  selection : ["lesser restoration"],
		  firstCol : 2,
		}],
		spellFirstColTitle : "FP",
	  },
    },
	"subclassfeature11": {
      name: "Nature Tattoo",
      source: [["XUA25AS", 5]],
      minlevel: 11,
      description: desc([
        'I gain an additional magic tattoo depicting a natural feature. Use the "Choose Feature" button above to choose your tattoo.',
      ]),
	  extraname: "Nature Tattoo",
	  extrachoices: ["Mountain Tattoo", "Storm Tattoo", "Volcano Tattoo", "Wave Tattoo"],
	  extraTimes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	  "mountain tattoo": {
		name: "Mountain Tattoo",
		description: desc([
		  "As a Magic action, I can expend 3 Focus Points to gain Resistance to Acid damage \u0026 Adv. on Con saves for 1 minute.",
		]),
	  },
	  "storm tattoo": {
		name: "Storm Tattoo",
		description: desc([
		  "As a Magic action, I can expend 3 Focus Points to gain Resistance to Lightning damage \u0026 Adv. on Dex saves for 1 minute.",
		]),
	  },
	  "volcano tattoo": {
		name: "Volcano Tattoo",
		description: desc([
		  "As a Magic action, I can expend 3 Focus Points to gain Resistance to Fire damage \u0026 Adv. on Str saves for 1 minute.",
		]),
	  },
	  "wave tattoo": {
		name: "Wave Tattoo",
		description: desc([
		  "As a Magic action, I can expend 3 Focus Points to gain Resistance to Cold damage \u0026 Adv. on Wis saves for 1 minute.",
		]),
	  },
    },
    "subclassfeature17": {
      name : "Monster Tattoo",
	  source : [["XUA25AS", 5]],
	  minlevel : 17,
	  description : desc([
		'I gain a magic tattoo depicting a supernatural creature. Use the "Choose Feature" button above to choose your tattoo.',
	  ]),
	  extraname: "Monster Tattoo",
	  extrachoices: ["Beholder Tattoo", "Blink Dog Tattoo", "Displacer Beast Tattoo", "Guardian Naga Tattoo"],
	  extraTimes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
	  "beholder tattoo": {
		name: "Beholder Tattoo",
		description: desc([
		  "I have a Fly Speed of 10 feet \u0026 can hover. Additionally, I can expend 3 Focus Points to cast Counterspell.",
		]),
		speed : {
		  fly : { spd : 10, enc : 0 },
		},
		spellcastingBonus : [{
		  name : "Beholder Tattoo",
		  spellcastingAbility : 5,
		  spells : ["counterspell"],
		  selection : ["counterspell"],
		  firstCol : 3,
		}],
		spellFirstColTitle : "FP",
	  },
	  "blink dog tattoo": {
		name: "Blink Dog Tattoo",
		description: desc([
		  "When I expend a Focus Point to use Patient Defense, I can expend 3 Focus Points to cast Blink immediately after that Bonus Action.",
		]),
		spellcastingBonus : [{
		  name : "Blink Dog Tattoo",
		  spellcastingAbility : 5,
		  spells : ["blink"],
		  selection : ["blink"],
		  firstCol : 3,
		}],
		spellFirstColTitle : "FP",
	  },
	  "displacer beast tattoo": {
		name: "Displacer Beast Tattoo",
		description: desc([
		  "When I expend a Focus Point to use Flurry of Blows or Step of the Wind, I can expend 2 Focus Points to cast Mirror Image immediately after that Bonus Action.",
		]),
		spellcastingBonus : [{
		  name : "Displacer Beast Tattoo",
		  spellcastingAbility : 5,
		  spells : ["mirror image"],
		  selection : ["mirror image"],
		  firstCol : 2,
		}],
		spellFirstColTitle : "FP",
	  },
	  "guardian naga tattoo": {
		name: "Guardian Naga Tattoo",
		description: desc([
		  "Once per Long Rest when I would be reduced to 0 HP but not killed outright, my HP instead changes to a number equal to 2x my Monk lvl.",
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
  source: [["XUA25AS", 7]],
  replaces: "school of conjuration",
  features: {
    "subclassfeature3": {
      name: "Conjuration Savant",
      source: [["XUA25AS", 8]],
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
	  source : [["XUA25AS", 8]],
	  minlevel : 3,
	  description : desc([
        "As an Magic Action, I can teleport to a place within 30 ft that I can see.",
		"Instead, I can swap places with a willing Medium or smaller creature in 30 ft that I can see.",
		"I can do this again after a Long Rest or expending a level 2+ spell slot.",
	  ]),
	  usages : 1,
	  recovery : "long rest",
	  action : [["action", ""]]
	},
    "subclassfeature6": {
      name: "Distant Transposition",
      source: [["XUA25AS", 8]],
      minlevel: 6,
      description: desc([
        "The range of my Benign Transposition feature increases to 60 ft. Additionally, I regain my expended use after a Short or Long Rest."
      ]),
	  limfeaname : "Benign Transposition",
	  usages : 1,
	  recovery : "short rest",
    },
	"subclassfeature6.1" : {
	  name : "Durable Summons",
	  source : [["XUA25AS", 8]],
	  minlevel : 6,
	  description : desc([
        "Any creature I summon or create with a Conjuration spell has Temporary HP equal to twice my Wizard lvl.",
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
		  "Any creature I summon or create with a Conjuration spell gains Temporary HP equal to twice my Wizard lvl."
		]
	  }
	},
	"subclassfeature10" : {
	  name : "Focused Conjuration",
	  source : [["XUA25AS", 8]],
	  minlevel : 10,
	  description : desc([
        "While I am concentrating on a Conjuration spell, it can't be broken by taking damage.",
	  ]),
	  savetxt : {
		immune : ["losing Concentration by taking dmg"],
	  },
	},
    "subclassfeature14": {
      name : "Quick Transposition",
	  source : [["XUA25AS", 8]],
	  minlevel : 14,
	  description : desc([
		"I can use Benign Transposition as a Bonus Action.",
		"I can also use Benign Transposition as a Reaction when a creature I can see attacks me, but only to swap places with a willing creature.",
		"The creature that I swap with becomes the target of the triggering attack instead.",
	  ]),
    },
  },
});
legacySubClassRefactor("wizard", "enchantment", {
  regExpSearch: /(enchantment|enchanter)/i,
  subname : "School of Enchantment",
  fullname : "Enchanter",
  source: [["XUA25AS", 8]],
  replaces: "school of enchantment",
  features: {
    "subclassfeature3": {
      name: "Enchantment Savant",
      source: [["XUA25AS", 8]],
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
      name : "Enchanting Talker",
	  source : [["XUA25AS", 8]],
	  minlevel : 3,
	  description : desc([
		"I can add my Int Mod (min 1) to my Cha (Deception, Intimidation, Performance, and Persuasion) checks.",
		"I gain Prof in my choice of one of the following skills: Deception, Intimidation, or Persuasion.",
	  ]),
	  addMod: [
        {type: "skill", field: "Deception", mod: "Int", text: "I can add my Intelligence modifier to Deception rolls."},
		{type: "skill", field: "Intimidation", mod: "Cha", text: "I can add my Intelligence modifier to Intimidation rolls."},
		{type: "skill", field: "Performance", mod: "Cha", text: "I can add my Intelligence modifier to Performance rolls."},
		{type: "skill", field: "Persuasion", mod: "Cha", text: "I can add my Intelligence modifier to Persuasion rolls."},
      ],
	  skillstxt: {
		primary: "Choose 1: Deception, Intimidation, or Persuasion",
	  },
    },
	 "subclassfeature3.2": {
      name : "Vexing Movement",
	  source : [["XUA25AS", 9]],
	  minlevel : 3,
	  description : desc([
		"Immediately after I cast an Enchantment spell using an Action \u0026 a spell slot, I can take both the Disengage \u0026 Dash actions as a Bonus Action.",
		"I can use this feature a number of times equal to my Int mod (min 1), \u0026 I regain all expended uses when I finish a Long Rest."
	  ]),
	  action : [["bonus action", " "]],
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
    },
    "subclassfeature6": {
      name: "Reflecting Charm",
      source: [["XUA25AS", 9]],
      minlevel: 6,
      description: desc([
        "When a creature \u2264 30 ft of me that I can see hits me with an attack, I can take a Reaction to reduce the damage taken by half, \u0026 I can force the attacker to make a Wis save against my spell save DC.",
		"On a failed save, the attacker takes Psychic dmg equal to half my Wizard lvl + my Int mod.",
		"I can do this again after a Long Rest or expending a level 2+ spell slot."
      ]),
	  action : [["reaction", " "]],
	  usages : 1,
	  recovery : "long rest",
	  altResource : "SS 2+",
    },
	"subclassfeature10": {
      name: "Split Enchantment",
      source: [["XUA25AS", 9]],
      minlevel: 10,
      description: desc([
        "When I cast an Enchantment spell, such as Charm Person, that can be cast with a higher-level spell slot to target an additional creature, increase the spell's effective level by 1.",
      ]),
    },
    "subclassfeature14": {
      name : "Bolstering Belief",
	  source : [["XUA25AS", 9]],
	  minlevel : 14,
	  description : desc([
		"My enchantments fortify my allies' bodies \u0026 minds. I always have Power Word Fortify prepared.",
		"With this feature, I can cast the spell without expending a spell slot once per Long Rest, and each target of the spell has Adv on saves to avoid/end the Charmed \u0026 Frightened conditions while it has Temp HP granted by this spell.",
	  ]),
	  spellcastingBonus : [{
		name : "Bolstering Belief",
		spells : ["power word fortify"],
		selection : ["power word fortify"],
		firstCol : "oncelr",
	  }],
	  limfeaname : "Bolstering Belief: Power Word Fortify",
	  usages : 1,
	  recovery : "long rest",
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
      source: [["XUA25AS", 9]],
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
	  source : [["XUA25AS", 9]],
	  minlevel : 3,
	  description : desc([
		" \u2022 Necrotic Resistance. I have Resistance to Necrotic dmg.",
		" \u2022 Grim Harvest. When I cast a Necromancy spell using a spell slot, choose myself or a creature I can see \u2264 30 ft of me to gain a number of Temp HP equal to the level of the spell slot + my Int mod (min 1 Temp HP).",
	  ]),
	  dmgres : ["Necrotic"],
    },
    "subclassfeature6": {
      name: "Grave Power",
      source: [["XUA25AS", 9]],
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
        "I always have Summon Undead prepared \u0026 can cast it once per Long Rest without expending a spell slot.",
		"When I cast Summon Undead without a spell slot, I can regain HP equal to half the summoned creature's total HP, but doing so halves the creature's HP.",
      ]),
	  spellcastingBonus : [{
		name : "Undead Thralls",
		spells : ["summon undead"],
		selection : ["summon undead"],
		firstCol : "oncelr",
	  }],
	  limfeaname : "Undead Thralls: Summon Undead",
	  usages : 1,
	  recovery : "long rest",
    },
	"subclassfeature10": {
      name: "Undead Secrets",
      source: [["XUA25AS", 10]],
      minlevel: 10,
      description: desc([
        "When I finish a Long Rest, I can expend a lvl 4+ spell slot to protect myself from death. Until I finish a Long Rest, the next time I would drop to 0 HP, my HP instead change to a number equal to 10x the spell slot expended.",
		"Additionally, immediately after I take damage \u0026 am Bloodied after taking that damage but not killed outright, I can take a Reaction \u0026 teleport to an unoccupied space \u2264 60 ft from me, and each creature \u2264 10 ft of the space I left takes 2d10 Necrotic dmg.",
      ]),
	  action : [["reaction", " "]],
    },
    "subclassfeature14": {
      name : "Death's Master",
	  source : [["XUA25AS", 10]],
	  minlevel : 14,
	  description : desc([
		"While holding my spellbook, I gain the following additional benefits:",
		" \u2022 Bolster Undead. As a Bonus Action, choose any number of Undead I have created/summoned with a Necromancy spell that are \u2264 60 ft of myself. Those Undead each gain Temp HP equal to my Wizard lvl. Once an Undead gains Temp HP from this feature, it can't gain them in this way again for the next 24hrs.",
		" \u2022 Harvest Power. When I use Grim Harvest, the creature that gains Temp HP gains one of the following benefits of my choice, which lasts until the end of the target's next turn: The target has Adv on attack rolls; The target has Adv on the next saving throw it makes.",
	  ]),
	  action : [["bonus action", "Death's Master: Bolster Undead"]],
    },
  },
});
legacySubClassRefactor("wizard", "transmutation", {
  regExpSearch: /(transmutation|transmuter)/i,
  subname : "School of Transmutation",
  fullname : "Transmuter",
  source: [["XUA25AS", 10]],
  replaces: "school of transmutation",
  features: {
    "subclassfeature3": {
      name: "Transmutation Savant",
      source: [["XUA25AS", 10]],
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
	  source : [["XUA25AS", 10]],
	  minlevel : 3,
	  description : desc([
		"When I finish a Long Rest, I can create a magic pebble called a Transmuter's Stone that lasts until I use this feature again.",
		"A creature with the stone in its possession gains a benefit from one of the following options, which I choose when I create the stone.",
		"I can change the stone's benefit when I cast a Transmutation spell using a spell slot.",
		" \u2022 Darkvision. The bearer gains Darkvision with a range of 60 ft or increases the range of its Darkvision by 60 ft.",
		" \u2022 Speed. The bearer's Speed increases by 10 ft.",
		" \u2022 Durability. The bearer gains Prof in Constitution saving throws.",
		" \u2022 Resistance. The bearer gains Resistance to Acid, Cold, Fire, Lightning, Poison, or Thunder dmg (my choice each time I choose this benefit).",
	  ]),
    },
	"subclassfeature3.2": {
      name : "Wondrous Enhancement",
	  source : [["XUA25AS", 11]],
	  minlevel : 3,
	  description : desc([
		"I always have spell Enhance Ability prepared \u0026 can cast it once per Long Rest without a spell slot.",
		"Targets of my Enhance Ability also have Adv on saves using the chosen ability.",
	  ]),
	  spellcastingBonus : [{
		name : "Wondrous Enhancement",
		spells : ["enhance ability"],
		selection : ["enhance ability"],
		firstCol : "oncelr",
	  }],
	  limfeaname : "Wondrous Enhancement: Enhance Ability",
	  usages : 1,
	  recovery : "long rest",
    },
    "subclassfeature6": {
      name: "Split Transmutation",
      source: [["XUA25AS", 11]],
      minlevel: 6,
      description: desc([
        "When I cast a Transmutation spell, such as Fly, that can be cast with a higher-level spell slot to target an additional creature, increase the spell's effective level by 1.",
		"I can use this feature a number of times equal to my Int mod (min 1), \u0026 I regain all expended uses when I finish a Long Rest."
      ]),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
    },
	"subclassfeature10": {
      name : "Potent Stone",
	  source : [["XUA25AS", 11]],
	  minlevel : 10,
	  description : desc([
		"My Transmuter's Stone is more versatile. I choose up to two options when I create my transmuter's stone.",
		"I can choose each option other than Resistance only once. If I choose Resistance twice, I must choose different damage types.",
		"I can change either or both benefits when I cast a Transmutation spell using a spell slot.",
	  ]),
    },
    "subclassfeature14": {
      name : "Master Transmuter",
	  source : [["XUA25AS", 11]],
	  minlevel : 14,
	  description : desc([
		"As a Magic action, I can consume the reserve of transmutation magic stored in my Transmuter's Stone to choose one of the following benefits.",
		"After using my Transmuter's Stone in this way, it crumbles to dust.",
		" \u2022 Panacea. The bearer regains a number of HP equal to twice my Wizard lvl \u0026 ends a curse, including the target's Attunement to a cursed item.",
		" \u2022 Restore Life. I cast Raise Dead without a spell slot, using the stone in place of the normally required Material components.",
		" \u2022 Restore Youth. The bearer permanently appears 3d10 years younger, to a minimum of young adulthood.",
	  ]),
    },
  },
});
MagicItemsList["transmuter's stone"] = {
  name : "Transmuter's Stone",
  source : [["XUA25AS", 10]],
  type : "wondrous item",
  rarity : "common",
  description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Select the benefit the Transmuter chose using the little square button in this magic item line.",
  descriptionFull : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot.",
  allowDuplicates : true,
  choices : ['Darkvision', 'Speed', 'Durability', 'Resistance: Acid', 'Resistance: Cold', 'Resistance: Fire', 'Resistance: Lightning', 'Resistance: Poison', 'Resistance: Thunder'],
  "darkvision" : {
	name : "Transmuter's Stone (Darkvision)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Darkvision: The bearer gains Darkvision with a range of 60 feet or increases the range of its Darkvision by 60 feet.",
	rarity : "common",
	vision : [["Darkvision", "fixed 60"], ["Darkvision", "+60"]],
	allowDuplicates : false,
  },
  "speed" : {
	name : "Transmuter's Stone (Speed)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Speed: The bearer's Speed increases by 10 feet.",
	rarity : "common",
	speed : {
	  allModes : { bonus : "+10" },
	},
	allowDuplicates : false,
  },
  "durability" : {
	name : "Transmuter's Stone (Durability)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Durability: The bearer gains proficiency in Constitution saving throws.",
	rarity : "common",
	saves : ["Con"],
	allowDuplicates : false,
  },
  "resistance: acid" : {
	name : "Transmuter's Stone (Resistance: Acid)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Acid damage.",
	rarity : "common",
	dmgres : ["Acid"],
	allowDuplicates : true,
  },
  "resistance: cold" : {
	name : "Transmuter's Stone (Resistance: Cold)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Cold damage.",
	rarity : "common",
	dmgres : ["Cold"],
	allowDuplicates : true,
  },
  "resistance: fire" : {
	name : "Transmuter's Stone (Resistance: Fire)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Fire damage.",
	rarity : "common",
	dmgres : ["Fire"],
	allowDuplicates : true,
  },
  "resistance: lightning" : {
	name : "Transmuter's Stone (Resistance: Lightning)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Lightning damage.",
	rarity : "common",
	dmgres : ["Lightning"],
	allowDuplicates : true,
  },
  "resistance: poison" : {
	name : "Transmuter's Stone (Resistance: Poison)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Poison damage.",
	rarity : "common",
	dmgres : ["Poison"],
	allowDuplicates : true,
  },
  "resistance: thunder" : {
	name : "Transmuter's Stone (Resistance: Thunder)",
	description : "When a Transmuter finishes a Long Rest, they can create a magic pebble called a Transmuter's Stone that lasts until they use this feature again. A creature with the stone in its possession gains a benefit from one of the following options, which the Transmuter chooses when they create the stone. They can change the stone's benefit when they cast a Transmutation spell using a spell slot. Resistance: The bearer gains Resistance to Thunder damage.",
	rarity : "common",
	dmgres : ["Thunder"],
	allowDuplicates : true,
  },
};