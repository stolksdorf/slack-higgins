const _ = require('lodash');
const utils = require('./utils');
const d = utils.d;

const Supplement = require('./supplements.js');
const Childhood = require('./childhood.js');

const People = {

	person : (defaults = {}, toString=false)=>{
		defaults.gender     = defaults.gender || Supplement.gender();
		defaults.race       = defaults.race || Supplement.race();
		defaults.familyName = defaults.familyName || Supplement.familyName(defaults.race);

		const newPerson = Object.assign({
			name         : Supplement.name(defaults.gender, defaults.race),
			occupation   : Supplement.occupation(),
			alignment    : Supplement.alignment(),
			status       : Supplement.status(),
			relationship : Supplement.relationship(),
		}, defaults);

		if(toString) return People.description(newPerson);
		return newPerson;
	},
	//TODO: remove
	// npc : (race, gender)=>{
	// 	const peep = People.person({race, gender});
	// 	peep.event = Life.event();
	// 	return peep;
	// },

	//Maybe bump into person
	description : (p)=>{
		return `${p.name} ${p.familyName}. A ${p.gender} ${p.race} ${p.occupation}. ${p.status}; ${p.alignment}; Relationship: ${p.relationship}.`;
	},

	family : (race='Human', family)=>{
		const familyName = family || Supplement.familyName(race);
		const lifestyle = Supplement.lifestyle();
		return {
			mother : People.person({
				absent : Childhood.absentParent(),
				gender : 'Female',
				race,
				familyName
			}),
			father : People.person({
				absent : Childhood.absentParent(),
				gender : 'Male',
				race,
				familyName
			}),
			siblings   : People.siblings(race, familyName),
			birthplace : Childhood.birthplace(),
			raisedBy   : Childhood.raisedBy(),
			home       : Childhood.home(lifestyle),
			memory     : Childhood.memory(),
			lifestyle,
		};
	},
	siblings : (race, familyName)=>{
		let roll = d('1d10');
		if(race == 'Elf' || race == 'Dwarf') roll -= 2;
		const count = utils.chart(roll, {
			'2'    : 0,
			'3-4'  : ()=>d('1d3'),
			'5-6'  : ()=>d('1d4') + 1,
			'7-8'  : ()=>d('1d6') + 2,
			'9-10' : ()=>d('1d8') + 3,
		});
		return _.times(count, ()=>{
			return People.person({
				race, familyName,
				birthOrder : Childhood.birthOrder()
			});
		});
	},

};

module.exports = People;