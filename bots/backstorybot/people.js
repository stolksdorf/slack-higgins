const _ = require('lodash');
const utils = require('./utils');
const d = utils.d;

const Supplement = require('./supplements.js');

const People = {
	family : (race='Human')=>{
		const familyName = Supplement.familyName(race);
		const lifestyle = Supplement.lifestyle();
		return {
			mother : People.person({
				absent : People.childhood.absentParent(),
				gender : 'Female',
				race,
				familyName
			}),
			father : People.person({
				absent : People.childhood.absentParent(),
				gender : 'Male',
				race,
				familyName
			}),
			siblings : People.siblings(race, familyName),
			birthplace : People.birthplace(),
			raisedBy : People.childhood.raisedBy(),
			lifestyle,
			home : People.childhood.home(lifestyle),
			memory : People.childhood.memory()
		}

	},
	childhood : {
		absentParent : ()=>{
			if(_.random(1, 100) < 96) return false;
			return _.sample([
				`Your parent died. Cause of death: ${Supplement.death()}`,
				`Your parent was imprisoned, enslaved, or otherwise taken away.`,
				`Your parent abandoned you.`,
				`Your parent disappeared to an unknown fate.`
			]);
		},
		birthOrder : ()=>{
			return utils.chart(d('2d6'), {
				'2' : `Twin, triplet, or quadruplet`,
				'3—7' : `Older`,
				'8—12' : `Younger`
			});
		},
		home : (lifestyle)=>{
			const lifestyleChart = {
				'Wretched' :  -40,
				'Squalid' :  -20,
				'Poor' :  -10,
				'Modest' :  0,
				'Comfortable' :  10,
				'Wealthy' :  20,
				'Aristocratic' :  40
			};
			const lifestyleMod = lifestyleChart[lifestyle] || 0;
			return utils.chart(d('1d100') - lifestyleMod, {
				'0' : `On the streets`,
				'l—20' : `Rundown shack`,
				'21—30' : `No permanent residence; you moved around a lot`,
				'31—40' : `Encampment or village in the wilderness`,
				'41—50' : `Apartment in a rundown neighborhood`,
				'51-70' : `Small house`,
				'71-90' : `Large house`,
				'91—110' : `Mansion`,
				'111-9999' : `Palace or castle`,
			})
		},
		memory : ()=>{
			return utils.chart(d('3d6'), {
				'3 or lower' : `I am still haunted by my childhood, when I was treated badly by my peers.`,
				'4—5' : `I spent most of my childhood alone, with no close friends.`,
				'6—8' : `Others saw me as being diiferent or strange, and so I had few companions.`,
				'9—12' : `I had a few close friends and lived an ordinary childhood.`,
				'13—15' : `I had several friends, and my childhood was generally a happy one.`,
				'16—17' : `I always found it easy to make Friends, and I loved being around people.`,
				'18' : `Everyone knew who I was, and I had friends everywhere I went.`
			});
		},
		raisedBy : ()=>{
			return utils.chart(d('1d100'), {
				'01' : `No one`,
				'02' : `An Institution, such as an asylum`,
				'03' : `A Temple`,
				'04—05' : `An Orphanage`,
				'06—07' : `A Guardian`,
				'08—15' : `A Paternal or maternal aunt, uncle, or both; or extended family such as a tribe or clan`,
				'16—25' : `A Paternal or maternal grandparent(s)`,
				'26—35' : `An Adoptive family (same or different race)`,
				'36—55' : `A Single father or stepfather`,
				'56—75' : `A Single mother or stepmother`,
				'76—00' : `Your Mother and father`
			})
		}
	},

	birthplace : ()=>{
		return utils.chart(d('1d100'), {
			'01—50': `Home`,
			'51—55': `Home of a family friend`,
			'56—63': `Home of a healer or midwife`,
			'64—65': `Carriage, cart, or wagon`,
			'66—68': `Barn, shed, or other outbuilding`,
			'69—70': `Cave`,
			'71—72': `Field`,
			'73—74': `Forest`,
			'75—77': `Temple`,
			'78'   : `Battlefield`,
			'79—80': `Alley or street`,
			'81—82': `Brothel, tavern, or inn`,
			'83—84': `Castle, keep, tower, or palace`,
			'85'   : `Sewer or rubbish heap`,
			'86—88': `Among people of a different race`,
			'89—9l': `On board a boat or a ship`,
			'92—93': `In a prison or in the headquarters of a secret organization`,
			'94—95': `In a sage's laboratory`,
			'96'   : `In the Feywild`,
			'97'   : `in the Shadowfell`,
			'98'   : `On the Astral Plane or the Ethereal Plane`,
			'99'   : `On an Inner Plane of your choice`,
			'00'   : `On an Outer Plane of your choice`
		});
	},

	siblings : (race, familyName)=>{
		let roll = d('1d10');
		if(race == 'Elf' || race == 'Dwarf') roll -= 2;
		const count = utils.chart(roll, {
			'2' : 0,
			'3-4' : ()=>d('1d3'),
			'5-6' : ()=>d('1d4') + 1,
			'7-8' : ()=>d('1d6') + 2,
			'9-10' : ()=>d('1d8') + 3,
		});
		return _.times(count, ()=>{
			return People.person({
				race, familyName,
				birthOrder : People.childhood.birthOrder()
			});
		});
	},

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

	description : (p)=>{
		return `${p.name} ${p.familyName}. A ${p.gender} ${p.race} ${p.occupation}. ${p.status}; ${p.alignment}; Relationship: ${p.relationship}.`
	}
};

module.exports = People;