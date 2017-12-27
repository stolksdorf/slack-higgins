const _ = require('lodash');
const utils = require('./utils');


const classes = {
	barbarian : ()=>{
		return {
			class : 'Barbarian',
			subclass : _.sample(['Path of the Ancestral Guardian','Path of the Battlerager','Path of the Berserker','Path of the Storm Herald','Path of the Totem Warrior','Path of the Zealot']),
			origin : `I became a barbarian because ${_.sample([
				`My devotion to my people lifted me in battle, making me powerful and dangerous.`,
				`The spirits of my ancestors called on me to carry out a great task.`,
				`I lost control in battle one day, and it was as if something else was manipulating my body, forcing it to kill every foe I could reach.`,
				`I went on a spiritual journey to find myself and instead found a spirit animal to guide, protect, and inspire me.`,
				`I was struck by lightning and lived. Afterward, I found a new strength within me that let me push beyond my limitations.`,
				`My anger needed to be channeled into battle, or I risked becoming an indiscriminate killer.`
			])}`,
			details : {
				totem : _.sample([
					`A tuft offur from a solitary wolf that you befriended during a hunt`,
					`Three eagle feathers given to you by a wise shaman, who told you they would play a role in determining your fate`,
					`A necklace made from the claws of a young cave bear that you slew single-handedly as a child`,
					`A small leather pouch holding three stones that represent your ancestors`,
					`A few small bones from the first beast you killed, tied together with colored wool`,
					`An egg-sized stone in the shape of your spirit animal that appeared one day in your belt pouch`,
				]),
				tattoo : _.sample([
					`The wings ofan eagle are spread wide across your upper back.`,
					`Etched on the backs ofyour hands are the paws of a cave bear.`,
					`The symbols of your clan are displayed in viny patterns along your arms. `,
					`The antlers of an elk are inked across your back.`,
					`Images of your spirit animal are tattooed along your weapon arm and hand.`,
					`The eyes of a wolf are marked on your back to help you see and ward off evil spirits.`,
				]),
				superstition : _.sample([
					`If you disturb the bones ofthe dead, you inherit all the troubles that plagued them in life.`,
					`Never trust a wizard. They’re all devils in disguise, especially the friendly ones.`,
					`Dwarves have lost their spirits, and are almost like the undead. That's why they live underground.`,
					`Magical things bring trouble. Never sleep with a magic object within ten feet of you.`,
					`When you walk through a graveyard, be sure to wear silver, or a ghost might jump into your body.`,
					`If an elf looks you in the eyes, she’s trying to read your thoughts.`,
				])
			}
		}
	},
	bard : ()=>{
		return {
			class : 'Bard',
			subclass : _.sample(['College of Glamour','College of Lore','College of Satire','College of Swords','College of Valor','College of Whispers']),
			details : {
				definingWork : _.sample([
					`"The Three Flambinis", a ribald song concerning mistaken identities and unfettered desire`,
					`"Waltz of the Myconids", an upbeat tune that children in particular enjoy`,
					`"Asmodeus's Golden Arse", a dramatic poem you claim was inspired by your personal visit to Avernus`,
					`"The Pirates of Luskan", your firsthand account of being kidnapped by sea reavers as a child`,
					`"A Hoop, Two Pigeons", and a Hell Hound," a subtle parody of an incompetent noble`,
					`"A Fool in the Abyss", a comedic poem about a jester's travels among demons`
				]),
				instrument : _.sample([
					`A masterfully crafted halfling fiddle`,
					`A mithral horn made by elves`,
					`A zither made with drow spider silk`,
					`An orcish drum`,
					`A wooden bullywug croak box`,
					`A tinker’s harp ofgnomish design`
				]),
				embarrassment : _.sample([
					`The time when your comedic song, "Big Tom's Hijinks" — which, by the way, you thought was brilliant — did not go over well with Big Tom`,
					`The matinee performance when a circus's owlbear got loose and terrorized the crowd`,
					`When your opening song was your enthusiastic but universally hated rendition of "Song of the Froghemoth"`,
					`The first and last public performance of "Mirt, Man about Town"`,
					`The time on stage when your wig caught fire and you threw it down——which set fire to the stage`,
					`When you sat on your lute by mistake during the final stanza of "Starlight Serenade"`
				])
			}
		}
	},
	cleric : ()=>{
		return {
			class : 'Cleric',
			subclass : _.sample(['Arcana Domain','Death Domain','Forge Domain','Grave Domain','Knowledge Domain','Life Domain','Light Domain','Nature Domain','Protection Domain','Tempest Domain','Trickery Domain','War Domain']),
			origin : '',
			details : {}
		}
	},
	druid : ()=>{
		return {
			class : 'Druid',
			subclass : _.sample(['Circle of Dreams','Circle of the Land','Circle of the Moon','Circle of the Shepherd','Circle of Twilight']),
			origin : '',
			details : {}
		}
	},
	fighter : ()=>{
		return {
			class : 'Fighter',
			subclass : _.sample(['Arcane Archer','Purple Dragon Knight','Battle Master','Cavalier','Champion','Eldritch Knight','Knight','Monster Hunter','Samurai','Scout','Sharpshooter']),
			origin : '',
			details : {}
		}
	},
	monk : ()=>{
		return {
			class : 'Monk',
			subclass : _.sample(['Way of the Drunken Master','Way of the Four Elements','Way of the Kensei','Way of the Long Death','Way of the Open Hand','Way of Shadow','Way of the Sun Soul','Way of Tranquility']),
			origin : '',
			details : {}
		}
	},
	paladin : ()=>{
		return {
			class : 'Paladin',
			subclass : _.sample(['Oath of the Ancients','Oath of Conquest','Oath of the Crown','Oath of Devotion','Oath of Redemption','Oath of Treachery','Oath of Vengeance','Oathbreaker']),
			origin : '',
			details : {}
		}
	},
	ranger : ()=>{
		return {
			class : 'Ranger',
			subclass : _.sample(['Beast Master','Gloom Stalker','Horizon Walker','Hunter','Monster Slayer','Primeval Guardian']),
			origin : '',
			details : {}
		}
	},
	rogue : ()=>{
		return {
			class : 'Rogue',
			subclass : _.sample(['Arcane Trickster','Assassin','Inquisitive','Mastermind','Scout','Swashbuckler','Thief']),
			origin : '',
			details : {}
		}
	},
	sorcerer : ()=>{
		return {
			class : 'Sorcerer',
			subclass : _.sample(['Divine Soul','Draconic Bloodline','Phoenix Sorcery','Sea Sorcery','Shadow Magic†','Stone Sorcery','Storm Sorcery‡','Wild Magic']),
			origin : '',
			details : {}
		}
	},
	warlock : ()=>{
		return {
			class : 'Warlock',
			subclass : _.sample(['The Archfey','The Celestial','The Fiend','The Great Old One','The Hexblade','The Raven Queen','The Seeker','The Undying']),
			origin : '',
			details : {}
		}
	},
	wizard : ()=>{
		return {
			class : 'Wizard',
			subclass : _.sample(['Artificer','Bladesinging','Lore Mastery','School of Abjuration','School of Conjuration','School of Divination','School of Enchantment','School of Evocation','School of Illusion','School of Necromancy','School of Transmutation','Theurgy','War Magic']),
			origin : '',
			details : {}
		}
	},

}


module.exports = Object.assign({
	random(){
		return classes[_.sample(Object.keys(classes))]();
	}
},classes)