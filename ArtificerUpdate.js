/*	-INFORMATION-
	Subject:	Class, Subclasses, Companion Template Option, Magic Items, Creatures, Spell
	Effect:		This script adds all of the content from the Unearthed Arcana 2025: Eberron Updates article.
				This file has been made by MasterJedi2014, borrowing a lot of code from MorePurpleMoreBetter (Joost), Shroo, ThePokésimmer, TrackAtNite, and those who have contributed to the sheet's existing material.
	Code by:	MasterJedi2014, using MorePurpleMoreBetter's code as reference; Shroo; ThePokésimmer; TrackAtNite
	Date:		2025-09-01 (sheet v13.2.3)
	Notes:		This file will start by shunting the old Artificer and its subclasses into a "Legacy" class using code primarily developed by Shroo.
				It will thereafter define the new UA Artificer, along with options to customize some class features to include certain aspects of the old Artificer class features, followed by the magic items as well as Feats relating to Dragonmarks.
*/

var iFileName = "XUA25EU Content [by MasterJedi2014] V10.js";
RequiredSheetVersion("13.2.3");

/*	-SCRIPT AUTHOR NOTE-
	This file should be installed AFTER the other 2024 PHB & DMG scripts made by ThePokésimmer.
*/

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
// >>> Define Sources for everything first >>> //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

SourceList["XUA25EU"] = {
	name : "Unearthed Arcana 2025: Eberron Updates",
	abbreviation : "XUA25EU",
	date : "2025/02/27",
	group : "UA:5.24E",
	url : "https://media.dndbeyond.com/compendium-images/ua/eberron-updates/Lhg25Ggx5iY3rETH/UA2025-CartographerArtificer.pdf",
};

SourceList["XUA24A"] = {
	name : "Unearthed Arcana 2024: The Artificer",
	abbreviation : "XUA24A",
	date : "2024/12/16",
	group : "UA:5.24E",
	url : "https://media.dndbeyond.com/compendium-images/ua/the-artificer/AzQEA72K8EMf9HmU/UA2024-Artificer.pdf",
};

SourceList.LEGACYCLASS = {
  name: "Subclasses Deprecated by 2024 Player's Handbook",
  abbreviation: "LEGACY",
  abbreviationSpellsheet: "L",
  group: "Core Sources",
  url: "https://marketplace.dndbeyond.com/core-rules/3709000?pid=DB3709000",
  date: "2014/01/01",
  defaultExcluded : true,
};

SourceList["MJ:HB"] = {
	name : "MasterJedi2014's Homebrew",
	abbreviation : "MJ:HB",
	date : "2024/04/20",
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
// >>> Define functions used for refactoring old classes & subclasses >>> //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
function legacyClassRefactor(classKey, newClass) {
  console.println("Starting legacyClassRefactor...");
  if (!(classKey in ClassList)) {
    ClassList[classKey] = newClass;
  } else {
    newClass.subclasses = ClassList[classKey].subclasses;
    ClassList[classKey] = newClass;
  }
}
function archiveSubClass(classKey, subClass, newClassName) {
  subClass.subname = subClass.subname + " - 2014";
  if (subClass.fullname) subClass.fullname = subClass.fullname + " - 2014";
  subClass.source = [["LEGACYCLASS", 1]];
  for (var i of ClassList[classKey].subclasses[1]) {
    if (ClassSubList[i].regExpSearch.test(newClassName)) {
	  // ! This is matching an empty string and I don't know why (regex is fun)
	  var regex = "(?=^.*" + subClass.regExpSearch.source + ".*$)(?!^" + escapeRegExp(newClassName) + "$)";
    //   var regex = "^(?=" + subClass.regExpSearch.source + ")(?!" + escapeRegExp(newClassName.toLowerCase()) + ")$"; // ! tried adjusting the regex to remove uncessary symbols
	// 	 var regex = "^(?!" + escapeRegExp(newClassName.toLowerCase()) + ")(?=" + subClass.regExpSearch.source + ")$"; // ! Look ahead first before trying to match
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

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
// >>> Now add everything else >>> //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

// Artificer Class
legacyClassRefactor("artificer", {
  regExpSearch: /^(?=.*artificer)(?!.*wizard).*$/i,
  name: "Artificer",
  source: [["XUA25EU", 1]],
  primaryAbility: ["Intelligence"],
  abilitySave: 4,
  prereqs: "Intelligence 13",
  improvements: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5],
  die: 8,
  saves: ["Con", "Int"],
  skillstxt: {
    primary : "Choose 2: Arcana, History, Investigation, Medicine, Nature, Perception, and Sleight of Hand",
	secondary : "Choose 1: Arcana, History, Investigation, Medicine, Nature, Perception, and Sleight of Hand",
  },
  toolProfs : {
	primary : [["Thieves' Tools"], ["Tinker's Tools"], ["Artisan's tools", 1]],
	secondary : ["Tinker's Tools"],
  },
  armorProfs : {
    primary: [true, true, false, true],
    secondary: [true, true, false, true],
  },
  weaponProfs : {
    primary: [true, false],
  },
  equipment: "Artificer starting equipment:" +
    "\n \u2022 Studded Leather;" +
    "\n \u2022 Dagger;" +
    "\n \u2022 Thieves' Tools;" +
    "\n \u2022 Tinker's Tools,;" +
    "\n \u2022 A Dungeoneer's Pack, and 16 gp." +
    "\n\nAlternatively, choose 150 gp worth of starting equipment instead of the class' starting equipment.",
  subclasses: ["Artificer Specialist", []],
  attacks: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  spellcastingAbility: 4,
  spellcastingFactor: 2,
  spellcastingFactorRoundupMulti : true,
  spellcastingTable : [[0, 0, 0, 0, 0, 0, 0, 0, 0]].concat(levels.map(function (n) {
	return defaultSpellTable[Math.ceil(n / 2)];
  })),
  spellcastingKnown: {
    cantrips: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4],
    spells: "list",
    prepared: true,
  },
  features: {
	"spellcasting": {
      name: "Spellcasting",
      source : [["XUA25EU", 2]],
      minlevel: 1,
      additional: levels.map(function (n, idx) {
        var cantr = [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4][idx];
        var splls = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15][idx];
        return cantr + " cantrips \u0026 " + splls + " spells prepared";
      }),
      calcChanges: {
        spellAdd : [
		  function (spellKey, spellObj, spName) {
			if (!spellObj.psionic && spName == "artificer" && spellObj.compMaterial === SpellsList[spellKey].compMaterial) {
			  var extraFocus = classes.known.artificer.subclass.indexOf("artillerist") !== -1 && classes.known.artificer.level > 4 ? "my arcane firearm, " : classes.known.artificer.subclass.indexOf("armorer") !== -1 && classes.known.artificer.level > 2 ? "my arcane armor, " : "";
			  spellObj.compMaterial = (spellObj.compMaterial ? spellObj.compMaterial + ".\n\nAlso a" : "A") + "lways requires my artificer spellcasting focus: thieves' tools, any set of artisan's tools I'm proficient with, " + extraFocus + ".";
			  if (GetFeatureChoice("classes", "artificer", "spellcasting", true).indexOf("don't change component column on spell sheet") != -1) {
				// do nothing if set to do so
			  } else if (!spellObj.components) {
				spellObj.components = "M\u0192";
			  } else if (spellObj.components.indexOf("M") == -1) {
				spellObj.components += ",M\u0192";
			  } else if ((/M([^\u0192\u2020]|$)/).test(spellObj.components)) {
				spellObj.components = spellObj.components.replace("M", "M\u0192");
			  }
			  return true;
			}
			return false;
		  },
		  "My Artificer spells always require me to use a Spellcasting Focus: Thieves' Tools, or Artisan's Tools I'm proficient with"
		],
		spellCalc: [
          function (type, spellcasters, ability) {
            if (type === "prepare" && spellcasters.indexOf("artificer") !== -1) {
              var lvl = classes.known.artificer.level;
              var sArr = [0, 2, 3, 5, 5, 7, 6, 8, 7, 10, 9, 11, 10, 12, 11, 13, 12, 15, 14, 16, 15];
              return sArr[lvl] - Math.ceil(lvl / 2) - Number(What("Int Mod"));
            }
          }
        ]
      },
      description: desc([
        "I can cast Artificer spells using Int as my spellcasting ability. I can use Thieves' Tools,",
		"Tinker's Tools, or another kind of Artisan's Tools I am proficient with as a Spellcasting Focus",
		"I must have one of those foci in hand when I cast an Artificer spell",
		"I can replace one cantrip with another when I finish a Long Rest",
      ]),
	  extrachoices : ["Don't change component column on spell sheet"],
	  extraname : "Artificer Spellcasting",
	  "don't change component column on spell sheet" : {
		name : "[Meta] Don't alter spell sheets",
		source : [["XUA25EU", 3]],
		description : "\n   The automation will not add M\u0192 to each artificer spell on the generated spell sheets"
	  },
    },
    "tinker's magic": {
	  name : "Tinker's Magic",
	  source : [["XUA25EU", 3]],
	  minlevel : 1,
	  description : desc([
		"As a Magic action, I use Tinker's Tools to create one item per 2024 PHB in an unoccupied space within 5ft.",
		"I can only make one of the following, which will last until I finish a Long Rest:",
		" \u2022 Ball Bearings \u2022 Basket \u2022 Bedroll \u2022 Bell \u2022 Blanket \u2022 Block \u0026 Tackle \u2022 Bucket \u2022 Caltrops \u2022 Candle",
		" \u2022 Crowbar \u2022 Flask \u2022 Jug \u2022 Lamp \u2022 Net \u2022 Oil \u2022 Paper \u2022 Parchment \u2022 Pole \u2022 Pouch \u2022 Rope \u2022 Sack",
		" \u2022 Shovel \u2022 String \u2022 Tinderbox \u2022 Torch \u2022 Vial",
	  ]),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
	  action : [["action", " (add/remove)"]],
	  spellcastingBonus: [{
		name : "Tinker's Magic: Mending",
		spells : ["mending"],
		selection : ["mending"],
		times: 1,
	  }],
	  "infuse item" : {
		name : "Replicate Magic Item",
		extraname : "Artificer 2",
		source : [["XUA25EU", 2]],
		description : desc([
		  "When I finish a Long Rest, I can create 1 or 2 different magic items from arcane plans using",
		  "Tinker's Tools. I can attune to it immediately; If I replicate too many items, the oldest item",
		  "vanishes. The infusion lasts until I unlearn it or my death + my 1d4 days. Infused containers, like",
		  "a Bag of Holding, spread their contents harmlessly in \u0026 around its space when it vanishes.",
		  "Whenever I gain an Artificer level, I can replace an arcane plan I know with another.",
		  "I can use a replicated Wand or Weapon as a Spellcasting Focus.",
		]),
		additional : levels.map(function (n) {
		  return n < 2 ? "" : (n < 6 ? 4 : n < 10 ? 5 : n < 14 ? 6 : n < 18 ? 7 : 8) + " plans known; max " + (n < 6 ? 2 : n < 10 ? 3 : n < 14 ? 4 : n < 18 ? 5 : 6) + " replicated items";
		})
	  },
	  autoSelectExtrachoices : [{
		extrachoice : "infuse item",
		minlevel : 2
	  }]
	},
	// ! This will be deleted later on. 
	// ! This is the minimum a feature is required to have.
	"infuse item" : {
	  name : "Infuse Item",
	  source : [["E:RLW", 57], ["T", 12]],
	  minlevel : 2,
	  description : desc([
		"This entry will be deleted. Contact script author if this appears on the sheet."
	  ]),
	  extrachoices : [] // ! Left so that it doesn't try to push into an undefined extrachoice
	},
	"replicate magic item": {
      name: "Replicate Magic Item",
      source : [["XUA25EU", 3]],
      minlevel: 2,
      description : '\n   Use the "Choose Feature" button above to add Magic Items Replicated to the third page',
	  additional : levels.map(function (n) {
		return n < 2 ? "" : (n < 6 ? 4 : n < 10 ? 5 : n < 14 ? 6 : n < 18 ? 7 : 8) + " plans known; max " + (n < 6 ? 2 : n < 10 ? 3 : n < 14 ? 4 : n < 18 ? 5 : 6) + " replicated items";
	  }),
	  extraname : "Replicate Magic Item",
	  extraTimes : levels.map(function (n) {
		return n < 2 ? 0 : n < 6 ? 4 : n < 10 ? 5 : n < 14 ? 6 : n < 18 ? 7 : 8;
	  }),
	  eval : function() {
		AddArtificerMI();
	  }
    },
    "subclassfeature3" : {
	  name : "Artificer Specialist",
	  source : [["XUA25EU", 4]],
	  minlevel : 3,
	  description : desc([
		'Choose a specialism and put it in the "Class" field on the first page',
		"Choose either Alchemist, Armorer, Artillerist, Battle Smith, or Cartographer"
	  ]),
	},
	"magic item tinker" : {
	  name : "Magic Item Tinker",
	  source : [["XUA25EU", 4]],
	  minlevel : 6,
	  description : desc([
		"My Replicate Magic Item feature improves as follows:",
		" \u2022 Charge Magic Item. As a Bonus Action, I can touch one of my replicated magic items that uses charges \u0026 that is within 5 ft of myself. I can recharge the item at the cost of a level 1+ spell slot, with the number of charges restored equal to the spell slot level expended.",
		" \u2022 Drain Magic Item. Once per Long Rest as a Bonus Action, I can cause one of my replicated magic items to vanish, converting the energy into a spell slot. The slot is level 1 if the item is Common or level 2 if the item is Uncommon or Rare. Any spell slot I create with this feature vanishes after a Long Rest.",
		" \u2022 Transmute Magic Item. Once per Long Rest as a Magic Action, I can touch one of my replicated magic items that is within 5 ft of myself \u0026 transform it into another magic item for which I know the arcane plans to.",
	  ]),
	  action : [["bonus action", "Charge/Drain Magic Item"], ["action", "Transmute Magic Item"]],
	},
	"flash of genius" : {
	  name : "Flash of Genius",
	  source : [["XUA25EU", 5]],
	  minlevel : 7,
	  description : "\n   As a Reaction when I or another I can see in 30 ft fail a check/save, I can add my Int mod to it",
	  action : [["reaction", ""]],
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest"
	},
	"magic item adept" : {
	  name : "Magic Item Adept",
	  source : [["XUA25EU", 5]],
	  minlevel : 10,
	  description : "\n   I can attune to more magic items than others can.",
	  additional : levels.map(function (n) {
		return n < 10 ? "" : "attune to " + (n < 14 ? 4 : n < 18 ? 5 : 6) + " magic items";
	  })
	},
	"spell-storing item" : {
	  name : "Spell-Storing Item",
	  source : [["XUA25EU", 5]],
	  minlevel : 11,
	  description : desc([
		"When I finish a Long Rest, I can infuse a 1st-/2nd-/3rd-level Artificer spell into an item I touch",
		"It has to be a weapon or Spellcasting Focus for me; Stored spells are lost if I do this again",
		"The spell must have a casting time of 1 action \u0026 mustn't have a consumed Material component, but I needn't have it prepared",
		"A creature holding an infused item can use a Magic action to cast the spell, using my abilities"
	  ]),
	  additional : "cast stored spell",
	  usages : "2\xD7 Int mod per ",
	  usagescalc : "event.value = Math.max(2, Number(What('Int Mod')) * 2);",
	  recovery : "long rest"
	},
	"magic item savant" : {
	  name : "Magic Item Savant",
	  source : [["XUA25EU", 5]],
	  minlevel : 14,
	  description : "\n   I can attune to even more magic items than others can.",
	},
	"epic boon": {
	  name : "Epic Boon",
	  source : [["XUA25EU", 5]],
	  minlevel : 19,
	  description : desc([
		"I gain an Epic Boon feat, or another feat of my choice for which I qualify.",
	  ]),
	},
	"soul of artifice" : {
	  name : "Soul of Artifice",
	  source : [["XUA25EU", 5]],
	  minlevel : 20,
	  description : desc([
		"Cheat Death. As a free action when I'm reduced to 0 HP, I can disintegrate any number of Uncommon or Rare Replicated Magic Items to instead drop to a number of HP equal to 20 times the number of disintegrate magic items.",
		"Magical Guidance. Whenever I use my Flash of Genius, but the check/save still fails, I don't expend that use of Flash of Genius if I am atuned to at least 1 magic item.",
	  ]),
	  action : [["reaction", " (Free Action)"]],
	}
  },
  prereqLvl6 : function(v) { return classes.known.artificer.level >= 6; },
  prereqLvl10 : function(v) { return classes.known.artificer.level >= 10; },
  prereqLvl14 : function(v) { return classes.known.artificer.level >= 14; },
});
legacySubClassRefactor("artificer", "alchemist", {
  regExpSearch: /^(?=.*alchemist)(?!.*wizard).*$/i,
  subname : "Alchemist",
  fullname : "Alchemist",
  source: [["XUA24A", 7]],
  replaces: "alchemist",
  spellcastingExtra: ["healing word", "ray of sickness", "flaming sphere", "melf's acid arrow", "gaseous form", "mass healing word", "death ward", "vitriolic sphere", "cloudkill", "raise dead"],
  features: {
    "subclassfeature3": {
      name: "Tools Proficiency",
      source: [["XUA24A", 7]],
      minlevel: 3,
      description: " [proficient with Alchemist's Supplies]\n   I can brew a potion using the DMG (2024) crafting rules in half the normal time.",
	  toolProfs : ["Alchemist's Supplies", 1],
    },
    "subclassfeature3.1": {
      name : "Experimental Elixir",
	  source : [["XUA24A", 7]],
	  minlevel : 3,
	  description : desc([
		"When I finish a Long Rest, I can produce a number of elixirs in vials",
		"Also, as a Magic action, I can expend a spell slot to create one elixir with my choice of effect",
		"I need Alchemist Supplies on my person to do this; An elixir & its vial lasts until my next Long Rest",
		"For their effects, see the experimental elixir table on a Notes page; They work like potions"
	  ]),
	  additional : levels.map(function (n) {
		return n < 3 ? "" : "create " + (n < 5 ? 2 : n < 9 ? 3 : n < 15 ? 4 : 5) + " elixirs after finishing a Long Rest";
	  }),
	  action : [["action", ""]],
	  toNotesPage : [{
		name : "Experimental Elixir Table",
		note : [
			"Whenever I finish a Long Rest, I can magically produce a number of experimental elixir in vials. I can create two at level 3, three at level 5, four at level 9, and five at level 15.",
			"Creating an experimental elixir requires me to have Alchemist's Supplies on my person, and any elixir & its vial created like this lasts until it is drunk, poured out, or until the end of my next Long Rest.",
			"I can create additional experimental elixirs by expending a spell slot of 1st level or higher for each one. When I do so, I use a Magic action to create the elixir & its vial.",
			"As a Bonus Action, a creature can drink the elixir or administer it to another creature within 5ft of itself.",
			"The effect of an elixir when someone drinks it is found on the table below. Roll to determine the effect for each elixir I create when finishing a Long Rest. I can choose the effect from the table for those created by expending a spell slot.",
			"\n  D6\tEFFECT",
			"1\tHealing: The drinker regains a number of Hit Points equal to 2d8 + my Intelligence modifier.",
			"2\tSwiftness: The drinker's Speed increases by 10 ft for 1 hour.",
			"3\tResilience: The drinker gains a +1 bonus to AC for 10 minutes.",
			"4\tBoldness: The drinker can roll 1d4 and add the number rolled to every attack roll and saving throw they make for the next minute.",
			"5\tFlight: The drinker gains a Fly Speed of 10 ft for 10 minutes.",
			"6\tYou determine the elixir's effect by choosing one of the other rows in this table."
		]
	  }]
    },
    "subclassfeature5": {
      name : "Alchemical Savant",
	  source : [["XUA24A", 7]],
	  minlevel : 5,
	  description : desc([
		"When I cast spells using Alchemist's Supplies as my Spellcasting Focus, I can enhance them",
		"I add my Int mod to one roll of Acid, Fire, Necrotic, or Poison damage, or restoring HP"
	  ]),
	  calcChanges : {
		atkCalc : [
		  function (fields, v, output) {
			if (v.thisWeapon[3] && v.thisWeapon[4].indexOf("artificer") !== -1 && (/acid|fire|necrotic|poison/i).test(fields.Damage_Type)) {
			  output.extraDmg += Math.max(Number(What("Int Mod")), 1);
			}
		  },
		  "Artificer spells that deal Acid, Fire, Necrotic, or Poison damage which I cast while using Alchemist's Supplies as my Spellcasting Focus, have my Intelligence modifier (min 1) added to one damage die roll."
		],
		spellAdd : [
		  function (spellKey, spellObj, spName) {
			if (spellObj.psionic || spName !== "artificer") return;
			var toAdd = Math.max(Number(What("Int Mod")), 1);
			if (genericSpellDmgEdit(spellKey, spellObj, "acid|fire|necro\\.?|necrotic|poison", toAdd, true, true) || genericSpellDmgEdit(spellKey, spellObj, "heal", toAdd, true, true)) {
			  return true;
			}
		  },
		  "Artificer spells I cast using Alchemist's Supplies as my Spellcasting Focus, have my Intelligence modifier (min 1) added to one die rolled for dealing Acid, Fire, Necrotic, or Poison damage, or when restoring Hit Points."
		]
	  }
    },
    "subclassfeature9": {
      name : "Restorative Reagents",
	  source : [["XUA24A", 7]],
	  minlevel : 9,
	  description : desc([
		"Drinking my experimental elixirs now also grants my Int mod + my Artificer level in temp HP (min 1)",
		"I can cast Lesser Restoration with Alchemist's Supplies without a spell slot (Int mod times)"
	  ]),
	  usages : "Int mod per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
	  limfeaname : "Restorative Reagents: Lesser Restoration",
	  spellcastingBonus : {
		name : "Restorative Reagents",
		spells : ["lesser restoration"],
		selection : ["lesser restoration"],
		firstCol : "Sp"
	  },
	  spellChanges : {
		"lesser restoration" : {
		  components : "V,S,M\u0192",
		  compMaterial : "Alchemist's supplies",
		  changes : "When using my Restorative Reagents class feature, I can cast Lesser Restoration a number of times per long rest equal to my Intelligence modifier. To do so, I have to use Alchemist's Supplies as my Spellcasting Focus."
		}
	  }
    },
	"subclassfeature15": {
	  name : "Chemical Mastery",
	  source : [["XUA24A", 8]],
	  minlevel : 15,
	  description : " [each spell 1\xD7 per long rest]" + desc([
		"I have Resistance to Acid and Poison damage; I can cast Tasha's Bubbling Cauldron once per Long Rest without a spell slot",
		"I need Alchemist's Supplies as a focus for it, but the spell requires no material components",
		"My Artificer spells that deal Acid, Fire, Necrotic, or Poison damage now deal an additional 2d8 Force damage"
	  ]),
	  dmgres : ["Acid", "Poison"],
	  extraLimitedFeatures : [{
		name : "Chemical Mastery: Tasha's Bubbling Cauldron",
		usages : 1,
		recovery : "long rest"
	  }],
	  spellcastingBonus : {
		name : "Chemical Mastery",
		spells : ["tasha's bubbling cauldron"],
		selection : ["tasha's bubbling cauldron"],
		firstCol : "oncelr",
		times : 1
	  },
	  spellChanges : {
		"tasha's bubbling cauldron" : {
		  components : "V,S,M\u0192",
		  compMaterial : "Alchemist's supplies",
		  description : "Immobile cauldron of Common/Uncom. potion; max spell mod, min 1; bns take 1; disappear on recast",
		  changes : "When using my Chemical Mastery class feature and Alchemist's Supplies as my Spellcasting Focus, I can cast Tasha's Bubbling Cauldron once per Long Rest without using a spell slot or requiring other material components."
		},
	  },
	  calcChanges : {
		atkCalc : [
		  function (fields, v) {
			if (v.thisWeapon[3] && v.thisWeapon[4].indexOf("artificer") !== -1 && (/acid|fire|necrotic|poison/i).test(fields.Damage_Type)) {
			  fields.Description += (fields.Description ? '; ' : '') + 'Once per turn +2d8 Force damage';
			}
		  },
		  "Artificer spells that deal Acid, Fire, Necrotic, or Poison damage which I cast while using Alchemist's Supplies as my Spellcasting Focus deal an additional 2d8 Force damage."
		],
	  }
	},
  },
});
legacySubClassRefactor("artificer", "artillerist", {
  regExpSearch: /^(?=.*artillerist)(?!.*wizard).*$/i,
  subname : "Artillerist",
  fullname : "Artillerist",
  source: [["XUA24A", 10]],
  replaces: "artillerist",
  spellcastingExtra: ["shield", "thunderwave", "scorching ray", "shatter", "fireball", "wind wall", "ice storm", "wall of fire", "cone of cold", "wall of force"],
  features: {
   "subclassfeature3": {
      name: "Tools Proficiency",
      source: [["XUA24A", 10]],
      minlevel: 3,
      description: " [proficient with Woodcarver's Tools]\n   I can craft a magic Wand in half the normal time.",
	  toolProfs : ["Woodcarver's Tools", 1],
    },
    "subclassfeature3.1" : {
	  name : "Eldritch Cannon",
	  source : [["XUA24A", 10]],
	  minlevel : 3,
	  description : desc([
		"As a Magic action, I can use Woodcarver's or Smith's Tools to create an Eldritch Cannon in 5 ft",
		"I can do this once per Long Rest, or by expending a spell slot (SS 1+) to create one cannon",
		"I decide its size (Small/Tiny) and appearance",
		"It disappears after 1 hour, when reduced to 0 HP, or if I dismiss it as a Magic action",
		"As a Bonus Action when within 60 ft of it, I can activate it to move and do its action",
		"I can't have multiple cannons; Select \"Eldritch Cannon\" on a companion page for its stats"
	  ]),
	  usages : 1,
	  recovery : "long rest",
	  altResource : "SS 1+",
	  additional : levels.map(function(n) {
		return n < 3 ? "" : n < 15 ? "create 1 cannon" : "create 2 cannons";
	  }),
	  action : [["action", " (summon/dismiss)"], ["bonus action", " (activate)"]],
	  creaturesAdd : [["Eldritch Cannon"]],
	  creatureOptions : [{
		name : "Eldritch Cannon",
		source : [["XUA24A", 10]],
		size : [4, 5],
		type : "Object",
		alignment : "",
		ac : 18,
		hp : 5,
		hd : ["", ""],
		speed : "15 ft, climb 15 ft",
		scores : [10, 10, 10, 10, 10, 10],
		damage_immunities : "poison, psychic",
		passivePerception : 10,
		senses : "",
		challengeRating : "1",
		proficiencyBonus : 2,
		proficiencyBonusLinked : true,
		attacksAction : 0,
		attacks : [{
		  name : "Flamethrower",
		  ability : 4,
		  damage : [2, 8, "fire"],
		  range : "15-ft cone",
		  description : "Dex save, success - half damage; Unattended flammable objects ignite",
		  dc : true,
		  useSpellMod : "artificer",
		  abilitytodamage : false,
		  tooltip : "The cannon exhales fire in an adjacent 15-ft Cone that its creator designates. Each creature in that area must make a Dexterity saving throw against its creator's artificer spell save DC, taking 2d8 Fire damage on a failed save or half as much damage on a successful one. The fire ignites any flammable objects in the area that aren't being worn or carried."
		}, {
		  name : "Force Ballista",
		  ability : 4,
		  damage : [2, 8, "force"],
		  range : "120 ft",
		  description : "Creature hit is pushed 5 ft away",
		  useSpellMod : "artificer",
		  abilitytodamage : false,
		  tooltip : "The cannon's creator makes a ranged spell attack, originating from the cannon, at one creature or object within 120 ft of it. On a hit, the target takes 2d8 Force damage, and if the target is a creature, it is pushed up to 5 ft away from the cannon."
		}, {
		  name : "Detonate",
		  ability : 4,
		  damage : [3, 10, "force"],
		  range : "20-ft radius",
		  description : "Dex save, success - half damage; Destroys cannon",
		  dc : true,
		  useSpellMod : "artificer",
		  abilitytodamage : false,
		  tooltip : "As an Reaction, its creator can command the cannon to deto­nate if its creator is within 60 ft of it. Doing so destroys the cannon and forces each creature within 20 ft of it to make a Dexterity saving throw against its creator's artificer spell save DC, taking 3d10 Force damage on a failed save or half as much damage on a successful one."
		}],
		features : [{
		  name : "Healing",
		  description : "The cannon regains 2d6 HP whenever Mending is cast on it."
		}, {
		  name : "Protector",
		  description : "The cannon emits a burst of positive energy that grants itself and each creature of its creator's choice within 10 ft of it a number of temporary hit points equal to 1d8 + its creator's Intelligence modifier (minimum of +1)."
		}],
		traits : [{
		  name : "Creator",
		  description : "As an Object, the cannon only acts when activated by its creator, uses its creator's artificer spell attack and save DC, and has five times the artificer level in HP. It disappears after 1 hour, when reduced to 0 HP, or when its creator dismisses it as a Magic action."
		}, {
		  name : "Activation",
		  description : "The creator of the cannon can activate it as a Bonus Action while within 60 ft of it. Once activated, the cannon does as instructed, moves and uses the action associated with the command: flamethrower attack, force ballista attack, or protector feature."
		}, {
		  name : "Detonate (Artillerist 9)",
		  minlevel : 9,
		  description : "The creator of the cannon, can use an action to detonate the cannon when within 60 ft of it, see the attack section. The cannon's attacks now deal 3d8 damage.",
		  eval : function(prefix, lvl) {
			// add the Detonate attack entry
			Value(prefix + "Comp.Use.Attack.3.Weapon Selection", "Detonate");
			// Upgrade the damage for the attacks
			for (var i = 1; i <= 2; i++) {
			  Value(prefix + "BlueText.Comp.Use.Attack." + i + ".Damage Die", "3d10");
			}
		  },
		  removeeval : function(prefix, lvl) {
			// remove the Detonate attack entry
			Value(prefix + "Comp.Use.Attack.3.Weapon Selection", "");
			// Reset the damage for the attacks
			for (var i = 1; i <= 2; i++) {
			  Value(prefix + "BlueText.Comp.Use.Attack." + i + ".Damage Die", "2d8");
			}
		  }
		}, {
		  name : "Shimmering Field (Artillerist 15)",
		  minlevel : 15,
		  description : "The creator of the cannon and their allies have Half Cover while within 10 ft of the cannon."
		}],
		minlevelLinked : ["artificer"],
		header : "Object",
		calcChanges : {
		  hp : function (totalHD, HDobj, prefix) {
			if (!classes.known.artificer) return;
			var artLvl = classes.known.artificer.level;
			HDobj.alt.push(5 * artLvl);
			HDobj.altStr.push(" = 5 \xD7 " + artLvl + " from five times its creator's artificer level");
		  },
		  setAltHp : true
		},
		eval : function(prefix, lvl) {
		  // remove the Detonate attack if adding this creature before artificer level 9
		  if (lvl[0] < 9) Value(prefix + "Comp.Use.Attack.3.Weapon Selection", "");
		}
	  }]
	},
	"subclassfeature5" : {
	  name : "Arcane Firearm",
	  source : [["XUA24A", 10]],
	  minlevel : 5,
	  description : " [lasts until I use this feature again]" + desc([
		"After a long rest, I can use Woodcarver's Tools to enhance a Rod, Staff, or Wand",
		"If I use this as my Spellcasting Focus for an Artificer spell, I add +1d8 to one damage"
	  ]),
	  calcChanges : {
		atkAdd : [
		  function (fields, v) {
			if (v.thisWeapon[3] && v.thisWeapon[4].indexOf("artificer") !== -1) {
			  fields.Damage_Die = fields.Damage_Die.replace(/D/g, 'd');
			  var d8Regex = /(\d+)d8/;
			  if (fields.Damage_Die.indexOf('Bd8') != -1) {
				fields.Damage_Die = fields.Damage_Die.replace('Bd8', 'Cd8');
			  } else if (fields.Damage_Die.indexOf('Cd8') != -1) {
				fields.Damage_Die = fields.Damage_Die.replace('Cd8', 'Qd8');
			  } else if (d8Regex.test(fields.Damage_Die)) {
				fields.Damage_Die = fields.Damage_Die.replace(d8Regex, Number(fields.Damage_Die.replace(d8Regex, '$1')) + 1 + 'd8');
			  } else if (v.thisWeapon[3] == "eldritch blast") {
				fields.Description += (fields.Description ? '; ' : '') + "One ray +1d8 dmg";
			  } else {
				fields.Damage_Die += '+1d8';
			  }
			}
		  },
		  "If I use my Arcane Firearm as a Spellcasting Focus for an Artificer spell, I can add +1d8 to one of the spell's damage rolls.",
		  10
		],
		spellAdd : [
		  function (spellKey, spellObj, spName) {
			if (spellObj.psionic || spName !== "artificer") return;
			return genericSpellDmgEdit(spellKey, spellObj, "\\w+\\.?", "1d8", true, true);
		  },
		  "If I use my Arcane Firearm as a Spellcasting Focus for an Artificer spell, I can add +1d8 to one of the spell's damage rolls."
		]
	  }
	},
	"subclassfeature9" : {
	  name : "Explosive Cannon",
	  source : [["XUA24A", 11]],
	  minlevel : 9,
	  description : "\n   My eldritch cannons deal +1d8 damage; As an action, I can detonate a cannon in 60 ft",
	  action : [["action", "Eldritch Cannon (detonate)"]]
	},
	"subclassfeature15" : {
	  name : "Fortified Position",
	  source : [["XUA24A", 11]],
	  minlevel : 15,
	  description : " [cannons grant half cover in 10 ft to allies]" + desc([
		"I can now have two cannons at the same time and activate both with one bonus action",
		"I can create 2 eldritch cannons with the same action (still only one with a spell slot)"
	  ])
	},
  },
});
legacySubClassRefactor("artificer", "battle smith", {
  regExpSearch: /^(?=.*battle)(?=.*smith)(?!.*wizard).*$/i,
  subname : "Battle Smith",
  fullname : "Battle Smith",
  source: [["XUA24A", 11]],
  replaces: "battle smith",
  spellcastingExtra: ["heroism", "shield", "branding smite", "warding bond", "aura of vitality", "conjure barrage", "aura of purity", "fire shield", "banishing smite", "mass cure wounds"],
  attacks : [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  features: {
    "subclassfeature3": {
      name: "Battle Ready \u0026 Tools Proficiency",
      source: [["XUA24A", 11]],
      minlevel: 3,
      description: " [proficient with Martial Weapons and Smith's Tools]\n   I can craft nonmagical & magical weapons in half the normal time.",
	  toolProfs : ["Smith's Tools", 1],
	  weaponProfs : [false, true],
	  calcChanges : {
		atkAdd : [
		  function (fields, v) {
			if (!v.isSpell && (v.theWea.isMagicWeapon || v.thisWeapon[1]) && (fields.Mod === 1 || fields.Mod === 2) && Number(What("Int")) > Number(What(fields.Mod === 1 ? "Str" : "Dex"))) {
			  fields.Mod = 4;
			}
		  },
		  'I can use my Intelligence modifier instead of Strength or Dexterity for the attack and damage rolls of magic weapons.'
		]
	  }
    },
    "subclassfeature3.1" : {
	  name : "Steel Defender",
	  source : [["XUA24A", 12]],
	  minlevel : 3,
	  description : desc([
		"When I end a Long Rest, I can use Smith's Tools to create a Steel Defender",
		"I determine its appearance; It obeys my commands and it acts on my initiative, after me",
		"Unless I use a Bonus Action to command it, it only takes the Dodge action on its turn",
		"It can take Reactions and move on its turn even if I don't command it",
		"I can't have multiple at once; Select \"Steel Defender\" on a companion page for its stats"
	  ]),
	  action : [["bonus action", " (command)"], ["action", " (restore)"]],
	  creaturesAdd : [["Steel Defender"]],
	  creatureOptions : [{
		name : "Steel Defender",
		source : [["XUA24A", 12]],
		size : 3,
		type : "Construct",
		alignment : "Neutral",
		ac : 15,
		hp : 20,
		hd : [2, 8],
		hdLinked : ["artificer"],
		speed : "40 ft",
		scores : [14, 12, 14, 4, 10, 6],
		saves : ["Prof", "Prof", "Prof", "Prof", "Prof", "Prof"],
		damage_immunities : "poison",
		condition_immunities : "charmed, exhaustion, poisoned",
		passivePerception : 10,
		senses : "Darkvision 60 ft",
		languages : "understands the languages of its creator but can't speak",
		challengeRating : "1",
		proficiencyBonus : 2,
		proficiencyBonusLinked : true,
		attacksAction : 1,
		attacks : [{
		  name : "Force-Empowered Rend",
		  ability : 4,
		  damage : [1, 8, "piercing"],
		  range : "Melee (5 ft)",
		  description : "",
		  modifiers : [, "Int+2"],
		  abilitytodamage : false,
		  useSpellMod : "artificer"
		}, {
		  name : "Deflect Attack (reaction)",
		  ability : 0,
		  damage : [1, 4, "force"],
		  range : "Melee (5 ft)",
		  description : "After using the reaction, the attacker takes this damage, no attack roll required",
		  modifiers : ["-Prof", "oInt"],
		  abilitytodamage : false
		}],
		features : [{
		  name : "Creator",
		  description : "The steel defender obeys the commands of its creator and shares its proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take reactions on its own, but only takes the Dodge action on its turn unless its creator takes a bonus action to command it to take another action. If its creator is incapacitated, it can take any action, not just Dodge."
		}, {
		  name : "Steel Bond",
		  description : "Adds its creator's Proficiency Bonus to any ability check or saving throw the " + (typePF ? "" : "steel ") + "defender makes."
		}],
		actions : [{
		  name : "Repair (3/Day)",
		  description : "As an action, the " + (typePF ? "" : "magical mechanisms inside the ") + "steel defender restore" + (typePF ? "s" : "") + " 2d8 + its creator's Intelligence modifier in HP to itself or to one construct or object within 5 ft of it."
		}, {
		  name : "Deflect Attack (reaction)",
		  description : typePF ? "As a reaction, the steel defender imposes Disadvantage on the attack roll of one creature it can see that is within 5 ft of it, provided the attack roll is against a creature other than the defender." : "As a reaction, the defender imposes disadv. on the attack roll of one creature it can see within 5 ft, provided the creature attacks another than the defender."
		}, {
		  name : "Arcane Jolt (Battle Smith 9)",
		  minlevel : 9,
		  eval : function(prefix, lvl) {
			Value(prefix + "Comp.Use.Attack.1.Description", "Arcane Jolt (2d6): On hit, deal force damage or heal target in 30 ft");
		  },
		  removeeval : function(prefix, lvl) {
			Value(prefix + "Comp.Use.Attack.1.Description", "");
		  }
		}, {
		  name : "Improved Defender (Battle Smith 15)",
		  minlevel : 15,
		  description : "The steel defender's Deflect Attack now deals 1d4 + its creator's Intelligence modifier in force damage to the attacker.",
		  addMod : [{ type : "", field : "Comp.Use.AC", mod : 2, text : "The steel defender gains a +2 bonus to its AC (base AC of 15)." }],
		  eval : function(prefix, lvl) {
			Value(prefix + "Comp.Use.Attack.1.Description", What(prefix + "Comp.Use.Attack.1.Description").replace("Arcane Jolt (2d6)", "Arcane Jolt (4d6)"));
			Value(prefix + "Comp.Use.Attack.2.Weapon Selection", "Deflect Attack (reaction)");
		  },
		  removeeval : function(prefix, lvl) {
			Value(prefix + "Comp.Use.Attack.1.Description", What(prefix + "Comp.Use.Attack.1.Description").replace("Arcane Jolt (4d6)", "Arcane Jolt (2d6)"));
			Value(prefix + "Comp.Use.Attack.2.Weapon Selection", "");
		  }
		}],
		minlevelLinked : ["artificer"],
		header : "Construct",
		calcChanges : {
		  hp : function (totalHD, HDobj, prefix) {
			if (!classes.known.artificer) return;
			var intMod = Number(What('Int Mod'));
			var artLvl = classes.known.artificer.level;
			var artLvl5 = 5 * artLvl;
			HDobj.alt.push(5 + artLvl5);
			HDobj.altStr.push(" = 5 as a base\n + 5 \xD7 " + artLvl + " from five times its creator's artificer level (" + artLvl5 + ")");
		  },
		  setAltHp : true,
		  hpForceRecalc : true
		},
		eval : function(prefix, lvl) {
		  // remove the Deflect Attack (reaction) attack if adding this creature before artificer level 15
		  if (lvl[0] < 15) Value(prefix + "Comp.Use.Attack.2.Weapon Selection", "");
		}
	  }]
	},
	"subclassfeature9" : {
	  name : "Arcane Jolt",
	  source : [["XUA24A", 12]],
	  minlevel : 9,
	  description : function () {
		var descr9 = desc([
		  "Once per turn when my Steel Defender or magic weapon hits a target, I can have it:",
		  " \u2022 Deal an extra +2d6 Force damage to the target",
		  " \u2022 Restore 2d6 HP to another target within 30 ft of the one that was hit"
		]);
		var descr15 = descr9.replace(/2d6/g, '4d6');
		return levels.map(function (n) {
		  return n < 9 ? "" : n < 15 ? descr9 : descr15;
		});
	  }(),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
	  additional : levels.map(function (n) {
		return n < 9 ? "" : (n < 15 ? 2 : 4) + "d6";
	  }),
	  calcChanges : {
		atkAdd : [
		  function (fields, v) {
			if (v.theWea.isMagicWeapon || v.thisWeapon[1]) {
			  fields.Description += (fields.Description ? '; ' : '') + 'Arcane Jolt (' + (classes.known.artificer && classes.known.artificer.level >= 15 ? 4 : 2) + 'd6)';
			}
		  },
		  "Once per turn when I hit with a magic weapon or my Steel Defender hits with its attack, I can use my Arcane Jolt class feature to have the hit either deal extra Force damage or heal somebody within 30 ft of the target hit."
		]
	  }
	},
	"subclassfeature15" : {
	  name : "Improved Defender",
	  source : [["XUA24A", 12]],
	  minlevel : 15,
	  description : desc([
		"My defender's Deflect Attack now deals its attacker 1d4 + my Int mod Force damage",
		"My Arcane Jolt damage/healing increases to 4d6; My steel defender gains +2 AC"
	  ])
	},
  },
});
AddSubClass("artificer", "cartographer", {
  regExpSearch: /^(?=.*cartographer)(?!.*wizard).*$/i,
  subname : "Cartographer",
  fullname : "Cartographer",
  source: [["XUA25EU", 6]],
  spellcastingExtra: ["faerie fire", "guiding bolt", "healing word", "locate object", "mind spike", "clairvoyance", "haste", "freedom of movement", "locate creature", "scrying", "teleportation circle"],
  features: {
    "subclassfeature3": {
      name: "Tool Proficiencies",
      source: [["XUA25EU", 6]],
      minlevel: 3,
      description: " [proficient with Calligrapher's Supplies \u0026 Cartographer's Tools]\n   I can scribe a spell scroll using the PHB (2024) crafting rules in half the normal time.",
	  toolProfs : [["Calligrapher's Supplies", 1], ["Cartographer's Tools", 1]],
    },
    "subclassfeature3.1": {
      name : "Adventurer's Atlas",
	  source : [["XUA25EU", 7]],
	  minlevel : 3,
	  description : desc([
		"When I finish a Long Rest holding Cartographer's Tools \u0026 touching at least 2 creatures (1 of whom can be myself), I can create a number of magical maps for each target, up to a max equal to my Int mod (min 2).",
		"These magical maps are illegible to all others \u0026 last until I die, or until I use this feature again, which causes existing maps to immediately vanish",
		"While carrying the map, a target gains the following benefits:",
		" \u2022 Awareness. Targets add 1d4 to their Initiative rolls.",
		" \u2022 Positioning. Targets know the locations of all other map holders on the same plane of existence. When casting a spell or creating an effect that requires line of sight to a target, the map holder can target another map holder regardless of sight, so long as the other map holder is still within the spell's/effect's range.",
	  ]),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(2, What('Int Mod'));",
    },
	"subclassfeature3.2": {
      name : "Scouting Gadgets",
	  source : [["XUA25EU", 7]],
	  minlevel : 3,
	  description : desc([
		"On my turn \u0026 so long as my Speed isn't 0, I can expend half of my movement to teleport.",
		"I can teleport as such to an unoccupied space I can see within 10 ft.",
		"I can cast Faerie Fire a number of times equal to my Int mod per Long Rest without expeding a spell slot.",
	  ]),
	  extraLimitedFeatures : [{
		name : "Scouting Gadgets: Faerie Fire",
		usages : "Intelligence modifier per ",
		usagescalc : "event.value = Math.max(1, What('Int Mod'));",
		recovery : "long rest",
	  }],
    },
    "subclassfeature5": {
      name : "Portal Jump",
	  source : [["XUA25EU", 7]],
	  minlevel : 5,
	  description : desc([
		"As a Bonus Action, I can teleport up to 60 ft to an unoccupied space I can see.",
		"I can teleport in this manner a number of times equal to my Int mod per Long Rest.",
		"I can teleport in this manner without expending a use if teleporting to within 5 ft of a creature carrying an Adventurer's Atlas map. Doing so destroys that particular map.",
	  ]),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
    },
    "subclassfeature9": {
      name : "Ingenious Movement",
	  source : [["XUA25EU", 7]],
	  minlevel : 9,
	  description : desc([
		"When I use my Flash of Genious, a willing creature of my choice (or myself) can teleport as part of the same Reaction.",
		"The target creature can teleport up to 30 ft to an unoccupied space I can see."
	  ]),
    },
	"subclassfeature15": {
	  name : "Superior Atlas",
	  source : [["XUA25EU", 7]],
	  minlevel : 15,
	  description : desc([
		"My Adventurer's Atlas improves, gaining the following benefits:",
		" \u2022 Safe Haven. When a map holder is reduced to 0 HP but not killd outright, that creature can destory its map. The creature is then teleported to an unoccupied space within 5 feet of myself or another map holder of its choice and is Stable.",
		" \u2022 Unerring Path. Once per Long Rest \u0026 if I am one of the map holders for my Adventurer’s Atlas, I can cast Find the Path without expending a spell slot, without preparing the spell, and without needing spell components.",
		" \u2022 Unshakeable Mind. While at least one Adventurer's Atlas map still exists, I cannot lose Concentration on Artificer spells via taking damage.",
	  ]),
	  extraLimitedFeatures : [{
		name : "Superior Atlas: Unerring Path",
		usages : 1,
		recovery : "long rest",
	  }],
	},
  },
});

// Add options to include aspects from 2019/2020 Artificer for those that need them
AddFeatureChoice(ClassList.artificer.features["tinker's magic"], true, "Tinker's Magic: 2019/2020 Functions Added", {
	name : "Tinker's Magic: 2019/2020 Functions Added",
	extraname : "Artificer 1",
	source : [["MJ:HB", 0], ["E:RLW", 55], ["T", 9]],
	description : desc([
		"As a Magic action, I can alternatively use my Tinker's Magic to give 1 property to a nonmagical Tiny object:",
		" \u2022 Emit light (5-ft radius bright light, equal dim), an odor, or a nonverbal sound",
		" \u2022 Static visual effect on one surface, or emit a 6-second recorded message when tapped",
		"If I instill a property in more objects than I can have active, the oldest loses its property",
		"Each Tiny object I infuse with semi-permanent magic removes a usage from the maximum number of",
		"  items I can temporarily produce via the alternate Magical Tinkering rules.",
	]),
	prereqeval : function (v) { return classes.known.artificer.level >= 1 ? true : "skip"; }
}, "1st-level Artificer Tinker's Magic choice");
AddFeatureChoice(ClassList.artificer.features["magic item savant"], true, "Magic Item Savant: 2019/2020 Functions Added", {
	name : "Magic Item Savant: 2019/2020 Functions Added",
	extraname : "Artificer 14",
	source : [["MJ:HB", 0], ["E:RLW", 58], ["T", 9]],
	description : desc([
		"I additionally ignore all Class, Species, Spell, and Level requirements on attuning to or using a magic item",
	]),
	prereqeval : function (v) { return classes.known.artificer.level >= 14 ? true : "skip"; }
}, "14th-level Artificer Magic Item Savant choice");

// Items
MagicItemsList["boots of the winding path"] = {
  name : "Boots of the Winding Path",
  source : [["XUA25EU", 8], ["XUA24A", 13], ["E:RLW", 62], ["T", 21], ["UA:A2", 9], ["UA:A3", 12]],
  type : "wondrous item",
  rarity : "uncommon",
  description : "While wearing these boots, I can teleport up to 15 ft as a Bonus Action to an unoccupied space I can see, as long as I occupied that space at some point during the current turn.",
  descriptionFull : "While wearing these boots, a creature can take a Bonus Action to teleport up to 15 feet to an unoccupied space the creature can see. The creature must have occupied that space at some point during the current turn.",
  attunement : true,
  action : [["bonus action", ""]]
};
MagicItemsList["helm of awareness"] = {
  name : "Helm of Awareness",
  source : [["XUA25EU", 8], ["XUA24A", 13], ["T", 21], ["UA:SP3", 3]],
  type : "wondrous item",
  rarity : "uncommon",
  description : "While wearing this helmet, I have Advantage on Initiative rolls.",
  descriptionFull : "While wearing this helmet, a creature has Advantage on Initiative rolls.",
  attunement : true,
  advantages : [["Initiative", true]],
};
MagicItemsList["manifold tool"] = {
  name : "Manifold Tool",
  source : [["XUA25EU", 8]],
  type : "wondrous item",
  rarity : "common",
  description : "This tool takes the form of a wrench, screwdriver, or other basic tool. As a Magic action, I can touch the item and transform it into a type of Artisan’s Tools of my choice. Whatever form the tool takes, I have proficiency with it when I use it.",
  descriptionFull : "This tool takes the form of a wrench, screwdriver, or other basic tool. As a Magic action, you can touch the item and transform it into a type of Artisan’s Tools of your choice. Whatever form the tool takes, you have proficiency with it when you use it.",
  attunement : true,
  action : [["action", "Transform Manifold Tool"]],
};
MagicItemsList["mind sharpener ring"] = {
  name : "Mind Sharpener Ring",
  source : [["XUA25EU", 8], ["XUA24A", 13], ["T", 22]],
  type : "ring",
  rarity : "uncommon",
  description : "This ring can send a jolt to refocus my mind. It has 4 charges and regains 1d4 expended charges daily at dawn. As a Reaction when I fail a Constitution saving throw to maintain Concentration on a spell, I can expend 1 charge to succeed instead.",
  descriptionFull : "The ring can send a jolt to the wearer to refocus their mind. The item has 4 charges. When the wearer fails a Constitution saving throw to maintain Concentration on a spell, the wearer can use its reaction to expend 1 of the item's charges to succeed instead. The item regains 1d4 expended charges daily at dawn.",
  action : [["reaction", ""]],
  usages : 4,
  recovery : "dawn",
  additional : "regains 1d4",
};
MagicItemsList["radiant weapon"] = {
  name : "Radiant Weapon",
  nameTest : "Radiant",
  source : [["XUA25EU", 8], ["XUA24A", 13], ["E:RLW", 62], ["T", 22]],
  type : "weapon (any)",
  rarity : "rare",
  description : "This item adds a +1 on its to hit and damage, has 4 charges, and regains 1d4 at dawn. As a Bonus Action, I can have it start/stop shedding light, Bright in 30 ft, Dim in another 30 ft. As a Reaction if hit by an attack, I can use 1 charge to Blind the attacker until the end of its next turn unless it makes a Con 15 save.",
  descriptionFull : "This magic weapon grants a +1 bonus to attack and damage rolls made with it. While holding it, the wielder can take a Bonus Action to cause it to shed Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. The wielder can extinguish the light as a Bonus Action.\n   The weapon has 4 charges. As a Reaction immediately after being hit by an attack, the wielder can expend 1 charge and cause the attacker to be Blinded until the end of the attacker's next turn, unless the attacker succeeds on a DC 15 Constitution saving throw. The weapon regains 1d4 expended charges daily at dawn.",
  attunement : true,
  usages : 4,
  recovery : "dawn",
  additional : "Blind attacker; regains 1d4",
  action : [["bonus action", " (start/stop light)"], ["reaction", " (1 charge; after hit)"]],
  chooseGear : {
	type : "weapon",
	prefixOrSuffix : "suffix",
	descriptionChange : ["replace", "weapon"]
  },
  calcChanges : {
	atkAdd : [
	  function (fields, v) {
		if (!v.theWea.isMagicWeapon && !v.isSpell && (/radiant/i).test(v.WeaponTextName)) {
		  v.theWea.isMagicWeapon = true;
		  fields.Description = fields.Description.replace(/(, |; )?Counts as magical/i, '');
		  fields.Description += (fields.Description ? '; ' : '') + 'Reaction to blind attacker';
		}
	  },
	  'If I include the word "Radiant" in the name of a weapon, it will be treated as the magic weapon Radiant Weapon. It has +1 to hit and damage and can be used to shed light and to Blind an attacker.'
	],
	atkCalc : [
	  function (fields, v, output) {
		if (v.isMeleeWeapon && !v.isSpell && (/radiant/i).test(v.WeaponTextName)) {
		  output.magic = v.thisWeapon[1] + 1;
		}
	  }
	]
  }
};
MagicItemsList["repeating shot"] = {
  name : "Repeating Shot",
  source : [["XUA25EU", 8], ["XUA24A", 14], ["E:RLW", 62], ["T", 22], ["UA:A3", 13]],
  type : "weapon (any with ammunition)",
  rarity : "uncommon",
  description : "When I use this magic weapon to make a ranged attack, it magically produces one piece of ammunition and grants a +1 bonus to its attack and damage rolls. Thus, it doesn't require ammunition and ignores the Loading property if it has it. The produced ammunition vanishes once it hits or misses a target.",
  descriptionFull : "This magic weapon grants a +1 bonus to attack and damage rolls made with it when it's used to make a ranged attack, and it ignores the Loading property if it has it.\n   If you load no ammunition in the weapon, it produces its own, automatically creating one piece of magic ammunition when you make a ranged attack with it. The ammunition created by the weapon vanishes the instant after it hits or misses a target.",
  attunement : true,
  chooseGear : {
	type : "weapon",
	prefixOrSuffix : "suffix",
	descriptionChange : ["replace", "weapon"],
	excludeCheck : function (inObjKey, inObj) {
	  return !(/ammunition/i).test(inObj.description);
	}
  },
  calcChanges : {
	atkAdd : [
	  function (fields, v) {
		if (!v.theWea.isMagicWeapon && !v.isSpell && (/^(?=.*repeating shot)(?=.*ammunition).*$/i).test(v.WeaponText)) {
		  v.theWea.isMagicWeapon = true;
		  fields.Description = fields.Description.replace(/(, |; )?Counts as magical/i, '').replace(/(;|,)? ?loading/i, '');
		}
	  },
	  'If I include the words "Repeating Shot" in the name of a weapon with the ammunition property, it will be treated as the magic weapon Repeating Shot. It has +1 to hit and damage and produces its own ammunition, thus its loading property is removed if it has it.'
	],
	atkCalc : [
	  function (fields, v, output) {
		if ((/^(?=.*repeating shot)(?=.*ammunition).*$/i).test(v.WeaponText) && !v.isSpell) {
		  output.magic = v.thisWeapon[1] + 1;
		}
	  }, ''
	]
  }
};
MagicItemsList["repulsion shield"] = {
  name : "Repulsion Shield",
  source : [["XUA25EU", 9], ["XUA24A", 14], ["E:RLW", 63], ["T", 23]],
  type : "shield",
  rarity : "uncommon",
  description : "I gain an additional +1 bonus to Armor Class while wielding this shield. The shield has 4 charges and regains 1d4 expended charges daily at dawn. As a Reaction immediately after being hit by a melee attack, I can expend 1 charge to push the attacker up to 15 ft away.",
  descriptionFull : "A creature gains a +1 bonus to Armor Class while wielding this shield.\n   The shield has 4 charges. While holding it, the wielder can use a Reaction immediately after being hit by a melee attack to expend 1 of the shield's charges and push the attacker up to 15 feet away. The shield regains 1d4 expended charges daily at dawn.",
  weight : 6,
  attunement : true,
  usages : 4,
  additional : "regains 1d4",
  recovery : "dawn",
  action : [["reaction", " (1 charge)"]],
  shieldAdd : ["Repulsion Shield", 3, 6]
};
MagicItemsList["returning weapon"] = {
  name : "Returning Weapon",
  nameTest : "Returning",
  source : [["XUA25EU", 9], ["XUA24A", 14], ["E:RLW", 63], ["T", 23], ["UA:A3", 14], ["UA:A2", 10]],
  type : "weapon (any thrown)",
  rarity : "uncommon",
  description : "This magic weapon grants a +1 bonus to attack and damage rolls I make with it. It returns to my hand immediately after I use it to make a ranged attack.",
  descriptionFull : "This magic weapon grants a +1 bonus to attack and damage rolls made with it, and it returns to the wielder's hand immediately after it is used to make a ranged attack.",
  chooseGear : {
	type : "weapon",
	prefixOrSuffix : "suffix",
	descriptionChange : ["replace", "weapon"],
	excludeCheck : function (inObjKey, inObj) {
	  return !/\bthrown\b/i.test(inObj.description);
	}
  },
  calcChanges : {
	atkAdd : [
	  function (fields, v) {
		if (!v.theWea.isMagicWeapon && v.isThrownWeapon && /returning/i.test(v.WeaponText)) {
		  v.theWea.isMagicWeapon = true;
		  fields.Description = fields.Description.replace(/(, |; )?Counts as magical/i, '');
		  fields.Description += (fields.Description ? '; ' : '') + 'Returns immediately after ranged attack';
		}
	  },
	  'If I include the word "Returning" in the name of a thrown weapon, it will be treated as the magic weapon Returning Weapon. It has +1 to hit and damage and returns to my hand immediately after I use it to make a ranged attack.'
	],
	atkCalc : [
	  function (fields, v, output) {
		if (v.isThrownWeapon && /returning/i.test(v.WeaponText)) {
		  output.magic = v.thisWeapon[1] + 1;
		}
	  }, ''
	]
  }
};
MagicItemsList["spell-refueling ring"] = {
  name : "Spell-Refueling Ring",
  source : [["XUA25EU", 9], ["XUA24A", 14], ["T", 23]],
  type : "ring",
  rarity : "uncommon",
  description : "As a Bonus Action, I can activate this magic ring to recover one expended spell slot. The recovered slot can be of level 3 or lower. Once used, the ring can't be used again until the next dawn.",
  descriptionFull : "While wearing this ring, the creature can recover one expended spell slot as a Bonus Action. The recovered slot can be of level 3 or lower. Once used, the ring can't be used again until the next dawn.",
  attunement : true,
  action : [["bonus action", ""]],
  usages : 1,
  recovery : "dawn"
};

// Add Enhanced Defense Magic Items; Not a part of the UA, so have "defaultExcluded : true"
MagicItemsList["enhanced defense (armor)"] = {
  name : "Enhanced Defense Armor",
  source : [["MJ:HB", 0], ["E:RLW", 62], ["T", 21]],
  defaultExcluded : true,
  type : "armor",
  rarity : "uncommon",
  description : "I have a bonus to AC while wearing this armor. The bonus increases to +2 when I reach character level 10. Select the bonus using the little square button in this magic item line.",
  descriptionFull : "You have a bonus to AC while wearing this armor. The bonus increases to +2 when you reach character level 10. Select the bonus using the little square button in this magic item line.",
  allowDuplicates : true,
  chooseGear : {
	type : "armor",
	prefixOrSuffix : "brackets",
	descriptionChange : ["prefix", "armor"]
  },
  choices : ["+1 Enhanced Defense (Armor)", "+2 Enhanced Defense (Armor) (Lvl 10+)"],
  "+1 enhanced defense (armor)" : {
	name : "Enhanced Defense Armor +1",
	nameTest : "+1 Enhanced Defense Armor",
	defaultExcluded : true,
	rarity : "uncommon",
	description : "I have a bonus to AC while wearing this armor. The bonus increases to +2 when I reach character level 10. Select the bonus using the little square button in this magic item line.",
	allowDuplicates : true
  },
  "+2 enhanced defense (armor) (lvl 10+)" : {
	name : "Enhanced Defense Armor +2 (Lvl 10+)",
	nameTest : "+2 Enhanced Defense Armor",
	defaultExcluded : true,
	rarity : "rare",
	description : "I have a bonus to AC while wearing this armor. The bonus increases to +2 when I reach character level 10. Select the bonus using the little square button in this magic item line.",
	allowDuplicates : true
  },
};
MagicItemsList["enhanced defense (shield)"] = {
  name : "Enhanced Defense Shield",
  source : [["MJ:HB", 0], ["E:RLW", 62], ["T", 21]],
  defaultExcluded : true,
  type : "shield",
  rarity : "uncommon",
  description : "I have a bonus to AC while wielding this shield. The bonus increases to +2 when I reach character level 10. Select the bonus using the little square button in this magic item line.",
  descriptionFull : "You have a bonus to AC while wielding this shield. The bonus increases to +2 when you reach character level 10. Select the bonus using the little square button in this magic item line.",
  allowDuplicates : true,
  choices : ["+1 Enhanced Defense (Shield)", "+2 Enhanced Defense (Shield) (Lvl 10+)"],
  "+1 enhanced defense (shield)" : {
	name : "Enhanced Defense Shield +1",
	nameTest : "+1 Enhanced Defense Shield",
	defaultExcluded : true,
	rarity : "uncommon",
	description : "I have a bonus to AC while wielding this shield. The bonus increases to +2 when I reach character level 10. Select the bonus using the little square button in this magic item line.",
	allowDuplicates : true
  },
  "+2 enhanced defense (shield) (lvl 10+)" : {
	name : "Enhanced Defense Shield +2 (Lvl 10+)",
	nameTest : "+2 Enhanced Defense Shield",
	defaultExcluded : true,
	rarity : "rare",
	description : "I have a bonus to AC while wielding this shield. The bonus increases to +2 when I reach character level 10. Select the bonus using the little square button in this magic item line.",
	allowDuplicates : true
  },
};

// Set the Artificer infusion list for Replicate Magic Item; Coded by TrackAtNite
function AddArtificerMI() {
    var artMi = [];

    function addToArtMi(itemName, level, choice = null) {
		// if(/glamerweave/i.test(itemName)) console.println("addToArtMi: " + itemName + ", " + level + ", " + choice);
		var key = choice || "default";
		
		if (!artMi[itemName]) artMi[itemName] = {};
	
		// Only add if not already present
		if (!artMi[itemName][key] || artMi[itemName][key][1] > level) {
			artMi[itemName][key] = [itemName, level, choice];
		}
	}

	function getRarityLevel(a, pKey, cKey = null) {
		if (typeof a !== "object") return;
	
		var cE2 = [
			"alchemy jug", "bag of holding", "cap of water breathing",
			"enhanced defense (armor)", "enhanced defense (shield)", "goggles of night",
			"manifold tool", "repeating shot", "returning weapon", "rope of climbing",
			"sending stones", ["shield, +1, +2, or +3", "+1 shield (uncommon)"], "wand of magic detection", "wand of secrets",
			["wand of the war mage", "+1 to spell attacks (uncommon)"], ["weapon, +1, +2, or +3", "+1 weapon (uncommon)"],
			["wraps of unarmed power", "+1 to unarmed attacks (uncommon)"]
		];
	
		var uE6 = [
			["armor, +1, +2, or +3", "+1 ac bonus (rare)"],
			"boots of elvenkind", "boots of the winding path", "cloak of elvenkind",
			"cloak of the manta ray", "eyes of charming", "eyes of minute seeing",
			"gloves of thievery", "lantern of revealing", "mind sharpener", "necklace of adaptation",
			"pipes of haunting", "radiant weapon", "repulsion shield", "ring of swimming",
			"ring of water walking", "sentinel shield", "spell-refueling ring", "wand of magic missiles",
			"wand of web", "weapon of warning"
		];
	
		var uE10 = [
			"armor of resistance", "dagger of venom", "elven chain",
			"enhanced defense (armor)", "enhanced defense (shield)", "ring of feather falling",
			"ring of jumping", "ring of mind shielding", ["shield, +1, +2, or +3", "+2 shield (rare)"],
			["wand of the war mage","+2 to spell attacks (rare)"], ["weapon, +1, +2, or +3", "+2 weapon (rare)"], 
			["wraps of unarmed power", "+2 wraps of unarmed power (rare)"]
		];
	
		var rE14 = [
			["armor, +1, +2, or +3", "+2 ac bonus (very rare)"],
			"arrow-catching shield", "flame tongue", "ring of free action",
			"ring of protection", "ring of the ram"
		];
	
		var pObj = pKey ? MagicItemsList[pKey] : null;
		var pNameLC = (pObj && pObj.name) ? pObj.name.toLowerCase() : "";
		var aNameLC = cKey ? cKey.toLowerCase() : (a.name ? a.name.toLowerCase() : "");
		var typeLC = a.type ? a.type.toLowerCase() : (pObj && pObj.type ? pObj.type.toLowerCase() : "");
		var aRarityLC = a.rarity ? a.rarity.toLowerCase() : (pObj && pObj.rarity ? pObj.rarity.toLowerCase() : "");
	
		// Define ordered rarity list buckets with levels
		var rarityLists = [
			{ list : cE2, level : 2 },
			{ list : uE6, level : 6 },
			{ list : uE10, level : 10 },
			{ list : rE14, level : 14 }
		];
	
		// Unified search loop
		for (var r = 0; r < rarityLists.length; r++) {
			var rar = rarityLists[r];
			var list = rar.list;
			var level = rar.level;
	
			for (var i = 0; i < list.length; i++) {
				var entry = list[i];
	
				if (entry instanceof Array) {
					var entryP = entry[0].toLowerCase();
					var entryC = entry[1].toLowerCase();
					if (entryP === pNameLC && entryC === aNameLC) {
						return [entryP, level, entryC];
					}
				} else {
					var entryLC = entry.toLowerCase();
					if (entryLC === pNameLC || entryLC === aNameLC) {
						return [entryLC, level];
					}
				}
			}
		}

		// Fallback logic
	
		// Common
		if (
			(aRarityLC === "common" && !/potion|scroll/.test(typeLC)) ||
			cE2.indexOf(pNameLC) !== -1 || 
			cE2.indexOf(aNameLC) !== -1
		) {
			return [aNameLC, 2];
		}
		// Uncommon (non-wondrous)
		if (
			(aRarityLC === "uncommon" && !/armor|ring|wand|weapon|wondrous/.test(typeLC)) ||
			uE6.indexOf(pNameLC) !== -1 || 
			uE6.indexOf(aNameLC) !== -1
		) {
			return [aNameLC, 6];
		}
		// Uncommon (wondrous or explicitly listed)
		if (
			(aRarityLC === "uncommon" && typeLC.indexOf("wondrous") !== -1) ||
			uE10.indexOf(pNameLC) !== -1 || 
			uE10.indexOf(aNameLC) !== -1
		) {
			return [aNameLC, 10];
		}
		// Rare
		if (
			(aRarityLC === "rare" && typeLC.indexOf("wondrous") !== -1) ||
			rE14.indexOf(pNameLC) !== -1 || 
			rE14.indexOf(aNameLC) !== -1
		) {
			return [aNameLC, 14];
		}
	
		return null;
	}

    for(var mi in MagicItemsList) {
        var aMI = MagicItemsList[mi];

        if((aMI.type) && ((!aMI.rarity && aMI.choices) || aMI.rarity)) {
            if(!aMI.rarity && aMI.choices) {
                for(var choice of aMI.choices) {
                    var choiceNmLC = choice.toString().toLowerCase();
                    var aMIChoice = aMI[choiceNmLC];
					// if(/glamerweave/i.test(mi)) console.println("Getting Choice Rarities for choice: " + choice + ", choiceNmLC: " + choiceNmLC);
                    var rL = getRarityLevel(aMIChoice, mi, choiceNmLC);
					// if(/glamerweave/i.test(mi)) console.println("rL: " + rL);
					if(!rL || !rL[0] || !rL[1]) continue;

					addToArtMi(mi, rL[1], choiceNmLC);
                }
				continue;
            } else {
                if(aMI.rarity) {
					// if(/glamerweave/i.test(mi)) console.println("Getting Item Rarity for: " + mi);
                    var rL = getRarityLevel(aMI, mi);
					// if(/glamerweave/i.test(mi)) console.println("rL: " + rL);
					if(!rL || !rL[0] || !rL[1]) continue;
                    
					addToArtMi(mi, rL[1]);
                }
            }
        }
    }

    var artObj = ClassList.artificer.features["replicate magic item"];
    if(!artObj.extrachoices) artObj.extrachoices = [];

    for(var itemName in artMi) {
		for(var cKey in artMi[itemName]) {
			var MI = artMi[itemName][cKey];
			var MI0 = MI[0];
			var MI1 = MI[1];
			var MI2 = MI[2];

			// if(/glamerweave/i.test(itemName)) console.println("MI0: " + MI0 + ", MI1: " + MI1 + ", MI2: " + MI2);

			var miObj = MagicItemsList[MI0];
			if(!miObj) continue;

			if(MI2 && miObj[MI2]) {
				miObj = {
					name: miObj[MI2].name ? miObj[MI2].name : (miObj.name + " [" + MI2.capitalize() + "]"),
					rarity: miObj[MI2].rarity ? miObj[MI2].rarity : miObj.rarity,
					source: miObj[MI2].source ? miObj[MI2].source : miObj.source,
					attunement: miObj[MI2].attunement !== undefined ? miObj[MI2].attunement : miObj.attunement
				}
			}

			var theItem = miObj.name + (MI1 ? " (prereq: level " + MI1 + " artificer)" : "");
			var theItemLC = theItem.toLowerCase().trim();

			if(!artObj[theItemLC]) {
				var submenuLabel = "Replicate " + (miObj.rarity ? miObj.rarity : "Unknown") + " Magic Item (prereq: level " + MI1 + " artificer)";
				var submenuRange = getLetterRange(miObj.name.toString(), ["A-F", "G-Q", "R-Z"]);
				
				artObj[theItemLC] = {
					name: miObj.name,
					description: "",
					source: miObj.source,
					magicitemsAdd: [miObj.name],
					additional: miObj.attunement ? "requires attunement" : undefined,
					prereqeval: MI1 && MI1 > 2 ? ClassList.artificer["prereqLvl" + MI1] : undefined,
					submenu: submenuLabel + " [" + submenuRange + "]",
				};
				artObj.extrachoices.push(theItem);
			}
		}
	}
}

// Add "Homunculus Servant" Spell
SpellsList["homunculus servant xua25eu"] = {
  name : "Homunculus Servant (XUA25EU)",
  source : [["XUA25EU", 12]],
  classes : ["artificer"],
  level : 2,
  school : "Conj",
  time : "1 h",
  range : "10 ft",
  rangeMetric : "3 m",
  components : "V,S,M\u2020",
  compMaterial : "a gem or crystal worth 100+ GP, which the spell consumes",
  duration : "Instantaneous",
  description : "Gain a Homunculus Servant; can attack; it can deliver touch spells; can be upcast; see B (100gp cons.)",
  descriptionFull : "You summon a special homunculus in an unoccupied space within range. This creature uses the Homunculus Servant stat block. If you already have a homunculus from this spell, the homunculus is replaced by the new one." + "\n   " + "You determine the homunculus's appearance, such as a mechanical-looking bird; winged vials; or miniature, animate cauldrons." + "\n   " + "Combat. The homunculus is an ally to you and your allies. In combat, it shares your Initiative count, but it takes its turn immediately after yours. It obeys your commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger." + "\n   " + "At Higher Levels. Use the spell slot's level for the spell’s level in the stat block.",
  ritual : true,
};

// Alter existing spells to add them to the Artificer spell list
SpellsList["elementalism"].classes = ["artificer", "druid", "sorcerer", "wizard"];
SpellsList["true strike"].classes = ["artificer", "bard", "sorcerer", "warlock", "wizard"];
SpellsList["arcane vigor"].classes = ["artificer", "sorcerer", "wizard"];
SpellsList["dragon's breath"].classes = ["artificer", "sorcerer", "wizard"];
SpellsList["circle of power"].classes = ["artificer", "cleric", "paladin", "wizard"];

// Add "Homunculus Servant" companion template
CompanionList.homunculusservant_xua25eu = {
  name : "Homunculus Servant",
  nameMenu : "Homunculus Servant (Homunculus Servant XUA25EU spell)",
  nameTooltip : "the Homunculus Servant (XUA25EU) spell",
  nameOrigin : "1st-Level Conjuration [ritual] spell",
  source : [["XUA25EU", 13]],
  action : [["reaction", " command (free)"]],
  includeCheck : function(sCrea, objCrea, iCreaCR) {
	return /^(?=.*homunculus)(?=.*servant).*$/i.test(sCrea);
  },
  notes : [{
	name : "Spell Description",
	description : "You summon a special homunculus in an unoccupied space within range. This creature uses the Homunculus Servant stat block. If you already have a homunculus from this spell, the homunculus is replaced by the new one." + "\n   " + "You determine the homunculus's appearance, such as a mechanical-looking bird; winged vials; or miniature, animate cauldrons.",
	joinString : "\n   "
  }, {
	name : "Combat",
	description : "The homunculus is an ally to you and your allies. In combat, it shares your Initiative count, but it takes its turn immediately after yours. It obeys your commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
	joinString : "\n   "
  }, {
	name : "At Higher Levels",
	description : "Use the spell slot's level for the spell’s level in the stat block." + "\n   " + "The familiar's HP, Skill/Save Bonuses, & Damage change depending on the level the Homunculus Servant (XUA25EU) spell was cast at:" + "\n      " + "- HP total equals 5 + 5 per spell level; the Otherworldly Familiar has a number of Hit Dice [d4s] equal to the spell's level;" + "\n      " + "- The Homunculus Servant adds the spell level to any ability check or saving throw it makes;" + "\n      " + "- Damage equals 1d6 + the spell's level of Force damage.",
	joinString : "\n   "
  }],
};

// Add "Homunculus Servant" creatures, one per level
CreatureList["homunculus servant xua25eu lvl 2"] = {
  name : "2nd-Lvl Homunculus Servant",
  source : [["XUA25EU", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 15,
  hd : [2, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, Fly 30 ft",
  scores : [4, 15, 12, 10, 10, 7],
  saves : [-1, 4, 3, 2, 2, 0],
  skills : {
	"acrobatics" : 4,
	"animal handling" : 2,
	"arcana" : 2,
	"athletics" : -1,
	"deception" : 0,
	"history" : 2,
	"insight" : 2,
	"intimidation" : 0,
	"investigation" : 2,
	"medicine" : 2,
	"nature" : 2,
	"perception" : 2,
	"performance" : 0,
	"persuasion" : 0,
	"religion" : 2,
	"sleight of hand" : 4,
	"stealth" : 4,
	"survival" : 2,
  },
  damage_immunities : "poison",
  condition_immunities : "exhaustion, poisoned",
  passivePerception : 12,
  languages : "Telepathy 1 mile (works only for you), understands the languages of its creator but can't speak",
  challengeRating : "0",
  proficiencyBonus : 3,
  proficiencyBonusLinked : true,
  attacksAction : 1,
  attacks : [{
	name : "Force Strike",
	ability : 4,
	damage : [1, 6, "force"],
	range : "30 ft",
	description : "",
	modifiers : ["", 2],
	abilitytodamage : false,
	useSpellMod : "artificer"
  }],
  features : [{
	name : "Creator",
	description : "The homunculus obeys the commands of its creator and has the same proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take Reactions on its own, but only takes the Dodge action on its turn unless its creator commands it to take another action (no action required by the creator)."
  }],
  traits : [{
	name : "Magic Bond",
	description : "Add the spell level to any ability check or saving throw the homunculus makes."
  }, {
	name : "Evasion",
	description : "If the homunculus is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails. It can't use this trait if it's incapacitated."
  }],
  actions : [{
	name : "Channel Magic",
	description : "As a Reaction, the homunculus delivers a spell cast by its creator that has a range of touch. The homunculus must be within 120 ft of its creator to do so."
  }],
  header : "Construct",
};
CreatureList["homunculus servant xua25eu lvl 3"] = {
  name : "3rd-Lvl Homunculus Servant",
  source : [["XUA25EU", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 20,
  hd : [3, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, Fly 30 ft",
  scores : [4, 15, 12, 10, 10, 7],
  saves : [0, 5, 4, 3, 3, 1],
  skills : {
	"acrobatics" : 5,
	"animal handling" : 3,
	"arcana" : 3,
	"athletics" : 0,
	"deception" : 1,
	"history" : 3,
	"insight" : 3,
	"intimidation" : 1,
	"investigation" : 3,
	"medicine" : 3,
	"nature" : 3,
	"perception" : 3,
	"performance" : 1,
	"persuasion" : 1,
	"religion" : 3,
	"sleight of hand" : 5,
	"stealth" : 5,
	"survival" : 3,
  },
  damage_immunities : "poison",
  condition_immunities : "exhaustion, poisoned",
  passivePerception : 13,
  languages : "Telepathy 1 mile (works only for you), understands the languages of its creator but can't speak",
  challengeRating : "0",
  proficiencyBonus : 4,
  proficiencyBonusLinked : true,
  attacksAction : 1,
  attacks : [{
	name : "Force Strike",
	ability : 4,
	damage : [1, 6, "force"],
	range : "30 ft",
	description : "",
	modifiers : ["", 3],
	abilitytodamage : false,
	useSpellMod : "artificer"
  }],
  features : [{
	name : "Creator",
	description : "The homunculus obeys the commands of its creator and has the same proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take Reactions on its own, but only takes the Dodge action on its turn unless its creator commands it to take another action (no action required by the creator)."
  }],
  traits : [{
	name : "Magic Bond",
	description : "Add the spell level to any ability check or saving throw the homunculus makes."
  }, {
	name : "Evasion",
	description : "If the homunculus is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails. It can't use this trait if it's incapacitated."
  }],
  actions : [{
	name : "Channel Magic",
	description : "As a Reaction, the homunculus delivers a spell cast by its creator that has a range of touch. The homunculus must be within 120 ft of its creator to do so."
  }],
  header : "Construct",
};
CreatureList["homunculus servant xua25eu lvl 4"] = {
  name : "4th-Lvl Homunculus Servant",
  source : [["XUA25EU", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 25,
  hd : [4, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, Fly 30 ft",
  scores : [4, 15, 12, 10, 10, 7],
  saves : [1, 6, 5, 4, 4, 2],
  skills : {
	"acrobatics" : 6,
	"animal handling" : 4,
	"arcana" : 4,
	"athletics" : 1,
	"deception" : 2,
	"history" : 4,
	"insight" : 4,
	"intimidation" : 2,
	"investigation" : 4,
	"medicine" : 4,
	"nature" : 4,
	"perception" : 4,
	"performance" : 2,
	"persuasion" : 2,
	"religion" : 4,
	"sleight of hand" : 6,
	"stealth" : 6,
	"survival" : 4,
  },
  damage_immunities : "poison",
  condition_immunities : "exhaustion, poisoned",
  passivePerception : 14,
  languages : "Telepathy 1 mile (works only for you), understands the languages of its creator but can't speak",
  challengeRating : "0",
  proficiencyBonus : 5,
  proficiencyBonusLinked : true,
  attacksAction : 1,
  attacks : [{
	name : "Force Strike",
	ability : 4,
	damage : [1, 6, "force"],
	range : "30 ft",
	description : "",
	modifiers : ["", 4],
	abilitytodamage : false,
	useSpellMod : "artificer"
  }],
  features : [{
	name : "Creator",
	description : "The homunculus obeys the commands of its creator and has the same proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take Reactions on its own, but only takes the Dodge action on its turn unless its creator commands it to take another action (no action required by the creator)."
  }],
  traits : [{
	name : "Magic Bond",
	description : "Add the spell level to any ability check or saving throw the homunculus makes."
  }, {
	name : "Evasion",
	description : "If the homunculus is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails. It can't use this trait if it's incapacitated."
  }],
  actions : [{
	name : "Channel Magic",
	description : "As a Reaction, the homunculus delivers a spell cast by its creator that has a range of touch. The homunculus must be within 120 ft of its creator to do so."
  }],
  header : "Construct",
};
CreatureList["homunculus servant xua25eu lvl 5"] = {
  name : "5th-Lvl Homunculus Servant",
  source : [["XUA25EU", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 30,
  hd : [5, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, Fly 30 ft",
  scores : [4, 15, 12, 10, 10, 7],
  saves : [2, 7, 6, 5, 5, 3],
  skills : {
	"acrobatics" : 7,
	"animal handling" : 5,
	"arcana" : 5,
	"athletics" : 2,
	"deception" : 3,
	"history" : 5,
	"insight" : 5,
	"intimidation" : 3,
	"investigation" : 5,
	"medicine" : 5,
	"nature" : 5,
	"perception" : 5,
	"performance" : 3,
	"persuasion" : 3,
	"religion" : 5,
	"sleight of hand" : 7,
	"stealth" : 7,
	"survival" : 5,
  },
  damage_immunities : "poison",
  condition_immunities : "exhaustion, poisoned",
  passivePerception : 15,
  languages : "Telepathy 1 mile (works only for you), understands the languages of its creator but can't speak",
  challengeRating : "0",
  proficiencyBonus : 6,
  proficiencyBonusLinked : true,
  attacksAction : 1,
  attacks : [{
	name : "Force Strike",
	ability : 4,
	damage : [1, 6, "force"],
	range : "30 ft",
	description : "",
	modifiers : ["", 5],
	abilitytodamage : false,
	useSpellMod : "artificer"
  }],
  features : [{
	name : "Creator",
	description : "The homunculus obeys the commands of its creator and has the same proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take Reactions on its own, but only takes the Dodge action on its turn unless its creator commands it to take another action (no action required by the creator)."
  }],
  traits : [{
	name : "Magic Bond",
	description : "Add the spell level to any ability check or saving throw the homunculus makes."
  }, {
	name : "Evasion",
	description : "If the homunculus is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails. It can't use this trait if it's incapacitated."
  }],
  actions : [{
	name : "Channel Magic",
	description : "As a Reaction, the homunculus delivers a spell cast by its creator that has a range of touch. The homunculus must be within 120 ft of its creator to do so."
  }],
  header : "Construct",
};
CreatureList["homunculus servant xua25eu lvl 6"] = {
  name : "6th-Lvl Homunculus Servant",
  source : [["XUA25EU", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 35,
  hd : [6, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, Fly 30 ft",
  scores : [4, 15, 12, 10, 10, 7],
  saves : [3, 8, 7, 6, 6, 4],
  skills : {
	"acrobatics" : 8,
	"animal handling" : 6,
	"arcana" : 6,
	"athletics" : 3,
	"deception" : 4,
	"history" : 6,
	"insight" : 6,
	"intimidation" : 4,
	"investigation" : 6,
	"medicine" : 6,
	"nature" : 6,
	"perception" : 6,
	"performance" : 4,
	"persuasion" : 4,
	"religion" : 6,
	"sleight of hand" : 8,
	"stealth" : 8,
	"survival" : 6,
  },
  damage_immunities : "poison",
  condition_immunities : "exhaustion, poisoned",
  passivePerception : 14,
  languages : "Telepathy 1 mile (works only for you), understands the languages of its creator but can't speak",
  challengeRating : "0",
  proficiencyBonus : 6,
  proficiencyBonusLinked : true,
  attacksAction : 1,
  attacks : [{
	name : "Force Strike",
	ability : 4,
	damage : [1, 6, "force"],
	range : "30 ft",
	description : "",
	modifiers : ["", 6],
	abilitytodamage : false,
	useSpellMod : "artificer"
  }],
  features : [{
	name : "Creator",
	description : "The homunculus obeys the commands of its creator and has the same proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take Reactions on its own, but only takes the Dodge action on its turn unless its creator commands it to take another action (no action required by the creator)."
  }],
  traits : [{
	name : "Magic Bond",
	description : "Add the spell level to any ability check or saving throw the homunculus makes."
  }, {
	name : "Evasion",
	description : "If the homunculus is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails. It can't use this trait if it's incapacitated."
  }],
  actions : [{
	name : "Channel Magic",
	description : "As a Reaction, the homunculus delivers a spell cast by its creator that has a range of touch. The homunculus must be within 120 ft of its creator to do so."
  }],
  header : "Construct",
};
CreatureList["homunculus servant xua25eu lvl 7"] = {
  name : "7th-Lvl Homunculus Servant",
  source : [["XUA25EU", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 40,
  hd : [7, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, Fly 30 ft",
  scores : [4, 15, 12, 10, 10, 7],
  saves : [4, 9, 8, 7, 7, 5],
  skills : {
	"acrobatics" : 9,
	"animal handling" : 7,
	"arcana" : 7,
	"athletics" : 4,
	"deception" : 5,
	"history" : 7,
	"insight" : 7,
	"intimidation" : 5,
	"investigation" : 7,
	"medicine" : 7,
	"nature" : 7,
	"perception" : 7,
	"performance" : 5,
	"persuasion" : 5,
	"religion" : 7,
	"sleight of hand" : 9,
	"stealth" : 9,
	"survival" : 7,
  },
  damage_immunities : "poison",
  condition_immunities : "exhaustion, poisoned",
  passivePerception : 14,
  languages : "Telepathy 1 mile (works only for you), understands the languages of its creator but can't speak",
  challengeRating : "0",
  proficiencyBonus : 6,
  proficiencyBonusLinked : true,
  attacksAction : 1,
  attacks : [{
	name : "Force Strike",
	ability : 4,
	damage : [1, 6, "force"],
	range : "30 ft",
	description : "",
	modifiers : ["", 7],
	abilitytodamage : false,
	useSpellMod : "artificer"
  }],
  features : [{
	name : "Creator",
	description : "The homunculus obeys the commands of its creator and has the same proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take Reactions on its own, but only takes the Dodge action on its turn unless its creator commands it to take another action (no action required by the creator)."
  }],
  traits : [{
	name : "Magic Bond",
	description : "Add the spell level to any ability check or saving throw the homunculus makes."
  }, {
	name : "Evasion",
	description : "If the homunculus is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails. It can't use this trait if it's incapacitated."
  }],
  actions : [{
	name : "Channel Magic",
	description : "As a Reaction, the homunculus delivers a spell cast by its creator that has a range of touch. The homunculus must be within 120 ft of its creator to do so."
  }],
  header : "Construct",
};
CreatureList["homunculus servant xua25eu lvl 8"] = {
  name : "8th-Lvl Homunculus Servant",
  source : [["XUA25EU", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 45,
  hd : [8, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, Fly 30 ft",
  scores : [4, 15, 12, 10, 10, 7],
  saves : [5, 10, 9, 8, 8, 6],
  skills : {
	"acrobatics" : 10,
	"animal handling" : 8,
	"arcana" : 8,
	"athletics" : 7,
	"deception" : 6,
	"history" : 8,
	"insight" : 8,
	"intimidation" : 6,
	"investigation" : 8,
	"medicine" : 8,
	"nature" : 8,
	"perception" : 8,
	"performance" : 6,
	"persuasion" : 6,
	"religion" : 8,
	"sleight of hand" : 10,
	"stealth" : 10,
	"survival" : 8,
  },
  damage_immunities : "poison",
  condition_immunities : "exhaustion, poisoned",
  passivePerception : 14,
  languages : "Telepathy 1 mile (works only for you), understands the languages of its creator but can't speak",
  challengeRating : "0",
  proficiencyBonus : 6,
  proficiencyBonusLinked : true,
  attacksAction : 1,
  attacks : [{
	name : "Force Strike",
	ability : 4,
	damage : [1, 6, "force"],
	range : "30 ft",
	description : "",
	modifiers : ["", 8],
	abilitytodamage : false,
	useSpellMod : "artificer"
  }],
  features : [{
	name : "Creator",
	description : "The homunculus obeys the commands of its creator and has the same proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take Reactions on its own, but only takes the Dodge action on its turn unless its creator commands it to take another action (no action required by the creator)."
  }],
  traits : [{
	name : "Magic Bond",
	description : "Add the spell level to any ability check or saving throw the homunculus makes."
  }, {
	name : "Evasion",
	description : "If the homunculus is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails. It can't use this trait if it's incapacitated."
  }],
  actions : [{
	name : "Channel Magic",
	description : "As a Reaction, the homunculus delivers a spell cast by its creator that has a range of touch. The homunculus must be within 120 ft of its creator to do so."
  }],
  header : "Construct",
};
CreatureList["homunculus servant xua25eu lvl 9"] = {
  name : "9th-Lvl Homunculus Servant",
  source : [["XUA25EU", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 50,
  hd : [9, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, Fly 30 ft",
  scores : [4, 15, 12, 10, 10, 7],
  saves : [6, 11, 10, 9, 9, 7],
  skills : {
	"acrobatics" : 11,
	"animal handling" : 9,
	"arcana" : 9,
	"athletics" : 6,
	"deception" : 7,
	"history" : 9,
	"insight" : 9,
	"intimidation" : 7,
	"investigation" : 9,
	"medicine" : 9,
	"nature" : 9,
	"perception" : 9,
	"performance" : 7,
	"persuasion" : 7,
	"religion" : 9,
	"sleight of hand" : 11,
	"stealth" : 11,
	"survival" : 9,
  },
  damage_immunities : "poison",
  condition_immunities : "exhaustion, poisoned",
  passivePerception : 14,
  languages : "Telepathy 1 mile (works only for you), understands the languages of its creator but can't speak",
  challengeRating : "0",
  proficiencyBonus : 6,
  proficiencyBonusLinked : true,
  attacksAction : 1,
  attacks : [{
	name : "Force Strike",
	ability : 4,
	damage : [1, 6, "force"],
	range : "30 ft",
	description : "",
	modifiers : ["", 9],
	abilitytodamage : false,
	useSpellMod : "artificer"
  }],
  features : [{
	name : "Creator",
	description : "The homunculus obeys the commands of its creator and has the same proficiency bonus. It takes its turn immediately after its creator, on the same initiative count. It can move and take Reactions on its own, but only takes the Dodge action on its turn unless its creator commands it to take another action (no action required by the creator)."
  }],
  traits : [{
	name : "Magic Bond",
	description : "Add the spell level to any ability check or saving throw the homunculus makes."
  }, {
	name : "Evasion",
	description : "If the homunculus is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails. It can't use this trait if it's incapacitated."
  }],
  actions : [{
	name : "Channel Magic",
	description : "As a Reaction, the homunculus delivers a spell cast by its creator that has a range of touch. The homunculus must be within 120 ft of its creator to do so."
  }],
  header : "Construct",
};

// Dragonmark Feats
FeatsList["aberrant dragonmark"] = {
  name : "Aberrant Dragonmark",
  source : [["XUA25EU", 9], ["E:RLW", 52]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested an Aberrant Dragonmark; determine its appearance. You gain the following benefits:\n \u2022 Aberrant Fortitude. When you make a Constitution saving throw, you can roll 1d4 and add the number rolled to the save. You can use this benefit a number of times equal to your Proficiency Bonus and regain all expended uses when you finish a Long Rest.\n \u2022 Aberrant Magic. You learn a cantrip of your choice from the Sorcerer spell list. In addition, choose a 1st-level spell from the Sorcerer spell list. You learn that spell and can cast it through your mark. Once you cast it, you must finish a Short or Long Rest before you can cast it again through the mark. Constitution is your spellcasting ability for these spells.\n \u2022 Aberrant Surge. When you cast the 1st-level spell through your mark, you can expend one of your Hit Dice and roll it. If you roll an even number, you gain a number of Temporary Hit Points equal to the number rolled. If you roll an odd number, one random creature within 30 feet of you (not including you) takes Force damage equal to the number rolled. If no other creatures are in range, you take the damage.",
  description : "I can add 1d4 to a Constitution saving throw a number of times equal to my Proficiency Bonus per Long Rest. I learn a Sorcerer cantrip, and a 1st-level Sorcerer spell that I can cast once per Short Rest. They use Con as spellcasting ability. I can expend and roll a HD when I cast the level 1 spell. If even, I gain it in Temp HP. If odd, a random target in 30 ft takes it in force damage.",
  usages : "Proficiency Bonus per",
  usagescalc : "event.value = How('Proficiency Bonus');",
  action : [["reaction", "Aberrant Fortitude (Free Action)"]],
  spellcastingAbility : 3,
  spellcastingBonus : [{
	name : "Sorcerer cantrip",
	'class' : 'sorcerer',
	level : [0, 0],
	firstCol : 'atwill'
  }, {
	name : "Sorcerer 1st-level spell",
	'class' : 'sorcerer',
	level : [1, 1],
	firstCol : 'oncesr'
  }]
};
FeatsList["mark of detection"] = {
  name : "Mark of Detection",
  source : [["XUA25EU", 9], ["E:RLW", 40]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Detection; determine its appearance. You gain the following benefits:\n \u2022 Deductive Intuition. When you make a Wisdom (Insight or Perception) check, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Magical Detection. You always have the Detect Magic \u0026 Detect Poison and Disease spells prepared. You can cast each spell once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this feat).\n When you reach character level 3, you also always have the See Invisibility spell prepared and can cast it the same way.\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Detect Evil and Good, Identify, Detect Thoughts, Find Traps, Clairvoyance, Nondetection, Arcane Eye, Divination, \u0026 Legend Lore.",
  description : "I can add 1d4 to any Wisdom (Insight or Perception) checks. At character level 1, I always have the Detect Magic \u0026 Detect Poison and Disease spells prepared, and can cast each once without a spell slot per Long Rest. I can also cast these spells with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for these spells (chosen when I select this feat). At character level 3, I also always have the See Invisibility spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
	name : "Magical Detection",
	spells : ["detect magic", "detect poison and disease", "see invisibility"],
	selection : ["detect magic", "detect poison and disease", "see invisibility"],
	firstCol : "oncelr",
	times : levels.map(function(n) {return n < 3 ? 2 : 3;}),
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["detect evil and good", "identify", "detect thoughts", "find traps", "clairvoyance", "nondetection", "arcane eye", "divination", "legend lore"]);
	  },
	  "The Mark of Detection Feat adds extra spells to the spell list(s) of my spellcasting class(es): Detect Evil and Good, Detect Poison and Disease, Detect Thoughts, Find Traps, Clairvoyance, Nondetection, Arcane Eye, Divination, and Legend Lore."
	]
  }
};
FeatsList["mark of finding"] = {
  name : "Mark of Finding",
  source : [["XUA25EU", 10], ["E:RLW", 41]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Finding; determine its appearance. You gain the following benefits:\n \u2022 Hunter's Intuition. When you make a Wisdom (Perception or Survival) check, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Finder's Magic. You always have the Hunter's Mark spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast it using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n When you reach character level 3, you also always have the Locate Object spell prepared and can cast it the same way.\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Faerie Fire, Longstrider, Locate Animals or Plants, Mind Spike, Clairvoyance, Speak with Plants, Divination, Locate Creature, \u0026 Commune with Nature.",
  description : "I can add 1d4 to any Wisdom (Perception or Survival) checks. At character level 1, I always have the Hunter's Mark spell prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). At character level 3, I also always have the Locate Object spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
	name : "Finder's Magic",
	spells : ["hunter's mark", "locate object"],
	selection : ["hunter's mark", "locate object"],
	firstCol : "oncelr",
	times : levels.map(function(n) {return n < 3 ? 1 : 2;}),
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["faerie fire", "longstrider", "locate animals or plants", "mind spike", "clairvoyance", "speak with plants", "divination", "locate creature", "commune with nature"]);
	  },
	  "The Mark of Finding Feat adds extra spells to the spell list(s) of my spellcasting class(es): Faerie Fire, Longstrider, Locate Animals or Plants, Mind Spike, Clairvoyance, Speak with Plants, Divination, Locate Creature, \u0026 Commune with Nature."
	]
  }
};
FeatsList["mark of handling"] = {
  name : "Mark of Handling",
  source : [["XUA25EU", 10], ["E:RLW", 42]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Handling; determine its appearance. You gain the following benefits:\n \u2022 Wild Intuition. When you make an Intelligence (Nature) or Wisdom (Animal Handling) check, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Finder's Magic. You always have the Animal Friendship \u0026 Speak with Animals spells prepared. You can cast each once without a spell slot, and you regain the ability to cast them in that way when you finish a Long Rest. You can also cast these using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n \u2022 Spells of the Mark. When you reach character level 3, you can target a Monstrosity when you cast Animal Friendship or Speak with Animals if the creature's Intelligence score is 3 or lower.\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Command, Find Familiar, Beast Sense, Calm Emotions, Beacon of Hope, Conjure Animals, Aura of Life, Dominate Beast, \u0026 Awaken.",
  description : "I can add 1d4 to any Intelligence (Nature) or Wisdom (Animal Handling) checks. At character level 1, I always have the Animal Friendship \u0026 Speak with Animals spells prepared, and can cast each once without a spell slot per Long Rest. I can also cast these with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). At character level 3, I can target a Monstrosity when I cast Animal Friendship or Speak with Animals if the creature's Intelligence score is 3 or lower. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
	name : "Primal Connection",
	spells : ["animal friendship", "speak with animals"],
	selection : ["animal friendship", "speak with animals"],
	firstCol : "oncelr",
	times : 2,
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["command", "find familiar", "beast sense", "calm emotions", "beacon of hope", "conjure animals", "aura of life", "dominate beast", "awaken"]);
	  },
	  "The Mark of Handling Feat adds extra spells to the spell list(s) of my spellcasting class(es): Command, Find Familiar, Beast Sense, Calm Emotions, Beacon of Hope, Conjure Animals, Aura of Life, Dominate Beast, \u0026 Awaken."
	]
  },
  spellChanges : {
	"animal friendship" : {
	  description : "1+1/SL Beasts/Monstrosities Int<4 save or Charmed for the duration",
	  changes : "At character level 3, I can target a Monstrosity when I cast Animal Friendship if the creature's Intelligence score is 3 or lower.",
	},
	"speak with animals" : {
	  description : "Speak verbally with Beasts/Monst (see B.) for duration; interaction limited by Int of creature",
	  changes : "At character level 3, I can target a Monstrosity when I cast Speak with Animals if the creature's Intelligence score is 3 or lower.",
	},
  },
};
FeatsList["mark of healing"] = {
  name : "Mark of Healing",
  source : [["XUA25EU", 10], ["E:RLW", 43]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Healing; determine its appearance. You gain the following benefits:\n \u2022 Medical Intuition. When you make an Intelligence (Herbalism Kit) or Wisdom (Medicine) check, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Healing Touch. You always have the Cure Wounds spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast it using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n When you reach character level 3, you also always have the Lesser Restoration spell prepared and can cast it the same way.\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: False Life, Healing Word, Arcane Vigor, Prayer of Healing, Aura of Vitality, Mass Healing Word, Aura of Life, Aura of Purity, \u0026 Greater Restoration.",
  description : "I can add 1d4 to any Intelligence (Herbalism Kit) or Wisdom (Medicine) checks. At character level 1, I always have the Cure Wounds spell prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). At character level 3, I also always have the Lesser Restoration spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
	name : "Finder's Magic",
	spells : ["cure wounds", "lesser restoration"],
	selection : ["cure wounds", "lesser restoration"],
	firstCol : "oncelr",
	times : levels.map(function(n) {return n < 3 ? 1 : 2;}),
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["false life", "healing word", "arcane vigor", "prayer of healing", "aura of vatality", "mass healing word", "aura of life", "aura of purity", "greater restoration"]);
	  },
	  "The Mark of Healing Feat adds extra spells to the spell list(s) of my spellcasting class(es): False Life, Healing Word, Arcane Vigor, Prayer of Healing, Aura of Vitality, Mass Healing Word, Aura of Life, Aura of Purity, \u0026 Greater Restoration."
	]
  }
};
FeatsList["mark of hospitality"] = {
  name : "Mark of Hospitality",
  source : [["XUA25EU", 10], ["E:RLW", 44]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Hospitality; determine its appearance. You gain the following benefits:\n \u2022 Ever Hospitable. When you make a Charisma (Persuasion) check or an ability check using Brewer's Supplies or Cook's Utensils, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Innkeeper's Magic. You know the Prestidigitation cantrip and you always have the Purify Food and Drink \u0026 Unseen Servant spells prepared. You can cast each once without a spell slot, and you regain the ability to cast these in that way when you finish a Long Rest. You can also cast these using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Goodberry, Sleep, Aid, Calm Emotions, Create Food and Water, Leomund's Tiny Hut, Aura of Purity, Mordenkainen's Private Sanctum, \u0026 Hallow.",
  description : "I can add 1d4 to any Charisma (Persuasion) checks or any ability checks using Brewer's Supplies or Cook's Utensils. I know the Prestidigitation cantrip and always have the Purify Food and Drink \u0026 Unseen Servant spells prepared, and can cast each once without a spell slot per Long Rest. I can also cast these with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for these spells (chosen when I select this feat). Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
    name : "Innkeeper's Magic Cantrip",
	spells : ["prestidigitation"],
	selection : ["prestidigitation"],
	times : 1,
  }, {
	name : "Innkeeper's Magic Spells",
	spells : ["purify food and drink", "unseen servant"],
	selection : ["purify food and drink", "unseen servant"],
	firstCol : "oncelr",
	times : 2,
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["goodberry", "sleep", "aid", "calm emotions", "create food and water", "leomund's tiny hut", "aura of purity", "mordenkainen's private sanctum", "hallow"]);
	  },
	  "The Mark of Hospitality Feat adds extra spells to the spell list(s) of my spellcasting class(es): Goodberry, Sleep, Aid, Calm Emotions, Create Food and Water, Leomund's Tiny Hut, Aura of Purity, Mordenkainen's Private Sanctum, \u0026 Hallow."
	]
  }
};
FeatsList["mark of making"] = {
  name : "Mark of Making",
  source : [["XUA25EU", 11], ["E:RLW", 45]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Making; determine its appearance. You gain the following benefits:\n \u2022 Artisan's Intuition. When you make an Intelligence (Arcana) check or an ability check using Artisan's Tools, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Spellsmith. You know the Mending cantrip and you always have the Magic Weapon spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast it using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Identify, Tenser's Floating Disk, Continual Flame, Spiritual Weapon, Conjure Barrage, Elemental Weapon, Fabricate, Stone Shape, \u0026 Creation.",
  description : "I can add 1d4 to any Intelligence (Arcana) checks or any ability checks using Artisan's Tools. I know the Mending cantrip and always have the Magic Weapon spell prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
    name : "Spellsmith Cantrip",
	spells : ["mending"],
	selection : ["mending"],
	times : 1,
  }, {
	name : "Spellsmith Spell",
	spells : ["magic weapon"],
	selection : ["magic weapon"],
	firstCol : "oncelr",
	times : 1,
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["identify", "tenser's floating disk", "continual flame", "spiritual weapon", "conjure barrage", "elemental weapon", "fabricate", "stone shape", "creation"]);
	  },
	  "The Mark of Finding Feat adds extra spells to the spell list(s) of my spellcasting class(es): Identify, Tenser's Floating Disk, Continual Flame, Spiritual Weapon, Conjure Barrage, Elemental Weapon, Fabricate, Stone Shape, \u0026 Creation."
	]
  }
};
FeatsList["mark of passage"] = {
  name : "Mark of Passage",
  source : [["XUA25EU", 11], ["E:RLW", 46]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Passage; determine its appearance. You gain the following benefits:\n \u2022 Courier's Speed. Your Speed increases by 5 ft. \n \u2022 Intuitive Motion. When you make a Strength (Althetics) or Dexterity (Acrobatics) check, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Magical Passage. You always have the Misty Step spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast it using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Expeditious Retreat, Jump, Pass without Trace, Find Steed, Blink, Phantom Steed, Dimension Door, Freedom of Movement, \u0026 Teleportation Circle.",
  description : "My Speed increases by 5 ft. I can add 1d4 to any Strength (Althetics) or Dexterity (Acrobatics) checks. At character level 1, I always have the Hunter's Mark spell prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). At character level 3, I also always have the Locate Object spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  speed : { allModes : { bonus : "+5" } },
  spellcastingBonus : [{
	name : "Magical Passage",
	spells : ["misty step"],
	selection : ["misty step"],
	firstCol : "oncelr",
	times : 1,
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["expeditious retreat", "jump", "pass without trace", "find steed", "blink", "phantom steed", "dimension door", "freedom of movement", "teleportation circle"]);
	  },
	  "The Mark of Passage Feat adds extra spells to the spell list(s) of my spellcasting class(es): Expeditious Retreat, Jump, Pass without Trace, Find Steed, Blink, Phantom Steed, Dimension Door, Freedom of Movement, \u0026 Teleportation Circle."
	]
  }
};
FeatsList["mark of scribing"] = {
  name : "Mark of Scribing",
  source : [["XUA25EU", 11], ["E:RLW", 47]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Scribing; determine its appearance. You gain the following benefits:\n \u2022 Gifted Scribe. When you make an Intelligence (History) check or an ability check using Calligrapher's Supplies, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Scribe's Insight. You know the Message cantrip and you always have the Comprehend Languages spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast it using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n When you reach character level 3, you also always have the Magic Mouth spell prepared and can cast it the same way.\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Command, Illusory Script, Animal Messenger, Silence, Sending, Tongues, Arcane Eye, Confusion, \u0026 Dream.",
  description : "I can add 1d4 to any an Intelligence (History) checks or any ability checks using Calligrapher's Supplies. At character level 1, I know the Message cantrip and always have the Comprehend Languages spell prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). At character level 3, I also always have the Magic Mouth spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
    name : "Scribe's Insight Cantrip",
	spells : ["message"],
	selection : ["message"],
	times : 1,
  }, {
	name : "Scribe's Insight Spells",
	spells : ["comprehend languages", "magic mouth"],
	selection : ["comprehend languages", "magic mouth"],
	firstCol : "oncelr",
	times : levels.map(function(n) {return n < 3 ? 1 : 2;}),
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["faerie fire", "longstrider", "locate animals or plants", "mind spike", "clairvoyance", "speak with plants", "divination", "locate creature", "commune with nature"]);
	  },
	  "The Mark of Scribing Feat adds extra spells to the spell list(s) of my spellcasting class(es): Command, Illusory Script, Animal Messenger, Silence, Sending, Tongues, Arcane Eye, Confusion, \u0026 Dream."
	]
  }
};
FeatsList["mark of sentinel"] = {
  name : "Mark of Sentinel",
  source : [["XUA25EU", 12], ["E:RLW", 48]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Sentinel; determine its appearance. You gain the following benefits:\n \u2022 Sentinel's Intuition. When you make a Wisdom (Insight or Perception) check, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Guardian's Shield. You always have the Shield spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast it using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n \u2022 Vigilant Guardian. When a creature you can see within 5 feet of you is hit by an attack roll, you can take a Reaction to swap places with that creature, and you are hit by the attack instead. Once you use this feature, you can't do so again until you finish a Long Rest.\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Compelled Duel, Shield of Faith, Warding Bond, Zone of Truth, Counterspell, Protection from Energy, Death Ward, Guardian of Faith, \u0026 Bigby's Hand.",
  description : "I can add 1d4 to any Wisdom (Insight or Perception) checks. At character level 1, I always have the Hunter's Mark spell prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). At character level 3, I also always have the Locate Object spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
	name : "Guardian's Shield",
	spells : ["shield"],
	selection : ["shield"],
	firstCol : "oncelr",
	times : 1,
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["compelled duel", "shield of faith", "warding bond", "zone of truth", "counterspell", "protection from energy", "death ward", "guardian of faith", "bigby's hand"]);
	  },
	  "The Mark of Sentinel Feat adds extra spells to the spell list(s) of my spellcasting class(es): Compelled Duel, Shield of Faith, Warding Bond, Zone of Truth, Counterspell, Protection from Energy, Death Ward, Guardian of Faith, \u0026 Bigby's Hand."
	]
  }
};
FeatsList["mark of shadow"] = {
  name : "Mark of Shadow",
  source : [["XUA25EU", 12], ["E:RLW", 49]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Shadow; determine its appearance. You gain the following benefits:\n \u2022 Cunning Intuition. When you make a Dexterity (Stealth) or Charisma (Performance) check, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Shape Shadows. You know the Minor Illusion cantrip and you always have the Invisibility spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast it using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Disguise Self, Silent Image, Darkness, Pass without Trace, Clairvoyance, Major Image, Greater Invisibility, Hallucinatory Terrain, \u0026 Mislead.",
  description : "I can add 1d4 to any Dexterity (Stealth) or Charisma (Performance) checks. At character level 1, I always have the Hunter's Mark spell prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). At character level 3, I also always have the Locate Object spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
    name : "Shape Shadows Cantrip",
	spells : ["minor illusion"],
	selection : ["minor illusion"],
	times : 1,
  }, {
	name : "Shape Shadows Spell",
	spells : ["invisibility"],
	selection : ["invisibility"],
	firstCol : "oncelr",
	times : 1,
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["disguise self", "silent image", "darkness", "pass without trace", "clairvoyance", "major image", "greater invisibility", "hallucinatory terrain", "mislead"]);
	  },
	  "The Mark of Shadow Feat adds extra spells to the spell list(s) of my spellcasting class(es): Disguise Self, Silent Image, Darkness, Pass without Trace, Clairvoyance, Major Image, Greater Invisibility, Hallucinatory Terrain, \u0026 Mislead."
	]
  }
};
FeatsList["mark of storm"] = {
  name : "Mark of Storm",
  source : [["XUA25EU", 12], ["E:RLW", 50]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Storm; determine its appearance. You gain the following benefits:\n \u2022 Windwright's Intuition. When you make a Dexterity (Acrobatics) check or an ability check using Navigator's Tools, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Storm's Boon. You have Resistance to Lightning damage.\n \u2022 Storm Magic. You know the Thunderclap cantrip and you always have the Gust of Wind spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast it using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat).\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Feather Fall, Fog Cloud, Levitate, Shatter, Sleet Storm, Wind Wall, Conjure Minor Elemental, Control Water, \u0026 Conjure Elemental.",
  description : "I can add 1d4 to any Dexterity (Acrobatics) check or any ability checks using Navigator's Tools. I am Resistant to Lightning dmg. At character level 1, I always have the Hunter's Mark spell prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). At character level 3, I also always have the Locate Object spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  dmgres : ["Lightning"],
  spellcastingBonus : [{
    name : "Storm Magic Cantrip",
	spells : ["thunderclap"],
	selection : ["thunderclap"],
	times : 1,
  }, {
	name : "Storm Magic Spell",
	spells : ["gust of wind"],
	selection : ["gust of wind"],
	firstCol : "oncelr",
	times : 1,
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["feather fall", "fog cloud", "levitate", "shatter", "sleet storm", "wind wall", "conjure minor elemental", "control water", "conjure elemental"]);
	  },
	  "The Mark of Storm Feat adds extra spells to the spell list(s) of my spellcasting class(es): Feather Fall, Fog Cloud, Levitate, Shatter, Sleet Storm, Wind Wall, Conjure Minor Elemental, Control Water, \u0026 Conjure Elemental."
	]
  }
};
FeatsList["mark of warding"] = {
  name : "Mark of Warding",
  source : [["XUA25EU", 13], ["E:RLW", 51]],
  prerequisite : "Eberron Campaign Setting, No other Dragonmark",
  prereqeval : function(v) { return !(/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You have manifested a Dragonmark of Warding; determine its appearance. You gain the following benefits:\n \u2022 Warder's Intuition. When you make an Intelligence (Investigation) check or an ability check using Thieves' Tools, you can roll 1d4 and add the number rolled to the ability check.\n \u2022 Wards and Seals. You always have the Alarm and Mage Armor spells prepared. You can cast each once without a spell slot, and you regain the ability to cast these in that way when you finish a Long Rest. You can also cast these using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this feat).\n When you reach character level 3, you also always have the Arcane Lock spell prepared and can cast it the same way.\n \u2022 Spells of the Mark. If you have the Spellcasting or Pact Magic feature, the following spells are added to that feature's spell list: Armor of Agathys, Sanctuary, Knock, Nystul's Magic Aura, Glyph of Warding, Magic Circle, Leomund's Secret Chest, Mordenkainen's Faithful Hound, \u0026 Antilife Shell.",
  description : "I can add 1d4 to any Intelligence (Investigation) checks or any ability checks using Thieves' Tools. At character level 1, I always have the Alarm and Mage Armor spells prepared, and can cast each once without a spell slot per Long Rest. I can also cast these with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for these spells (chosen when I select this feat). At character level 3, I also always have the Arcane Lock spell prepared and can cast it the same way. Additionally, if I am a spellcasting class/subclass, I gain additional spells I can cast.",
  spellcastingBonus : [{
	name : "Wards and Seals",
	spells : ["alarm", "mage armor", "arcane lock"],
	selection : ["alarm", "mage armor", "arcane lock"],
	firstCol : "oncelr",
	times : levels.map(function(n) {return n < 3 ? 2 : 3;}),
	spellcastingAbility : [4, 5, 6],
  }],
  calcChanges : {
	spellList : [
	  function(spList, spName, spType) {
		// don't add if this is not a class or a list of spells is already given
		if (!ClassList[spName] || spList.spells || spList.psionic) return;
		// if this is an 'extra spell', also test if it uses the class' spell list or not
		if (spType.indexOf("bonus") !== -1 && (spList.school || !spList["class"] || (spList["class"].indexOf(spName) === -1 && spName !== "fighter"))) return;
		spList.extraspells = spList.extraspells.concat(["armor of agathys", "sanctuary", "knock", "nystul's magic aura", "glyph of warding", "magic circle", "leomund's secret chest", "mordenkainen's faithful hound", "antilife shell"]);
	  },
	  "The Mark of Warding Feat adds extra spells to the spell list(s) of my spellcasting class(es): Armor of Agathys, Sanctuary, Knock, Nystul's Magic Aura, Glyph of Warding, Magic Circle, Leomund's Secret Chest, Mordenkainen's Faithful Hound, \u0026 Antilife Shell."
	]
  }
};

// General Feats
FeatsList["greater aberrant mark"] = {
  name : "Greater Aberrant Mark",
  source : [["XUA25EU", 13]],
  prerequisite : "Character Level 4+, Aberrant Dragonmark Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/aberrant dragonmark/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase your Constitution score by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Aberrant Fortitude benefit of your Aberrant Dragonmark feat, you can roll 1d6 instead of 1d4.\n \u2022 Mark of Inspiration. When you cast a cantrip, you can expend one of your Hit Point Dice and roll it. You gain a number of Temporary Hit Points equal to the number rolled, and one creature of your choice within 30 feet of you (not including you) takes Force damage equal to the number rolled.\n You can use this benefit a number of times equal to your Constitution modifier (minimum of once), and you regain all expended uses when you finish a Long Rest.",
  description : "My Con score increases by 1, to a max of 20. When I use the Aberrant Fortitude benefit of my Aberrant Dragonmark feat, I can roll 1d6 instead of 1d4. Con mod per Long Rest when I cast a cantrip, I can use one of my HP Dice, gaining Temp HP equal to the number rolled. Additionally, 1 creature of my choice in 30 ft takes the rolled number in Force damage.",
  scores : [0, 0, 1, 0, 0, 0],
  extraLimitedFeatures : [{
	name : "Mark of Inspiration",
	usages : "Constitution modifier per",
	usagescalc : "event.value = Math.max(2, What('Con Mod'));",
	recovery : "long rest",
  }],
};
FeatsList["greater mark of detection"] = {
  name : "Greater Mark of Detection",
  source : [["XUA25EU", 13]],
  prerequisite : "Character Level 4+, Mark of Detection Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of detection/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Deductive Intuition benefit of your Mark of Detection feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Detection. When you cast See Invisibliity, you can modify it so that for the duration of the spell, you have Advantage on Initiative rolls and enemies that roll Initiative within 30 feet of you can't gain Advantage on the roll. Once you modify the spell with this benefit, you can't do so again until you finish a Long Rest.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Deductive Intuition benefit of my Mark of Detection feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify See Invisibility such that for the duration, I have Adv. on Initiative rolls /u0026 enemies that roll Initiative within 30 ft can't gain Adv. on the roll.",
  extraLimitedFeatures : [{
	name : " Improved Detection",
	usages : 1,
	recovery : "long rest",
  }],
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Deductive Intuition benefit of my Mark of Detection feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify See Invisibility such that for the duration, I have Adv. on Initiative rolls /u0026 enemies that roll Initiative within 30 ft can't gain Adv. on the roll. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Deductive Intuition benefit of my Mark of Detection feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify See Invisibility such that for the duration, I have Adv. on Initiative rolls /u0026 enemies that roll Initiative within 30 ft can't gain Adv. on the roll. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Deductive Intuition benefit of my Mark of Detection feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify See Invisibility such that for the duration, I have Adv. on Initiative rolls /u0026 enemies that roll Initiative within 30 ft can't gain Adv. on the roll. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Deductive Intuition benefit of my Mark of Detection feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify See Invisibility such that for the duration, I have Adv. on Initiative rolls /u0026 enemies that roll Initiative within 30 ft can't gain Adv. on the roll. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Deductive Intuition benefit of my Mark of Detection feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify See Invisibility such that for the duration, I have Adv. on Initiative rolls /u0026 enemies that roll Initiative within 30 ft can't gain Adv. on the roll. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Deductive Intuition benefit of my Mark of Detection feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify See Invisibility such that for the duration, I have Adv. on Initiative rolls /u0026 enemies that roll Initiative within 30 ft can't gain Adv. on the roll. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["Greater mark of finding"] = {
  name : "Greater Mark of Finding",
  source : [["XUA25EU", 13]],
  prerequisite : "Character Level 4+, Mark of Finding Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of finding/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Hunter's Intuition benefit of your Mark of Finding feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Finding. When you cast Hunter's Mark, you can modify it so that the target can't benefit from the Invisible condition for the duration of the spell. Once you modify the spell with this benefit, you can't do so again until you finish a Long Rest.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Hunter's Intuition benefit of my Mark of Finding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Hunter's Mark such that for the duration, the target can't benefit from the Invisible condition.",
  extraLimitedFeatures : [{
	name : " Improved Finding",
	usages : 1,
	recovery : "long rest",
  }],
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Hunter's Intuition benefit of my Mark of Finding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Hunter's Mark such that for the duration, the target can't benefit from the Invisible condition. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Hunter's Intuition benefit of my Mark of Finding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Hunter's Mark such that for the duration, the target can't benefit from the Invisible condition. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Hunter's Intuition benefit of my Mark of Finding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Hunter's Mark such that for the duration, the target can't benefit from the Invisible condition. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Hunter's Intuition benefit of my Mark of Finding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Hunter's Mark such that for the duration, the target can't benefit from the Invisible condition. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Hunter's Intuition benefit of my Mark of Finding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Hunter's Mark such that for the duration, the target can't benefit from the Invisible condition. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Hunter's Intuition benefit of my Mark of Finding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Hunter's Mark such that for the duration, the target can't benefit from the Invisible condition. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of handling"] = {
  name : "Greater Mark of Handling",
  source : [["XUA25EU", 13]],
  prerequisite : "Character Level 4+, Mark of Handling Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of handling/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Wild Intuition benefit of your Mark of Handling feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Handling. While mounted, immediately after you hit a target within 5 feet of your mount with a melee attack roll, your mount can take a Reaction to move up to its Speed or take the Attack action to make one attack only (your choice).",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Wild Intuition benefit of my Mark of Handling feat, I can roll 1d6 instead of 1d4. While mounted, immediately after I hit a target within 5 feet of my mount with a melee attack roll, my mount can take a Reaction to move up to its Speed or take the Attack action to make one attack only (my choice).",
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Wild Intuition benefit of my Mark of Handling feat, I can roll 1d6 instead of 1d4. While mounted, immediately after I hit a target within 5 feet of my mount with a melee attack roll, my mount can take a Reaction to move up to its Speed or take the Attack action to make one attack only (my choice). [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Wild Intuition benefit of my Mark of Handling feat, I can roll 1d6 instead of 1d4. While mounted, immediately after I hit a target within 5 feet of my mount with a melee attack roll, my mount can take a Reaction to move up to its Speed or take the Attack action to make one attack only (my choice). [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Wild Intuition benefit of my Mark of Handling feat, I can roll 1d6 instead of 1d4. While mounted, immediately after I hit a target within 5 feet of my mount with a melee attack roll, my mount can take a Reaction to move up to its Speed or take the Attack action to make one attack only (my choice). [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Wild Intuition benefit of my Mark of Handling feat, I can roll 1d6 instead of 1d4. While mounted, immediately after I hit a target within 5 feet of my mount with a melee attack roll, my mount can take a Reaction to move up to its Speed or take the Attack action to make one attack only (my choice). [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Wild Intuition benefit of my Mark of Handling feat, I can roll 1d6 instead of 1d4. While mounted, immediately after I hit a target within 5 feet of my mount with a melee attack roll, my mount can take a Reaction to move up to its Speed or take the Attack action to make one attack only (my choice). [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Wild Intuition benefit of my Mark of Handling feat, I can roll 1d6 instead of 1d4. While mounted, immediately after I hit a target within 5 feet of my mount with a melee attack roll, my mount can take a Reaction to move up to its Speed or take the Attack action to make one attack only (my choice). [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of healing"] = {
  name : "Greater Mark of Healing",
  source : [["XUA25EU", 14]],
  prerequisite : "Character Level 4+, Mark of Healing Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of healing/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Medical Intuition benefit of your Mark of Healing feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Healing. When you cast Cure Wounds and roll dice to determine the number of Hit Points restored, you can treat any 1 or 2 on a roll as a 3.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Medical Intuition benefit of my Mark of Healing feat, I can roll 1d6 instead of 1d4. When I cast Cure Wounds /u0026 roll dice to determine the number of HP restored, I can treat any 1 or 2 on a roll as a 3.",
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Medical Intuition benefit of my Mark of Healing feat, I can roll 1d6 instead of 1d4. When I cast Cure Wounds /u0026 roll dice to determine the number of HP restored, I can treat any 1 or 2 on a roll as a 3. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Medical Intuition benefit of my Mark of Healing feat, I can roll 1d6 instead of 1d4. When I cast Cure Wounds /u0026 roll dice to determine the number of HP restored, I can treat any 1 or 2 on a roll as a 3. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Medical Intuition benefit of my Mark of Healing feat, I can roll 1d6 instead of 1d4. When I cast Cure Wounds /u0026 roll dice to determine the number of HP restored, I can treat any 1 or 2 on a roll as a 3. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Medical Intuition benefit of my Mark of Healing feat, I can roll 1d6 instead of 1d4. When I cast Cure Wounds /u0026 roll dice to determine the number of HP restored, I can treat any 1 or 2 on a roll as a 3. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Medical Intuition benefit of my Mark of Healing feat, I can roll 1d6 instead of 1d4. When I cast Cure Wounds /u0026 roll dice to determine the number of HP restored, I can treat any 1 or 2 on a roll as a 3. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Medical Intuition benefit of my Mark of Healing feat, I can roll 1d6 instead of 1d4. When I cast Cure Wounds /u0026 roll dice to determine the number of HP restored, I can treat any 1 or 2 on a roll as a 3. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of hospitality"] = {
  name : "Greater Mark of Hospitality",
  source : [["XUA25EU", 14]],
  prerequisite : "Character Level 4+, Mark of Hospitality Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of hospitality/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Ever Hospitable benefit of your Mark of Hospitality feat, you can roll 1d6 instead of 1d4.\n \u2022 Inspired Hospitality. When you cast Purify Food and Drink, you can modify the spell so that each creature of your choice within 30 feet of you is magically refreshed. Each affected creature's Exhaustion level is reduced by 1, and the creature gains Temporary Hit Points equal to your Proficiency Bonus plus your Intelligence, Charisma, or Wisdom modifier (choose when you select this feat). Once you modify the spell with this benefit, you can't do so again until you finish a Long Rest.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Int, Wis, or Cha mod (choose when I select this Feat).",
  extraLimitedFeatures : [{
	name : " Inspired Hospitality",
	usages : 1,
	recovery : "long rest",
  }],
  choices : ["ASI Str, Temp HP Int", "ASI Str, Temp HP Wis", "ASI Str, Temp HP Cha", "ASI Dex, Temp HP Int", "ASI Dex, Temp HP Wis", "ASI Dex, Temp HP Cha", "ASI Con, Temp HP Int", "ASI Con, Temp HP Wis", "ASI Con, Temp HP Cha", "ASI Int, Temp HP Int", "ASI Int, Temp HP Wis", "ASI Int, Temp HP Cha", "ASI Wis, Temp HP Int", "ASI Wis, Temp HP Wis", "ASI Wis, Temp HP Cha", "ASI Cha, Temp HP Int", "ASI Cha, Temp HP Wis", "ASI Cha, Temp HP Cha"],
  "asi str, temp hp int" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Int mod. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "asi str, temp hp wis" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Wis mod. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "asi str, temp hp cha" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Cha mod. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "asi dex, temp hp int" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Int mod. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "asi dex, temp hp wis" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Wis mod. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "asi dex, temp hp cha" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Cha mod. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "asi con, temp hp int" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Int mod. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "asi con, temp hp wis" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Wis mod. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "asi con, temp hp cha" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Cha mod. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "asi int, temp hp int" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Int mod. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "asi int, temp hp wis" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Wis mod. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "asi int, temp hp cha" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Cha mod. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "asi wis, temp hp int" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Int mod. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "asi wis, temp hp wis" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Wis mod. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "asi wis, temp hp cha" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Cha mod. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "asi cha, temp hp int" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Int mod. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  },
  "asi cha, temp hp wis" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Wis mod. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  },
  "asi cha, temp hp cha" : {
	description : "When I use the Ever Hospitable benefit of my Mark of Hospitality feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Purify Food and Drink such that each creature of my choice within 30 ft loses 1 Exhaustion level /u0026 gains Temp HP equal to my Prof Bonus + my Cha mod. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of making"] = {
  name : "Greater Mark of Making",
  source : [["XUA25EU", 14]],
  prerequisite : "Character Level 4+, Mark of Making Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of making/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Artisan's Intuition benefit of your Mark of Making feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Making. When you cast Magic Weapon, you can modify the spell so that the first time you attack with the weapon on each of your turns, you can transfer some or all of the weapon's bonus to your Armor Class. For example, if the bonus is +2, you could reduce the bonus to your attack rolls and damage rolls to +1 and gain a +1 bonus to Armor Class. The adjusted bonus remains in effect until the start of your next turn, although you must hold the weapon to gain a bonus to AC from it. Once you modify the spell using this benefit, you can't do so again until you finish a Long Rest.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Artisan's Intuition benefit of my Mark of Making feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Magic Weapon such that that first time I attack with the weapon on each of my turns, I can transfer some or all of the weapon's bonus to my AC (EX: +2 bonus becomes +1 to attack rolls /u0026 +1 to AC). The adjusted bonus remains in effect until the start of my next turn so long as I hold the weapon.",
  extraLimitedFeatures : [{
	name : " Improved Making",
	usages : 1,
	recovery : "long rest",
  }],
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Artisan's Intuition benefit of my Mark of Making feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Magic Weapon such that that first time I attack with the weapon on each of my turns, I can transfer some or all of the weapon's bonus to my AC (EX: +2 bonus becomes +1 to attack rolls /u0026 +1 to AC). The adjusted bonus remains in effect until the start of my next turn so long as I hold the weapon. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Artisan's Intuition benefit of my Mark of Making feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Magic Weapon such that that first time I attack with the weapon on each of my turns, I can transfer some or all of the weapon's bonus to my AC (EX: +2 bonus becomes +1 to attack rolls /u0026 +1 to AC). The adjusted bonus remains in effect until the start of my next turn so long as I hold the weapon. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Artisan's Intuition benefit of my Mark of Making feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Magic Weapon such that that first time I attack with the weapon on each of my turns, I can transfer some or all of the weapon's bonus to my AC (EX: +2 bonus becomes +1 to attack rolls /u0026 +1 to AC). The adjusted bonus remains in effect until the start of my next turn so long as I hold the weapon. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Artisan's Intuition benefit of my Mark of Making feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Magic Weapon such that that first time I attack with the weapon on each of my turns, I can transfer some or all of the weapon's bonus to my AC (EX: +2 bonus becomes +1 to attack rolls /u0026 +1 to AC). The adjusted bonus remains in effect until the start of my next turn so long as I hold the weapon. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Artisan's Intuition benefit of my Mark of Making feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Magic Weapon such that that first time I attack with the weapon on each of my turns, I can transfer some or all of the weapon's bonus to my AC (EX: +2 bonus becomes +1 to attack rolls /u0026 +1 to AC). The adjusted bonus remains in effect until the start of my next turn so long as I hold the weapon. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Artisan's Intuition benefit of my Mark of Making feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Magic Weapon such that that first time I attack with the weapon on each of my turns, I can transfer some or all of the weapon's bonus to my AC (EX: +2 bonus becomes +1 to attack rolls /u0026 +1 to AC). The adjusted bonus remains in effect until the start of my next turn so long as I hold the weapon. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of passage"] = {
  name : "Greater Mark of Passage",
  source : [["XUA25EU", 14]],
  prerequisite : "Character Level 4+, Mark of Passage Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of passage/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Intuitive Motion benefit of your Mark of Passage feat, you can roll 1d6 instead of 1d4.\n \u2022 Inspired Passage. When you cast Misty Step, you can modify the spell so that you can bring one willing creature you are touching with you. That creature teleports to an unoccupied space of your choice within 5 feet of your destination space. Once you modify the spell with this benefit, you can't do so again until you finish a Long Rest.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Intuitive Motion benefit of my Mark of Passage feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Misty Step such that I can bring 1 willing creature I am touching with me. That creature teleports to an unoccupied space of my choice within 5 ft of my destination space.",
  extraLimitedFeatures : [{
	name : " Inspired Passage",
	usages : 1,
	recovery : "long rest",
  }],
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Intuitive Motion benefit of my Mark of Passage feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Misty Step such that I can bring 1 willing creature I am touching with me. That creature teleports to an unoccupied space of my choice within 5 ft of my destination space. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Intuitive Motion benefit of my Mark of Passage feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Misty Step such that I can bring 1 willing creature I am touching with me. That creature teleports to an unoccupied space of my choice within 5 ft of my destination space. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Intuitive Motion benefit of my Mark of Passage feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Misty Step such that I can bring 1 willing creature I am touching with me. That creature teleports to an unoccupied space of my choice within 5 ft of my destination space. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Intuitive Motion benefit of my Mark of Passage feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Misty Step such that I can bring 1 willing creature I am touching with me. That creature teleports to an unoccupied space of my choice within 5 ft of my destination space. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Intuitive Motion benefit of my Mark of Passage feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Misty Step such that I can bring 1 willing creature I am touching with me. That creature teleports to an unoccupied space of my choice within 5 ft of my destination space. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Intuitive Motion benefit of my Mark of Passage feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Misty Step such that I can bring 1 willing creature I am touching with me. That creature teleports to an unoccupied space of my choice within 5 ft of my destination space. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of scribing"] = {
  name : "Greater Mark of Scribing",
  source : [["XUA25EU", 14]],
  prerequisite : "Character Level 4+, Mark of Scribing Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of scribing/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Gifted Scribe benefit of your Mark of Scribing feat, you can roll 1d6 instead of 1d4.\n \u2022 Inspired Scribing. When you cast Comprehend Languages, you can modify the spell to cause a sigil to appear in the air above a creature you can see within 30 feet of yourself, which lasts for the duration of the spell. While the sigil persists, your enemies within 30 feet of the creature must spend 2 feet of movement for every 1 foot they move closer to that creature. The sigil disappears if the creature makes an attack roll, casts a spell, or deals damage.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Gifted Scribe benefit of my Mark of Scribing feat, I can roll 1d6 instead of 1d4. When I cast Comprehend Languages, I can modify the spell to manifest a sigil in the air above a creature I can see within 30 ft of myself, which lasts for the duration of the spell. While the sigil persists, my enemies within 30 ft of the creature move as if within Difficult Terrain as they move closer to that creature. Sigil disappears if the creature makes an attack roll, casts a spell, or deals damage.",
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Gifted Scribe benefit of my Mark of Scribing feat, I can roll 1d6 instead of 1d4. When I cast Comprehend Languages, I can modify the spell to manifest a sigil in the air above a creature I can see within 30 ft of myself, which lasts for the duration of the spell. While the sigil persists, my enemies within 30 ft of the creature move as if within Difficult Terrain as they move closer to that creature. Sigil disappears if the creature makes an attack roll, casts a spell, or deals damage. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Gifted Scribe benefit of my Mark of Scribing feat, I can roll 1d6 instead of 1d4. When I cast Comprehend Languages, I can modify the spell to manifest a sigil in the air above a creature I can see within 30 ft of myself, which lasts for the duration of the spell. While the sigil persists, my enemies within 30 ft of the creature move as if within Difficult Terrain as they move closer to that creature. Sigil disappears if the creature makes an attack roll, casts a spell, or deals damage. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Gifted Scribe benefit of my Mark of Scribing feat, I can roll 1d6 instead of 1d4. When I cast Comprehend Languages, I can modify the spell to manifest a sigil in the air above a creature I can see within 30 ft of myself, which lasts for the duration of the spell. While the sigil persists, my enemies within 30 ft of the creature move as if within Difficult Terrain as they move closer to that creature. Sigil disappears if the creature makes an attack roll, casts a spell, or deals damage. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Gifted Scribe benefit of my Mark of Scribing feat, I can roll 1d6 instead of 1d4. When I cast Comprehend Languages, I can modify the spell to manifest a sigil in the air above a creature I can see within 30 ft of myself, which lasts for the duration of the spell. While the sigil persists, my enemies within 30 ft of the creature move as if within Difficult Terrain as they move closer to that creature. Sigil disappears if the creature makes an attack roll, casts a spell, or deals damage. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Gifted Scribe benefit of my Mark of Scribing feat, I can roll 1d6 instead of 1d4. When I cast Comprehend Languages, I can modify the spell to manifest a sigil in the air above a creature I can see within 30 ft of myself, which lasts for the duration of the spell. While the sigil persists, my enemies within 30 ft of the creature move as if within Difficult Terrain as they move closer to that creature. Sigil disappears if the creature makes an attack roll, casts a spell, or deals damage. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Gifted Scribe benefit of my Mark of Scribing feat, I can roll 1d6 instead of 1d4. When I cast Comprehend Languages, I can modify the spell to manifest a sigil in the air above a creature I can see within 30 ft of myself, which lasts for the duration of the spell. While the sigil persists, my enemies within 30 ft of the creature move as if within Difficult Terrain as they move closer to that creature. Sigil disappears if the creature makes an attack roll, casts a spell, or deals damage. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of sentinel"] = {
  name : "Greater Mark of Sentinel",
  source : [["XUA25EU", 14]],
  prerequisite : "Character Level 4+, Mark of Sentinel Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of sentinel/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Sentinel's Intuition benefit of your Mark of Sentinel feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Sentinel. When you cast Shield, you can modify the spell so that it magically marks a creature you can see within 30 feet of you until the end of its next turn. While marked, the target must spend 2 feet of movement for every 1 foot they move away from you.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Sentinel's Intuition benefit of my Mark of Sentinel feat, I can roll 1d6 instead of 1d4. When I cast Shield, I can modify the spell so that it magically marks a creature I can see within 30 ft of me until the end of its next turn. While marked, the target moves as if in Difficult Terrain while moving away from me.",
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Sentinel's Intuition benefit of my Mark of Sentinel feat, I can roll 1d6 instead of 1d4. When I cast Shield, I can modify the spell so that it magically marks a creature I can see within 30 ft of me until the end of its next turn. While marked, the target moves as if in Difficult Terrain while moving away from me. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Sentinel's Intuition benefit of my Mark of Sentinel feat, I can roll 1d6 instead of 1d4. When I cast Shield, I can modify the spell so that it magically marks a creature I can see within 30 ft of me until the end of its next turn. While marked, the target moves as if in Difficult Terrain while moving away from me. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Sentinel's Intuition benefit of my Mark of Sentinel feat, I can roll 1d6 instead of 1d4. When I cast Shield, I can modify the spell so that it magically marks a creature I can see within 30 ft of me until the end of its next turn. While marked, the target moves as if in Difficult Terrain while moving away from me. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Sentinel's Intuition benefit of my Mark of Sentinel feat, I can roll 1d6 instead of 1d4. When I cast Shield, I can modify the spell so that it magically marks a creature I can see within 30 ft of me until the end of its next turn. While marked, the target moves as if in Difficult Terrain while moving away from me. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Sentinel's Intuition benefit of my Mark of Sentinel feat, I can roll 1d6 instead of 1d4. When I cast Shield, I can modify the spell so that it magically marks a creature I can see within 30 ft of me until the end of its next turn. While marked, the target moves as if in Difficult Terrain while moving away from me. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Sentinel's Intuition benefit of my Mark of Sentinel feat, I can roll 1d6 instead of 1d4. When I cast Shield, I can modify the spell so that it magically marks a creature I can see within 30 ft of me until the end of its next turn. While marked, the target moves as if in Difficult Terrain while moving away from me. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of shadow"] = {
  name : "Greater Mark of Shadow",
  source : [["XUA25EU", 15]],
  prerequisite : "Character Level 4+, Mark of Shadow Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of shadow/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Cunning Intuition benefit of your Mark of Shadow feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Shadow. When you cast Invisibility on yourself, you can modify the spell to also affect one willing creature within 5 feet of yourself. The Invisible condition ends immediately for an affected creature after it makes an attack roll, deals damage, or casts a spell. Once you modify the spell with this benefit, you can't do so again until you finish Long Rest.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Cunning Intuition benefit of my Mark of Shadow feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Invisibility to also affect 1 willing creature within 5 ft of myself. The Invisible condition ends immediately for an affected creature if it makes an attack roll, deals damage, or casts a spell.",
  extraLimitedFeatures : [{
	name : " Improved Shadow",
	usages : 1,
	recovery : "long rest",
  }],
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Cunning Intuition benefit of my Mark of Shadow feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Invisibility to also affect 1 willing creature within 5 ft of myself. The Invisible condition ends immediately for an affected creature if it makes an attack roll, deals damage, or casts a spell. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Cunning Intuition benefit of my Mark of Shadow feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Invisibility to also affect 1 willing creature within 5 ft of myself. The Invisible condition ends immediately for an affected creature if it makes an attack roll, deals damage, or casts a spell. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Cunning Intuition benefit of my Mark of Shadow feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Invisibility to also affect 1 willing creature within 5 ft of myself. The Invisible condition ends immediately for an affected creature if it makes an attack roll, deals damage, or casts a spell. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Cunning Intuition benefit of my Mark of Shadow feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Invisibility to also affect 1 willing creature within 5 ft of myself. The Invisible condition ends immediately for an affected creature if it makes an attack roll, deals damage, or casts a spell. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Cunning Intuition benefit of my Mark of Shadow feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Invisibility to also affect 1 willing creature within 5 ft of myself. The Invisible condition ends immediately for an affected creature if it makes an attack roll, deals damage, or casts a spell. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Cunning Intuition benefit of my Mark of Shadow feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Invisibility to also affect 1 willing creature within 5 ft of myself. The Invisible condition ends immediately for an affected creature if it makes an attack roll, deals damage, or casts a spell. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of storm"] = {
  name : "Greater Mark of Storm",
  source : [["XUA25EU", 15]],
  prerequisite : "Character Level 4+, Mark of Storm Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of storm/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Windwright's Intuition benefit of your Mark of Storm feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Storm. When you cast Gust of Wind, you modify the spell so that you gain a Fly Speed equal to half your Speed (round down) for the duration of the spell. Once you modify the spell with this benefit, you can't do so again until you finish a Long Rest.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Windwright's Intuition benefit of my Mark of Storm feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Gust of Wind such that for the duration, I gain a Fly Speed equal to half my Speed (round down).",
  extraLimitedFeatures : [{
	name : " Improved Storm",
	usages : 1,
	recovery : "long rest",
  }],
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Windwright's Intuition benefit of my Mark of Storm feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Gust of Wind such that for the duration, I gain a Fly Speed equal to half my Speed (round down). [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Windwright's Intuition benefit of my Mark of Storm feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Gust of Wind such that for the duration, I gain a Fly Speed equal to half my Speed (round down). [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Windwright's Intuition benefit of my Mark of Storm feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Gust of Wind such that for the duration, I gain a Fly Speed equal to half my Speed (round down). [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Windwright's Intuition benefit of my Mark of Storm feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Gust of Wind such that for the duration, I gain a Fly Speed equal to half my Speed (round down). [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Windwright's Intuition benefit of my Mark of Storm feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Gust of Wind such that for the duration, I gain a Fly Speed equal to half my Speed (round down). [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Windwright's Intuition benefit of my Mark of Storm feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Gust of Wind such that for the duration, I gain a Fly Speed equal to half my Speed (round down). [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["greater mark of warding"] = {
  name : "Greater Mark of Warding",
  source : [["XUA25EU", 13]],
  prerequisite : "Character Level 4+, Mark of Warding Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/mark of warding/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase ability score of your choice by 1, to a maximum of 20.\n \u2022 Improved Intuition. When you use the Warder's Intuition benefit of your Mark of Warding feat, you can roll 1d6 instead of 1d4.\n \u2022 Improved Warding. When you cast Mage Armor on yourself, you can modify the spell to also affect one willing creature you can see within 30 feet of yourself. Once you modify the spell with this benefit, you can't do so again until you finish a Long Rest.",
  description : "An ability score of my choice is increased by 1, to a max of 20. When I use the Warder's Intuition benefit of my Mark of Warding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Mage Armor to also affect 1 willing creature I can see within 30 ft of myself.",
  extraLimitedFeatures : [{
	name : " Improved Warding",
	usages : 1,
	recovery : "long rest",
  }],
  choices : ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength" : {
	description : "When I use the Warder's Intuition benefit of my Mark of Warding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Mage Armor to also affect 1 willing creature I can see within 30 ft of myself. [+1 Strength]",
	scores : [1, 0, 0, 0, 0, 0]
  },
  "dexterity" : {
	description : "When I use the Warder's Intuition benefit of my Mark of Warding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Mage Armor to also affect 1 willing creature I can see within 30 ft of myself. [+1 Dexterity]",
	scores : [0, 1, 0, 0, 0, 0]
  },
  "constitution" : {
	description : "When I use the Warder's Intuition benefit of my Mark of Warding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Mage Armor to also affect 1 willing creature I can see within 30 ft of myself. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "When I use the Warder's Intuition benefit of my Mark of Warding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Mage Armor to also affect 1 willing creature I can see within 30 ft of myself. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "When I use the Warder's Intuition benefit of my Mark of Warding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Mage Armor to also affect 1 willing creature I can see within 30 ft of myself. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "When I use the Warder's Intuition benefit of my Mark of Warding feat, I can roll 1d6 instead of 1d4. Once per Long Rest, I can modify Mage Armor to also affect 1 willing creature I can see within 30 ft of myself. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};
FeatsList["potent dragonmark"] = {
  name : "Potent Dragonmark",
  source : [["XUA25EU", 15]],
  prerequisite : "Character Level 4+, Any Dragonmark Feat",
  prereqeval : function(v) { return v.characterLevel >=4 && (/dragonmark|mark/i).test(CurrentFeat.known); },
  descriptionFull : "You gain the following benefits:\n \u2022 Ability Score Increase. Increase the spellcasting ability score used by your Dragonmark Feat by 1, to a maximum of 20.\n \u2022 Dragonmark Preparation. You always have the spells on your Dragonmark feat's Spells of the Mark list (if any) prepared.\n \u2022 Dragonmark Spellcasting. You have one spell slot to cast the spells granted by your Dragonmark feat. The spell slot's level is one-half your level (round up), to a maximum of level 5. You regain the expended slot when you finish a Short or Long Rest. You can use this spell slot to cast only a spell that you have prepared because of your Dragonmark feat or the Dragonmark Preparation benefit of this feat.",
  description : "The spellcasting ability score of my Dragonmark Feat increases by 1, to a max of 20. I always have the spells on my Dragonmark Feat's Spells of the Mark list (if any) prepared (automation not included). I have 1 spell slot of a spell lvl 1/2 of my character lvl (round up, max of lvl 5), which I can use to cast spells granted /u0026 prepared by my Dragonmark Feat. I regain the expended spell slot after a Short/Long Rest.",
  extraLimitedFeatures : [{
	name : " Dragonmark Spell Slot",
	usages : 1,
	recovery : "short rest",
  }],
  choices : ["Constitution", "Intelligence", "Wisdom", "Charisma"], //Check with MPMB Discord to see if there is a way to hook into an Origin Dragonmark Feat's choice.
  "constitution" : {
	description : "I always have the spells on my Dragonmark Feat's Spells of the Mark list (if any) prepared (automation not included). I have 1 spell slot of a spell lvl 1/2 of my character lvl (round up, max of lvl 5), which I can use to cast spells granted /u0026 prepared by my Dragonmark Feat. I regain the expended spell slot after a Short/Long Rest. [+1 Constitution]",
	scores : [0, 0, 1, 0, 0, 0]
  },
  "intelligence" : {
	description : "I always have the spells on my Dragonmark Feat's Spells of the Mark list (if any) prepared (automation not included). I have 1 spell slot of a spell lvl 1/2 of my character lvl (round up, max of lvl 5), which I can use to cast spells granted /u0026 prepared by my Dragonmark Feat. I regain the expended spell slot after a Short/Long Rest. [+1 Intelligence]",
	scores : [0, 0, 0, 1, 0, 0]
  },
  "wisdom" : {
	description : "I always have the spells on my Dragonmark Feat's Spells of the Mark list (if any) prepared (automation not included). I have 1 spell slot of a spell lvl 1/2 of my character lvl (round up, max of lvl 5), which I can use to cast spells granted /u0026 prepared by my Dragonmark Feat. I regain the expended spell slot after a Short/Long Rest. [+1 Wisdom]",
	scores : [0, 0, 0, 0, 1, 0]
  },
  "charisma" : {
	description : "I always have the spells on my Dragonmark Feat's Spells of the Mark list (if any) prepared (automation not included). I have 1 spell slot of a spell lvl 1/2 of my character lvl (round up, max of lvl 5), which I can use to cast spells granted /u0026 prepared by my Dragonmark Feat. I regain the expended spell slot after a Short/Long Rest. [+1 Charisma]",
	scores : [0, 0, 0, 0, 0, 1]
  }
};

// Epic Boon
FeatsList["boon of siberys"] = {
  name : "Boon of Siberys",
  source : [["XUA25EU", 15]],
  prerequisite : "Eberron Campaign Setting, Level 19+",
  prereqeval : function(v) { return v.characterLevel >=19; },
  descriptionFull : desc([
	"You gain the following benefits",
	"Ability Score Improvement. Increase one ability score of your choice by 1, to a Maximum of 30.",
	"Aberrant Magic. Choose a spell of any level from the Sorcerer spell list or a spell from the Siberys Dragonmarks table. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Short or Long Rest. You can also cast this spell using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you gain this feat)." + toUni("d8\tSiberys Dragonmarks") + "\n  1\tDetection: True Seeing\n  2\tFinding: Teleport\n  3\tHandling: Animal Shapes\n  4\tHealing: Regenerate\n  5\tHospitality: Heroe's Feast\n  6\tMaking: Demiplane\n  7\tPassage: Plane Shift\n  8\tScribing: Symbol\n  9\tSentinel: Mind Blank\n  10\tShadow: Project Image\n  11\tStorm: Control Weather\n  12\tWarding: Maze",
  ]),
  description : "An ability score of my choice is increased by 1, to a max of 30. I always have the either 1 spell from the Sorcerer spell list or a spell from the Siberys Dragonmarks table (see book) prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat).",
  spellcastingBonus : [{
	name : "Boon of Siberys",
	'class' : 'sorcerer',
	level : [0, 9],
	extraspells : ["true seeing", "teleport", "animal shapes", "regenerate", "heroes' feast", "demiplane", "plane shift", "symbol", "mind blank", "project image", "control weather", "maze"],
	firstCol : 'oncesr',
	spellcastingAbility : [4, 5, 6],
  }],
  choices: ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
  "strength": {
	description : "I always have the either 1 spell from the Sorcerer spell list or a spell from the Siberys Dragonmarks table (see book) prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). [+1 Strength]",
    scores: [1, 0, 0, 0, 0, 0],
    scoresMaximum: [30, 0, 0, 0, 0, 0],
  },
  "dexterity": {
	description: "I always have the either 1 spell from the Sorcerer spell list or a spell from the Siberys Dragonmarks table (see book) prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). [+1 Dexterity]",
    scores: [0, 1, 0, 0, 0, 0],
    scoresMaximum: [0, 30, 0, 0, 0, 0],
  },
  "constitution": {
	description: "I always have the either 1 spell from the Sorcerer spell list or a spell from the Siberys Dragonmarks table (see book) prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). [+1 Constitution]",
    scores: [0, 0, 1, 0, 0, 0],
    scoresMaximum: [0, 0, 30, 0, 0, 0],
  },
  "intelligence": {
	description: "I always have the either 1 spell from the Sorcerer spell list or a spell from the Siberys Dragonmarks table (see book) prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). [+1 Intelligence]",
    scores: [0, 0, 0, 1, 0, 0],
    scoresMaximum: [0, 0, 0, 30, 0, 0],
  },
  "wisdom": {
	description: "I always have the either 1 spell from the Sorcerer spell list or a spell from the Siberys Dragonmarks table (see book) prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). [+1 Wisdom]",
    scores: [0, 0, 0, 0, 1, 0],
    scoresMaximum: [0, 0, 0, 0, 30, 0],
  },
  "charisma": {
	description: "I always have the either 1 spell from the Sorcerer spell list or a spell from the Siberys Dragonmarks table (see book) prepared, and can cast it once without a spell slot per Long Rest. I can also cast it with any spell slots I have. Intelligence, Wisdom, or Charisma is my spellcasting ability for this spell (chosen when I select this feat). [+1 Charisma]",
    scores: [0, 0, 0, 0, 0, 1],
    scoresMaximum: [0, 0, 0, 0, 0, 30],
  },
};

// Add Armorer Subclass
//// Need external review to make sure I didn't screw this up
RunFunctionAtEnd(function () {
  var XUA25EU_Artificer_Subclass_Armorer = legacySubClassRefactor("artificer", "armorer", {
	regExpSearch: /^(?=.*armou?rer)(?!.*wizard).*$/i,
	subname : "Armorer",
	fullname : "Armorer",
	source: [["XUA25EU", 8]],
	replaces: "armorer",
	spellcastingExtra: ["magic missile", "thunderwave", "mirror image", "shatter", "hypnotic pattern", "lightning bolt", "fire shield", "greater invisibility", "passwall", "wall of force"],
	attacks : [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	features: {
      "subclassfeature3": {
        name: "Tools Proficiency",
        source: [["XUA25EU", 8]],
        minlevel: 3,
        description: " [proficient with Heavy Armor & Smith's Tools]\n   I can craft nonmagical & magical armor in half the normal time.",
	    toolProfs : ["Smith's tools", 1],
	    armorProfs : [false, false, true, false],
      },
      "subclassfeature3.1" : {
	    name : "Arcane Armor",
	    source : [["XUA25EU", 8]],
	    minlevel : 3,
	    description : " [reverts back if I die or don another armor]" + desc([
		  "As an Magic action, I can use Smith's Tools to turn an armor I'm wearing into Arcane Armor",
		  "As an Magic action, I can don or doff it; As a Bonus Action, I can deploy or retract its helmet",
		  "It can't be removed against my will, covers all my limbs, and even replaces missing limbs",
		  "I ignore the Strength requirement of Arcane Armor and can use it as a Spellcasting Focus"
	    ]),
	    action : [["action", " (create/don/doff)"], ["bonus action", " (retract/deploy helmet)"]]
	  },
	  "subclassfeature3.2" : {
	    name : "Armor Model",
	    source : [["XUA25EU", 8]],
	    minlevel : 3,
	    description : desc([
		  "When I finish a rest, I can use Smith's Tools to change the model of my Arcane Armor",
		  'Select a model using the "Choose Feature" button; See "Notes" page for features of each'
	    ]),
	    additional : "also see notes page",
	    toNotesPage : [{
		  name : "Arcane Armor Model Features",
		  note : desc([
		    "I can customize my Arcane Armor to the Dreadnaught, Guardian, or Infiltrator model whenever I finish a Short or Long Rest, provided I have Smith's Tools in hand.",
		    "Each model includes a special weapon. When I attack with that weapon, I can use my Intelligence modifier, instead of Strength or Dexterity, for the attack and damage rolls."
		  ])
	    }, {
		  name : "Dreadnaught Arcane Armor",
		  popupName : "Dreadnaught Arcane Armor Features",
		  note : " You design your armor to become a towering juggernaut in battle." + desc([
		    "\u2022 Armor Flail: An iron ball on a chain appears on one of your armor's gauntlets. It counts as a Simple Melee weapon with the Reach property that deals 1d10 Bludgeoning damage on a hit. If I hit a creature that is at least one size smaller than myself with the flail, I can push the creature up to 10 feet straight away from myself or pull the creature up to 10 feet toward myself.",
		    "\u2022 Giant Stature: As a Bonus Action, I transform and enlarge my armor for 1 minute. For the duration, my reach increases by 5 feet, and if I am smaller than Large, I become Large, along with anything I am wearing. If there isn't enough room for me to increase my size, my size doesn't change. I can use this Bonus Action a number of times equal to my Intelligence modifier (minimum of once). I regain all expended uses when I finish a Long Rest.",
		  ]),
		  amendTo : "Arcane Armor Model Features"
	    }, {
		  name : "Guardian Arcane Armor",
		  popupName : "Guardian Arcane Armor Features",
		  note : " You design your armor to be in the front line of conflict." + desc([
		    "\u2022 Thunder Gauntlets: Each of the armor's gauntlets counts as a Simple Melee weapon while I'm not holding anything in it, and it deals 1d8 Thunder damage on a hit. A creature hit by the gauntlet has Disadvantage on attack rolls against targets other than me until the start of my next turn, as the armor magically emits a distracting pulse when the creature attacks someone else.",
		    "\u2022 Defensive Field: As a Bonus Action while I am Bloodied, I can gain Temporary Hit Points equal to my Artificer level, replacing any Temporary Hit Points I already have. I lose these Temporary Hit Points if I doff the armor.",
		  ]),
		  amendTo : "Arcane Armor Model Features"
	    }, {
		  name : "Infiltrator Arcane Armor",
		  popupName : "Infiltrator Arcane Armor Features",
		  note : " You customize your armor for subtle undertakings." + desc([
		    "\u2022 Lightning Launcher: A gemlike node on one of the armored fists or on the chest (my choice) counts as a Simple Ranged weapon, with a normal range of 90 ft and a long range of 300 ft. It deals 1d6 Lightning damage on a hit. Once on each of my turns when I hit a creature with it, I can deal an extra 1d6 Lightning damage to that target.",
		    "\u2022 Powered Steps: My walking speed increases by 5 feet.",
		    "\u2022 Dampening Field: I have Advantage on Dexterity (Stealth) checks. If the armor normally imposes Disadvantage on such checks, the Advantage and Disadvantage cancel each other, as normal."
		  ]),
		  amendTo : "Arcane Armor Model Features"
	    }],
	    choices : [],
	    choiceDependencies : [{
		  feature : "subclassfeature15",
		  choiceAttribute : true
	    }],
	    weaponOptions : [{
		  regExpSearch : /^(?=.*armor)(?=.*flail).*$/i,
		  name : "Armor Flail",
		  source : [["XUA25EU", 8]],
		  ability : 4,
		  type : "Simple",
		  damage : [1, 10, "bludgeoning"],
		  range : "Melee",
		  description : "Target hit (only if 1+ size smaller than me) can be pushed or pulled up to 10 ft straight away/towards me",
		  abilitytodamage : true,
		  monkweapon : true
	    }, {
		  regExpSearch : /^(?=.*thunder)(?=.*gauntlet).*$/i,
		  name : "Thunder Gauntlets",
		  source : [["XUA25EU", 8]],
		  ability : 4,
		  type : "Simple",
		  damage : [1, 8, "thunder"],
		  range : "Melee",
		  description : "Target hit Disadv. on attacks vs. others than me until my next turn starts",
		  abilitytodamage : true,
		  monkweapon : true
	    }, {
		  regExpSearch : /^(?=.*lightning)(?=.*launcher).*$/i,
		  name : "Lightning Launcher",
		  source : [["XUA25EU", 8]],
		  ability : 4,
		  type : "Simple",
		  damage : [1, 6, "lightning"],
		  range : "90/300 ft",
		  description : "Thrown; Once per turn on hit, +1d6 Lightning damage",
		  abilitytodamage : true
	    }],
	    // Do this in the parent object, so that it is always visible and people printing the sheet can more easily switch between the three models
	    // Also, the armor model can be changed on a short rest, but the limited feature only resets on a long rest, so shouldn't be removed
	    action : [["bonus action", "Defensive Field (Guardian Model)"], ["bonus action", "Giant Stature (Dreadnaught Model)"]],
	    extraLimitedFeatures : [{
		  name : "Giant Stature (Dreadnaught Model)",
		  usages : "Intelligence modifier per ",
		  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
		  recovery : "long rest"
	    }]
	  },
      "subclassfeature9" : {
	    name : "Armor Replication",
	    source : [["XUA25EU", 9]],
	    minlevel : 9,
	    description : desc([
		  "I learn one additional arcane plan for my Replicate Magic Item feature, & it must be in the Armor category",
		  "If I replace that arcane plan, I must replace it with another Armor plan",
		  "Additionally, I can create one additional item with that feature, and it must also be in the Armor category"
	    ]),
	    additional : "+1 replicated item, must be in Armor category"
	  },
	  "subclassfeature15" : {
	    name : "Perfected Armor",
	    source : [["XUA25EU", 9]],
	    minlevel : 15,
	    description : desc([
		  'My armor gets additional features, based on the model; Use "Choose Features" to select it',
		  "The Dreadnaught gets an increased attack range, can become Huge or Large, and gains a Fly Speed",
		  "The Guardian gets the ability to pull a creature closer as a Reaction and make an attack",
		  "The Infiltrator gets an upgrade to its lightning launcher weapon attack"
	    ]),
		calcChanges: {
		  atkCalc : [
			function (fields, v, output) {
			  if (/\barmor flail\b/i.test(v.WeaponText) && classes.known.artificer.level >= 15) {
				output.die = output.die.replace('1d10','2d6');
			  }
			  if (/\bthunder gauntlets\b/i.test(v.WeaponText) && classes.known.artificer.level >= 15) {
				output.die = output.die.replace('1d8','1d10');
			  }
			  if (/\blightning launcher\b/i.test(v.WeaponText) && classes.known.artificer.level >= 15) {
				output.die = output.die.replace('1d6','2d6');
			  }
			},
			"The Damage Die for the weapon given by my Arcane Armor model increases."
		  ],                
		},
	    toNotesPage : [{
		  name : "Dreadnaught Perfected Armor Features",
		  note : desc([
		    "The damage of my Armor Flail increases to 2d6 Bludgeoning damage.",
		    "In addition, when I use my Giant Stature, my reach increases by 10 feet, my size can increase to Large or Huge (my choice), and I gain a Fly Speed equal to my Speed.",
		  ]),
		  amendTo : "Arcane Armor Model Features"
	    }, {
		  name : "Guardian Perfected Armor Features",
		  note : desc([
		    "Tinkering with my armor's energy system leads me to discover a powerful pulling force and to increase the damage of my Thunder Gauntlets to 1d10 Thunder damage.",
		    "As a Reaction when a Huge or smaller creature I can see ends its turn within 30 ft of me, I can magically force the creature to make a Strength saving throw against my spell save DC, pulling the creature up to 30 ft toward me to an unoccupied space. If I pull the target to a space within 5 ft of me, I can make a melee weapon attack against it as part of this Reaction.",
		    "I can use this Reaction a number of times equal to my Proficiency Bonus. I regain all expended uses of it when I finish a long rest."
		  ]),
		  amendTo : "Arcane Armor Model Features"
	    }, {
		  name : "Infiltrator Perfected Armor Features",
		  note : desc([
		    "Any creature that takes Lightning damage from my Lightning Launcher glimmers with magical light until the start of my next turn. Additionally, my Lightning Launcher now deals 2d6 Lightning damage.",
		    "The glimmering creature sheds dim light in a 5-ft radius, and it has disadvantage on attack rolls against me, as the light jolts it if it attacks me."
		  ]),
		  amendTo : "Arcane Armor Model Features"
	    }],
		"dreadnaught" : {
		  name : "Perfected Armor: Dreadnaught",
		  description : desc([
		    "When I use my Giant Stature, my range increases by 10 ft, I can become Huge or Large (my choice),",
		    "  and I gain a Fly Speed equal to my Speed.",
		  ])
	    },
	    "guardian" : {
		  name : "Perfected Armor: Guardian",
		  description : " [Intelligence modifier per Long Rest]" + desc([
		    "As a Reaction when a creature I can see ends its turn in 30 ft, I have it make a Str save",
		    "If it is Huge or smaller and fails, I pull it up to 30 ft towards me to an unoccupied space",
		    "If I pull it within 5 ft, I can make a melee weapon attack vs. it as part of this Reaction"
		  ])
	    },
	    "infiltrator" : {
		  name : "Perfected Armor: Infiltrator",
		  description : desc([
		    "Those hit by my Lightning Launcher shed 5-ft radius dim light until my next turn starts",
		    "The light gives the target Disadvantage on attacks rolls made against me",
		  ])
	    },
	    // Do these in the parent object, so that they are always visible and people printing the sheet can more easily switch between the three models
	    // Also, the armor model can be changed on a short rest, but the limited feature only resets on a long rest, so shouldn't be removed
	    action : [["reaction", "Perfected Armor: Guardian"]],
	    extraLimitedFeatures : [{
		  name : "Perfected Armor: Guardian",
		  usages : "Intelligence modifier per ",
		  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
		  recovery : "long rest"
	    }]
	  },
    },
  });
  var itsFea = ClassSubList["artificer-armorer"].features["subclassfeature3.2"];
  var dreadnaughtTxt = desc([
	"One gauntlet manifests an iron ball on a chain that can push/pull a target at least 1 size",
	"smaller than me up to 10 ft. This Armor Flail is a Simple Melee weapon with Reach. Int mod",
	"times per Long Rest, as a Bonus Action, I can enlarge my armor for 1 minute. My reach increases",
	"by 5 ft and I become Large if I am currently smaller than Large /u0026 there is enough room."
  ])
  var guardianTxt = desc([
	"Both fists are Thunder Gauntlets, Simple Melee weapons that distract those hit by it.",
	"As a Bonus Action while Bloodied, I can activate a defensive shield to gain my Artificer level in Temp HP."
  ])
  var guardianAdditional = levels.map(function (n) {
	return n + " Temp HP as Bonus Action while Bloodied";
  })
  var infiltratorTxt = desc([
	"+5 ft Speed; Gemlike node in fist/chest is a Simple Ranged weapon, Lightning Launcher.",
	"It gives me Advantage on Dexterity (Stealth) checks."
  ])
  var prereqFunc = function(v) {
	var sParsed = ParseArmor(v.choice.replace(/(Dreadnaught|Guardian|Infiltrator) arcane /i, ''));
	return sParsed && testSource(sParsed, ArmourList[sParsed], "armorExcl") ? "skip" : true;
  };
  for (var armor in ArmourList) {
	var anArm = ArmourList[armor];
	if (anArm.isMagicArmor || !anArm.weight || (CurrentVars.extraArmour && CurrentVars.extraArmour[armor])) continue;
	// Add the Dreadnaught variant of the armor
	var dArmName = "Dreadnaught Arcane " + anArm.name;
	itsFea[dArmName.toLowerCase()] = {
	  name : (typePF ? "Armor " : "") + "Model: Dreadnaught " + anArm.name,
	  submenu : "Dreadnaught Arcane Armor",
	  description : dreadnaughtTxt,
	  armorAdd : dArmName,
	  weaponsAdd : ["Armor Flail"],
	  prereqeval : prereqFunc,
	  dependentChoices : "dreadnaught"
	}
	// Add the Guardian variant of the armor
	var gArmName = "Guardian Arcane " + anArm.name;
	itsFea[gArmName.toLowerCase()] = {
	  name : (typePF ? "Armor " : "") + "Model: Guardian " + anArm.name,
	  submenu : "Guardian Arcane Armor",
	  description : guardianTxt,
	  additional : guardianAdditional,
	  armorAdd : gArmName,
	  weaponsAdd : ["Thunder Gauntlets"],
	  prereqeval : prereqFunc,
	  dependentChoices : "guardian"
	}
	// And now add the Infiltrator variant of the armor
	var iArmName = "Infiltrator Arcane " + anArm.name;
	itsFea[iArmName.toLowerCase()] = {
	  name : "Armor Model: Infiltrator " + anArm.name,
	  submenu : "Infiltrator Arcane Armor",
	  description : infiltratorTxt + (anArm.stealthdis ? ", cancelling out the disadv. it imposes" : ""),
	  speed : { walk : {spd : "+5", enc : "+5" } },
	  armorAdd : iArmName,
	  weaponsAdd : ["Lightning Launcher"],
	  prereqeval : prereqFunc,
	  advantages : [["Stealth", true]],
	  dependentChoices : "infiltrator"
	}
	// Lastly push all three choices to the array
	itsFea.choices.push(dArmName, gArmName, iArmName);
  }
});

// Delete the old Infuse Item feature, this is replaced with the Replicate Magic Item feature; Coded by TrackAtNite
RunFunctionAtEnd(function() { 
	if(ClassList.artificer.features["infuse item"]) {
		delete ClassList.artificer.features["infuse item"]; // remove the infuse item feature
	}
	else {
		ClassList.artificer.features["infuse item"].minlevel = 1000; // set the minimum level to 1000 which effectively means that it will never appear til level 1000. 
	}
	// moved to the outside loop, always add artificer MI
	AddArtificerMI(); // persists after reload
})