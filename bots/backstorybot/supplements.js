const _ = require('lodash');
const utils = require('./utils');
const d = utils.d;

const Names = require('./names.js');


const Supplement= {
	races : [`Human`,`Dwarf`,`Elf`,`Halfling`,`Dragonborn`,`Gnome`,`Half-Elf`,`Half-Orc`,`Tiefling`],
	classes : [`Barbarian`,`Bard`,`Cleric`,`Druid`,`Fighter`,`Monk`,`Paladin`,`Ranger`,`Rogue`,`Sorcerer`,`Warlock`,`Wizard`],

	familyName : (race)=>Names.familyName(race),
	name : (gender, race)=>Names.name(gender, race),


	gender : ()=>_.sample(['Male', 'Female']),
	age : (race)=>{
		const chart = {
			'Dwarf'    : 40 + d('3d6'),
			'Elf'      : 10 + d('4d6'),
			'Gnome'    : 40 + d('4d6'),
			'Half-elf' : 20 + d('1d6'),
			'Half-orc' : 14 + d('1d4'),
			'Halfling' : 20 + d('2d4'),
			'Human'    : 15 + d('1d4')
		};
		return chart[race] || chart.Human;
	},
	alignment : ()=>{
		return utils.chart(d('3d6'), {
			'3'     : ()=>_.sample(['Chaotic evil', 'Chaotic neutral']),
			'4-5'   : 'Lawful Evil',
			'6-8'   : 'Neutral Evil',
			'9-12'  : 'True Neutral',
			'13-15' : 'Neutral Good',
			'16—17' : ()=>_.sample(['Lawful good', 'Lawful neutral']),
			'18-19' : ()=>_.sample(['Chaotic good', 'Chaotic neutral']),
		})
	},
	death : ()=>{
		return utils.chart(d('1d12'), {
			'1' : `Unknown`,
			'2' : `Murdered`,
			'3' : `Killed in battle`,
			'4' : `Accident related to class or occupation`,
			'5' : `Accident unrelated to class or occupation`,
			'6—7' : `Natural causes, such as disease or old age`,
			'8' : `Apparent suicide`,
			'9' : `Torn apart by an animal or a natural disaster`,
			'10' : `Consumed by a monster`,
			'll' : `Executed for a crime or tortured to death`,
			'12' : `Bizarre event, such as being hit by a meteorite, struck down by an angry god, or killed by a hatching slaad egg`,
		});
	},
	class : ()=>{
		return utils.chart(d('1d100'), {
			'01—07' : `Barbarian`,
			'08—14' : `Bard`,
			'15—29' : `Cleric`,
			'30—36' : `Druid`,
			'37—52' : `Fighter`,
			'53—58' : `Monk`,
			'59—64' : `Paladin`,
			'65—70' : `Ranger`,
			'71—84' : `Rogue`,
			'85—89' : `Sorcerer`,
			'90—94' : `Warlock`,
			'95—00' : `Wizard`,
		});
	},
	occupation : ()=>{
		return utils.chart(d('1d100'), {
			'01—05' : `Academic`,
			'06—10' : ()=>`${Supplement.class()} Adventurer`,
			'11'    : `Aristocrat`,
			'12—26' : _.sample(['Artisan', 'Guild member']),
			'27—31' : `Criminal`,
			'32—36' : `Entertainer`,
			'37—38' : _.sample(['Exile', 'Hermit', 'Refugee']),
			'39—43' : _.sample(['Explorer', 'Wanderer']),
			'44—55' : _.sample(['Farmer', 'Herder']),
			'56—60' : _.sample(['Hunter', 'Trapper']),
			'61—75' : `Laborer`,
			'76—80' : `Merchant`,
			'81—35' : _.sample(['Politician', 'Bureaucrat']),
			'86—90' : `Priest`,
			'91—95' : `Sailor`,
			'96—00' : `Soldier`
		});
	},
	race : ()=>{
		return utils.chart(d('1d100'), {
			'01—40' : `Human`,
			'41—50' : `Dwarf`,
			'51—60' : `Elf`,
			'61—70' : `Halfling`,
			'71—75' : `Dragonborn`,
			'76—80' : `Gnome`,
			'31—35' : `Half-Elf`,
			'86—90' : `Half-Orc`,
			'9l—95' : `Tiefling`,
			'96—00' : `{DM's choice}`
		});
	},
	relationship : ()=>{
		return utils.chart(d('3d4'), {
			'3—4' : `Hostile`,
			'5—10' : `Friendly`,
			'11—12' : `Indifferent`
		});
	},
	lifestyle : ()=>{
		return utils.chart(d('3d6'), {
			'3' : `Wretched`,
			'4—5' : `Squalid`,
			'6—8' : `Poor`,
			'9—12' : `Modest`,
			'13—15' : `Comfortable`,
			'16—17' : `Wealthy`,
			'18' : `Aristocratic`,
		});
	},
	status : ()=>{
		return utils.chart(d('3d6'), {
			'3' : ()=>`Dead. Cause of Death: ${Supplement.death()}.`,
			'4—5' : `Missing or unknown`,
			'6—8' : `Alive, but doing poorly due to ${_.sample(['injury', 'financial trouble','relationship difficulties'])}`,
			'9—12' : `Alive and well`,
			'l3—l5' : `Alive and quite successful`,
			'16—l7' : `Alive and infamous`,
			'18' : `Alive and famous`
		});
	}
}

module.exports = Supplement;