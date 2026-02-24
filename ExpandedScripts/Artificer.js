/*	-INFORMATION-
	Subject:	Class, Subclasses, Companion Template Option, Magic Items, Creatures, Spell
	Effect:		This script adds all of the content from the Unearthed Arcana 2024: The Artificer article.
				This file has been made by MasterJedi2014, borrowing a lot of code from MorePurpleMoreBetter (Joost), Shroo, ThePokésimmer, TrackAtNite, and those who have contributed to the sheet's existing material.
	Code by:	MasterJedi2014, using MorePurpleMoreBetter's code as reference; Shroo; ThePokésimmer; TrackAtNite
	Date:		2025-01-27 (sheet v13.2.3)
	Notes:		This file will start by shunting the old Artificer and its subclasses into a "Legacy" class using code primarily developed by Shroo.
				It will thereafter define the new UA Artificer, along with options to customize some class features to include certain aspects of the old Artificer class features.
*/

var iFileName = "XUA24A Content [by MasterJedi2014] V18.js";
RequiredSheetVersion("13.2.3");

/*	-SCRIPT AUTHOR NOTE-
	This file should be installed AFTER the other 2024 PHB & DMG scripts made by ThePokésimmer.
*/

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
// >>> Define Sources for everything first >>> //
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //

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
	date : "2024/12/20",
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
  source: [["XUA24A", 1]],
  primaryAbility: ["Intelligence"],
  abilitySave: 4,
  prereqs: "Intelligence 13",
  improvements: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5],
  die: 8,
  saves: ["Con", "Int"],
  skillstxt: {
    primary : "Choose 2: Arcana, History, Investigation, Medicine, Nature, Perception, and Sleight of Hand",
	secondary : "Choose 2: Arcana, History, Investigation, Medicine, Nature, Perception, and Sleight of Hand",
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
	"magical tinkering": {
	  name : "Magical Tinkering",
	  source : [["XUA24A", 2]],
	  minlevel : 1,
	  description : desc([
		"As a Magic action, I use Tinker's Tools to create one item per 2024 PHB in an unoccupied space within 5ft.",
		"I can only make one of the following, which will last for one hour:",
		" \u2022 Ball Bearings \u2022 Basket \u2022 Bedroll \u2022 Bell \u2022 Blanket \u2022 Block & Tackle \u2022 Bucket \u2022 Caltrops \u2022 Candle",
		" \u2022 Crowbar \u2022 Flask \u2022 Jug \u2022 Lamp \u2022 Net \u2022 Oil \u2022 Paper \u2022 Parchment \u2022 Pole \u2022 Pouch \u2022 Rope \u2022 Sack",
		" \u2022 Shovel \u2022 String \u2022 Tinderbox \u2022 Torch \u2022 Vial",
	  ]),
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest",
	  action : [["action", " (add/remove)"]],
	  "infuse item" : {
		name : "Infuse Item",
		extraname : "Artificer 2",
		source : [["XUA24A", 2]],
		description : desc([
		  "When I finish a Long Rest, I can create 1 or 2 different magic items from arcane plans using Tinker's Tools",
		  "I can attune to it immediately; If I replicate too many items, the oldest loses vanishes",
		  "The infusion lasts until my death + my 1d4 days, but ends if I unlearn the arcane plans",
		  "Whenever I gain an Artificer level, I can replace an arcane plan I know with another",
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
	"spellcasting": {
      name: "Spellcasting",
      source : [["XUA24A", 2]],
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
		source : [["XUA24A", 3]],
		description : "\n   The automation will not add M\u0192 to each artificer spell on the generated spell sheets"
	  },
    },
    "replicate magic item": {
      name: "Replicate Magic Item",
      source : [["XUA24A", 3]],
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
    "the right tool for the job" : {
	  name : "The Right Tool for the Job",
	  source : [["XUA24A", 4]],
	  minlevel : 3,
	  description : desc([
		"The list of items you can create with Magical Tinkering now includes Artisan's Tools",
	  ]),
	  additional : "using Tinker's Tools"
	},
	"subclassfeature3" : {
	  name : "Artificer Specialist",
	  source : [["XUA24A", 4]],
	  minlevel : 3,
	  description : desc([
		'Choose a specialism and put it in the "Class" field on the first page',
		"Choose either Alchemist, Armorer, Artillerist, or Battle Smith"
	  ])
	},
	"magic item tinker" : {
	  name : "Magic Item Tinker",
	  source : [["XUA24A", 4]],
	  minlevel : 6,
	  description : desc([
		"My Replicate Magic Item feature improves as follows: Once per Long Rest as a Bonus Action, I can cause",
		"  one of my replicated magic items to vanish, converting the energy into a spell slot.",
		"  The slot is level 1 if the item is Common or level 2 if the item is Uncommon or Rare.",
		"  Any spell slot I create with this feature vanishes after a Long Rest.",
	  ])
	},
	"flash of genius" : {
	  name : "Flash of Genius",
	  source : [["XUA24A", 4]],
	  minlevel : 7,
	  description : "\n   As a Reaction when I or another in 30 ft fail a check/save, I can add my Int mod to it",
	  action : [["reaction", ""]],
	  usages : "Intelligence modifier per ",
	  usagescalc : "event.value = Math.max(1, What('Int Mod'));",
	  recovery : "long rest"
	},
	"magic item adept" : {
	  name : "Magic Item Adept",
	  source : [["XUA24A", 4]],
	  minlevel : 10,
	  description : "\n   I can attune to more magic items than others can.",
	  additional : levels.map(function (n) {
		return n < 10 ? "" : "attune to " + (n < 14 ? 4 : n < 18 ? 5 : 6) + " magic items";
	  })
	},
	"spell-storing item" : {
	  name : "Spell-Storing Item",
	  source : [["XUA24A", 4]],
	  minlevel : 11,
	  description : desc([
		"When I finish a Long Rest, I can infuse a 1st-/2nd-/3rd-level Artificer spell into an item I touch",
		"It has to be a weapon or spellcasting focus for me; Stored spells are lost if I do this again",
		"The spell must have a casting time of 1 action, but I need not have it prepared",
		"A creature holding an infused item can use an action to cast the spell, using my abilities"
	  ]),
	  additional : "cast stored spell",
	  usages : "2\xD7 Int mod per ",
	  usagescalc : "event.value = Math.max(2, Number(What('Int Mod')) * 2);",
	  recovery : "long rest"
	},
	"magic item savant" : {
	  name : "Magic Item Savant",
	  source : [["XUA24A", 4]],
	  minlevel : 14,
	  description : "\n   I can attune to even more magic items than others can.",
	},
	"epic boon": {
	  name : "Epic Boon",
	  source : [["XUA24A", 4]],
	  minlevel : 19,
	  description : desc([
		"I gain an Epic Boon feat, or another feat of my choice for which I qualify.",
	  ]),
	},
	"soul of artifice" : {
	  name : "Soul of Artifice",
	  source : [["XUA24A", 4]],
	  minlevel : 20,
	  description : " [+1d6 on all checks while attuned to 1 magic item]\n   As a free action when I'm reduced to 0 HP, I can disintegrate one Uncommon or Rare replicated magic item to drop to 20 HP instead",
	  action : [["reaction", " (Free Action)"]],
	  savetxt : {
		text : ["+1d6 to all checks while attuned to 1 magic item"]
	  }
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
		skills : { //Add an "All" field for this if one exists.
		  "athletics" : 4,
		  "perception" : 4
		},
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
		  modifiers : [2, "Prof"],
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

// Add options to include aspects from 2019/2020 Artificer for those that need them
AddFeatureChoice(ClassList.artificer.features["magical tinkering"], true, "Magical Tinkering: 2019/2020 Functions Added", {
	name : "Magical Tinkering: 2019/2020 Functions Added",
	extraname : "Artificer 1",
	source : [["MJ:HB", 0], ["E:RLW", 55], ["T", 9]],
	description : desc([
		"As a Magic action, I can alternatively use my Magical Tinkering to give 1 property to a nonmagical tiny object:",
		" \u2022 Emit light (5-ft radius bright light, equal dim), an odor, or a nonverbal sound",
		" \u2022 Static visual effect on one surface, or emit a 6-second recorded message when tapped",
		"If I instill a property in more objects than I can have active, the oldest loses its property",
		"Each tiny object I infuse with semi-permanent magic removes a usage from the maximum number of",
		"  items I can temporarily produce via the alternate Magical Tinkering rules.",
	]),
	prereqeval : function (v) { return classes.known.artificer.level >= 1 ? true : "skip"; }
}, "1st-level Artificer Magical Tinkering choice");
AddFeatureChoice(ClassList.artificer.features["spellcasting"], true, "Spellcasting: 2019/2020 Functions Added", {
	name : "Spellcasting: 2019/2020 Functions Added",
	extraname : "Artificer 2",
	source : [["MJ:HB", 0], ["E:RLW", 57], ["T", 9]],
	description : desc([
		"I additionally can use an infused/replicated magic item as a Spellcasting Focus",
	]),
	prereqeval : function (v) { return classes.known.artificer.level >= 2 ? true : "skip"; }
}, "2nd-level Artificer Spellcasting choice");
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
  source : [["XUA24A", 13], ["E:RLW", 62], ["T", 21], ["UA:A2", 9], ["UA:A3", 12]],
  type : "wondrous item",
  rarity : "uncommon",
  description : "While wearing these boots, I can teleport up to 15 ft as a Bonus Action to an unoccupied space I can see, as long as I occupied that space at some point during the current turn.",
  descriptionFull : "While wearing these boots, a creature can take a Bonus Action to teleport up to 15 feet to an unoccupied space the creature can see. The creature must have occupied that space at some point during the current turn.",
  attunement : true,
  action : [["bonus action", ""]]
};
MagicItemsList["helm of awareness"] = {
  name : "Helm of Awareness",
  source : [["XUA24A", 13], ["T", 21], ["UA:SP3", 3]],
  type : "wondrous item",
  rarity : "uncommon",
  description : "While wearing this helmet, I have Advantage on Initiative rolls.",
  descriptionFull : "While wearing this helmet, a creature has Advantage on Initiative rolls.",
  attunement : true,
  advantages : [["Initiative", true]],
};
MagicItemsList["mind sharpener ring"] = {
  name : "Mind Sharpener Ring",
  source : [["XUA24A", 13], ["T", 22]],
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
  source : [["XUA24A", 13], ["E:RLW", 62], ["T", 22]],
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
  source : [["XUA24A", 14], ["E:RLW", 62], ["T", 22], ["UA:A3", 13]],
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
  source : [["XUA24A", 14], ["E:RLW", 63], ["T", 23]],
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
  source : [["XUA24A", 14], ["E:RLW", 63], ["T", 23], ["UA:A3", 14], ["UA:A2", 10]],
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
  source : [["XUA24A", 14], ["T", 23]],
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
	// An object of arrays to store the items to be added
    var artMi = [];
	// Only allow common, uncommon, or rare items.
	var allowedRarities = /^(common|uncommon|rare)$/i;
	// An array of objects to store the items to be added and their properties
	/**
	 * The `rarities` array defines rules for item inclusion based on rarity and artificer level.
	 * Each object in the array represents a rarity level and associated rules.
	 * 
	 * `rarity` must be a string matching the rarity of the item
	 * `level` is the minimum artificer level required to include the item
	 * `include` is a boolean indicating whether the item should be included
	 * `regExpSearch` is a regular expression to search for in the item name
	 * `includeExceptions` is a boolean indicating whether to include exceptions
	 * `exceptions` is an array of item names to exclude from the search
	 * 
	 * If include is false, that means all items at that rarity will be added except for the ones matching the regExpSearch or if they are in the exceptions array
	 * If include is true, all items matching the regExpSearch will be added
	 * If includeExceptions is true, the exceptions array will be included regardless of the regExpSearch
	 * If includeExceptions is false, the exceptions array will be excluded regardless of the regExpSearch
	 */
    var rarities = [
		{
            rarity: "common",
            level: 2,
            include: false,
            regExpSearch: /potion|scroll/i,
            includeExceptions: true,
            exceptions: ["alchemy jug", "bag of holding", "cap of water breathing", "enhanced defense (armor)", "enhanced defense (shield)", "goggles of night", "rope of climbing", "sending stones", "shield, +1, +2, or +3", "wand of magic detection", "wand of secrets", "wand of the war mage, +1, +2, or +3", "weapon, +1, +2, or +3"]
        },
		{
            rarity: "uncommon",
            level: 6,
            include: false,
            regExpSearch: /ring|wondrous/i,
            includeExceptions: true,
            exceptions: ["armor, +1, +2, or +3"]
        },
        {
            rarity: "uncommon",
            level: 10,
            include: false,
            regExpSearch: /armor|wand|weapon/i,
            includeExceptions: true,
            exceptions: ["enhanced defense (armor)", "enhanced defense (shield)"]
        },
        {
            rarity: "rare",
            level: 14,
            include: true,
            regExpSearch: /armor|ring|wand|weapon|wondrous/i,
            includeExceptions: true,
            exceptions: ["shield, +1, +2, or +3", "wand of the war mage, +1, +2, or +3", "weapon, +1, +2, or +3"]
        }
    ];

	// Functions to add items to the list, if for some reason the item is being added at a lower level, it will be overwritten to follow
	function addToArtMi(itemName, level, choice = null) {
		if (!artMi[itemName] || artMi[itemName][1] > level) {
			// Add the item only if it's not already in the list or the new level is lower
			artMi[itemName] = choice ? [itemName, level, choice] : [itemName, level];
		}
	}
    for (var mi in MagicItemsList) {
		var aMI = MagicItemsList[mi];
	
		if (aMI.rarity && !allowedRarities.test(aMI.rarity)) continue;
	
		for (var rarityObj of rarities) {
			var matchesRegExp = rarityObj.include ? rarityObj.regExpSearch.test(aMI.type) : false;
	
			// Check if the item is an exception
			var isException = rarityObj.exceptions.indexOf(aMI.name.toLowerCase()) !== -1;
	
			// Determine if the item should be included
			var shouldInclude = false;
	
			// 1. Include Exceptions: Add exceptions at the specified level, regardless of rarity
			if (isException && rarityObj.includeExceptions) {
				shouldInclude = true;
			}
			// 2. Regular Rules: Match items based on `include` and `excludeRegExpSearch`
			else if ((rarityObj.include && matchesRegExp) || (!rarityObj.include && !matchesRegExp)) {
				// For non-exceptions, check rarity to ensure items are added to the correct level
				if (aMI.rarity && aMI.rarity.toLowerCase() === rarityObj.rarity) {
					shouldInclude = true;
				}
			} 
			// Special case: Exclude items that should normally be included and match the regExpSearch,
			// but if includeExceptions is false, any items in the exceptions array should be excluded
			if (rarityObj.include && matchesRegExp && !rarityObj.includeExceptions && rarityObj.exceptions.indexOf(aMI.name.toLowerCase()) !== -1) {
				shouldInclude = false;
			} 
	
			// Add item if it passes the checks
			if (shouldInclude) {
				if (!aMI.rarity && aMI.choices) {
					// Handle items with multiple choices
					for (var choice of aMI.choices) {
						var choiceNmLC = choice.toLowerCase();
						var aMIchoice = aMI[choiceNmLC];
						// Ensure the choice matches the rarity or is an exception
						if (aMIchoice && (isException || (aMIchoice.rarity && aMIchoice.rarity.toLowerCase() === rarityObj.rarity))) {
							addToArtMi(mi, rarityObj.level, choiceNmLC);
						}
					}
				} else {
					// Add item directly for exceptions or matching rarity
					if (isException || (aMI.rarity && aMI.rarity.toLowerCase() === rarityObj.rarity)) {
						addToArtMi(mi, rarityObj.level);
					}
				}
			}
		}
	}
	var artObj = ClassList.artificer.features["replicate magic item"];
	if (!artObj.extrachoices) artObj.extrachoices = [];
	
	// Changed to iterate over an object.
	for (var itemName in artMi) {
		if (!artMi.hasOwnProperty(itemName)) continue; // Ensure it's a direct property
		
		/**
		 * Access the array
		 * var MI = artMi[itemName]; [name, level, choice]
		 * var MI0 = MI[0]; // Name of the item
		 * var MI1 = MI[1]; // Level (prereq)
		 * var MI2 = MI[2]; // Choice if any
		 */
	
		var MI = artMi[itemName];
		var MI0 = MI[0];
		var MI1 = MI[1];
		var MI2 = MI[2]; 
	
		var anArtMi = MagicItemsList[MI0];
		if (!anArtMi) continue;
	
		// Handle items with choices
		if (MI2 && anArtMi[MI2]) {
			anArtMi = {
				name: anArtMi[MI2].name ? anArtMi[MI2].name : anArtMi.name + " [" + MI2.capitalize() + "]",
				rarity: anArtMi[MI2].rarity ? anArtMi[MI2].rarity : anArtMi.rarity,
				source: anArtMi[MI2].source ? anArtMi[MI2].source : anArtMi.source,
				attunement: anArtMi[MI2].attunement !== undefined ? anArtMi[MI2].attunement : anArtMi.attunement
			};
		}
	
		// Format item with prerequisites
		var theI = anArtMi.name + (MI1 ? " (prereq: level " + MI1 + " artificer)" : "");
		var theILC = theI.toLowerCase();
	
		// Add item to artificer's replicate magic item list if not already present
		if (!artObj[theILC]) {
			var submenuLabel = "Replicate " + (anArtMi.rarity ? anArtMi.rarity : "Unknown") + " Magic Item (prereq: level " + MI1 + " artificer)";
			var submenuRange = getLetterRange(anArtMi.name.toString(), ["A-F", "G-Q", "R-Z"]);
	
			artObj[theILC] = {
				name: anArtMi.name,
				description: "",
				source: anArtMi.source,
				magicitemsAdd: [anArtMi.name],
				additional: anArtMi.attunement ? "requires attunement" : undefined,
				prereqeval: MI1 && MI1 > 2 ? ClassList.artificer["prereqLvl" + MI1] : undefined,
				submenu: submenuLabel + " [" + submenuRange + "]",
			};
			artObj.extrachoices.push(theI);
		}
	}	
}

// Add "Homunculus Servant" Spell
SpellsList["homunculus servant xua24a"] = {
  name : "Homunculus Servant (XUA24A)",
  source : [["XUA24A", 12]],
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
CompanionList.homunculusservant_xua24a = {
  name : "Homunculus Servant",
  nameMenu : "Homunculus Servant (Homunculus Servant XUA24A spell)",
  nameTooltip : "the Homunculus Servant (XUA24A) spell",
  nameOrigin : "1st-Level Conjuration [ritual] spell",
  source : [["XUA24A", 13]],
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
	description : "Use the spell slot's level for the spell’s level in the stat block." + "\n   " + "The familiar's HP, Skill/Save Bonuses, & Damage change depending on the level the Homunculus Servant (XUA24A) spell was cast at:" + "\n      " + "- HP total equals 5 + 5 per spell level; the Otherworldly Familiar has a number of Hit Dice [d4s] equal to the spell's level;" + "\n      " + "- The Homunculus Servant adds the spell level to any ability check or saving throw it makes;" + "\n      " + "- Damage equals 1d6 + the spell's level of Force damage.",
	joinString : "\n   "
  }],
};

// Add "Homunculus Servant" creatures, one per level
CreatureList["homunculus servant xua24a lvl 2"] = {
  name : "2nd-Lvl Homunculus Servant",
  source : [["XUA24A", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 15,
  hd : [2, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, fly 30 ft",
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
	modifiers : [2, ""],
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
CreatureList["homunculus servant xua24a lvl 3"] = {
  name : "3rd-Lvl Homunculus Servant",
  source : [["XUA24A", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 20,
  hd : [3, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, fly 30 ft",
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
	modifiers : [3, ""],
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
CreatureList["homunculus servant xua24a lvl 4"] = {
  name : "4th-Lvl Homunculus Servant",
  source : [["XUA24A", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 25,
  hd : [4, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, fly 30 ft",
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
	modifiers : [4, ""],
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
CreatureList["homunculus servant xua24a lvl 5"] = {
  name : "5th-Lvl Homunculus Servant",
  source : [["XUA24A", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 30,
  hd : [5, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, fly 30 ft",
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
	modifiers : [5, ""],
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
CreatureList["homunculus servant xua24a lvl 6"] = {
  name : "6th-Lvl Homunculus Servant",
  source : [["XUA24A", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 35,
  hd : [6, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, fly 30 ft",
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
	modifiers : [6, "Prof"],
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
CreatureList["homunculus servant xua24a lvl 7"] = {
  name : "7th-Lvl Homunculus Servant",
  source : [["XUA24A", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 40,
  hd : [7, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, fly 30 ft",
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
	modifiers : [7, ""],
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
CreatureList["homunculus servant xua24a lvl 8"] = {
  name : "8th-Lvl Homunculus Servant",
  source : [["XUA24A", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 45,
  hd : [8, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, fly 30 ft",
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
	modifiers : [8, ""],
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
CreatureList["homunculus servant xua24a lvl 9"] = {
  name : "9th-Lvl Homunculus Servant",
  source : [["XUA24A", 13]],
  size : 5,
  type : "Construct",
  alignment : "Neutral",
  ac : 13,
  hp : 50,
  hd : [9, 4],
  hdLinked : ["artificer"],
  speed : "20 ft, fly 30 ft",
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
	modifiers : [9, ""],
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

// Add Armorer Subclass
//// Need external review to make sure I didn't screw this up
RunFunctionAtEnd(function () {
  var XUA24A_Artificer_Subclass_Armorer = legacySubClassRefactor("artificer", "armorer", {
	regExpSearch: /^(?=.*armou?rer)(?!.*wizard).*$/i,
	subname : "Armorer",
	fullname : "Armorer",
	source: [["XUA24A", 8]],
	replaces: "armorer",
	spellcastingExtra: ["magic missile", "thunderwave", "mirror image", "shatter", "hypnotic pattern", "lightning bolt", "fire shield", "greater invisibility", "passwall", "wall of force"],
	attacks : [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	features: {
      "subclassfeature3": {
        name: "Tools Proficiency",
        source: [["XUA24A", 8]],
        minlevel: 3,
        description: " [proficient with Heavy Armor & Smith's Tools]\n   I can craft nonmagical & magical armor in half the normal time.",
	    toolProfs : ["Smith's tools", 1],
	    armorProfs : [false, false, true, false],
      },
      "subclassfeature3.1" : {
	    name : "Arcane Armor",
	    source : [["XUA24A", 8]],
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
	    source : [["XUA24A", 8]],
	    minlevel : 3,
	    description : desc([
		  "When I finish a rest, I can use smith's tools to change the model of my arcane armor",
		  'Select a model using the "Choose Feature" button; See "Notes" page for features of each'
	    ]),
	    additional : "also see notes page",
	    toNotesPage : [{
		  name : "Arcane Armor Model Features",
		  note : desc([
		    "I can customize my arcane armor to the Dreadnaught, Guardian, or Infiltrator model whenever I finish a Short or Long Rest, provided I have Smith's Tools in hand.",
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
		  source : [["XUA24A", 8]],
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
		  source : [["XUA24A", 8]],
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
		  source : [["XUA24A", 8]],
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
	    source : [["XUA24A", 9]],
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
	    source : [["XUA24A", 9]],
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
	"One gauntlet manifests an iron ball on a chain that can push/pull a target, a Simple Melee weapon, Armor Flail",
	"As a Bonus Action, I can increase my reach by 5 ft and become Large if I am currently smaller than Large"
  ])
  var guardianTxt = desc([
	"Both fists are Thunder Gauntlets, Simple Melee weapons that distract those hit by it",
	"As a Bonus Action while Bloodied, I can activate a defensive shield to gain my Artificer level in Temp HP"
  ])
  var guardianAdditional = levels.map(function (n) {
	return n + " Temp HP as Bonus Action while Bloodied";
  })
  var infiltratorTxt = desc([
	"+5 ft Speed; Gemlike node in fist/chest is a Simple Ranged weapon, Lightning Launcher",
	"It gives me Advantage on Dexterity (Stealth) checks"
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
	// ! extraname is not defined in this script, meaning that the original artificer was added after this script, do not delete
	if(ClassList.artificer.features["infuse item"] && !ClassList.artificer.features["infuse item"].extrachoices.extraname === "Artificer Infusion") {
		delete ClassList.artificer.features["infuse item"]; // remove the infuse item feature
	}
	else {
		// ! this is for compatability if the official script is added after this one.
		// ! This can be removed since this means that the official 2014 artificer is the one being used by the sheet.
		ClassList.artificer.features["infuse item"].minlevel = 1000; // set the minimum level to 1000 which effectively means that it will never appear til level 1000. 
	}
})
