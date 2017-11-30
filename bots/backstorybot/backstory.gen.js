const _ = require('lodash');





const rand = (num, map)=>{
	const res = _.find(map, (item)=>{
		let [key, val] = item;
		if(key.indexOf('—') !== -1) key = key.split('—')[1];
		if(key == '00') key = 100;
		key = parseInt(key);
		return num <= key
	})[1];
	return (typeof res == 'function')
		? res ()
		: res;
};

const d = (diceString)=>{
	const [count, size] = diceString.split('d');
	return _.sum(_.times(count, ()=>_.random(1, size)));
}


const gen = {};

gen.birthplace = ()=>{
	return rand(d('1d100'), [
		['01—50', `Home`],
		['51—55', `Home of a family friend`],
		['56—63', ()=>_.sample([`Home of a healer`, `Home of a midwife`])],
		['64—65', ()=>_.sample([`Carriage`, `Cart`, `Wagon`])],
		['66—68', ()=>_.sample([`Barn`, `shed`])],
		['69—70', `Cave`],
		['71—72', `Field`],
		['73—74', `Forest`],
		['75—77', `Temple`],
		['78', `Battlefield`],
		['79—80', ()=>_.sample([`Alley`, `Street`])],
		['81—82', ()=>_.sample([`Brothel`, `Tavern`, `Inn`])],
		['83—84', ()=>_.sample([`Castle`, `keep`, `tower`,`palace`])],
		['85', ()=>_.sample([`Sewer`,`rubbish heap`])],
		['86—88', `Among people of a difierent race`],
		['89—9l', ()=>_.sample([`On board a boat`,`a ship`])],
		['92—93', ()=>_.sample([`In a prison`, `in the headquarters of a secret organization`])],
		['94—95', `In a sage’s laboratory`],
		['96', `In the Feywild`],
		['97', `in the Shadowfell`],
		['98', ()=>_.sample([`On the Astral Plane`, `the Ethereal Plane`])],
		['99', `On an Inner Plane of your choice`],
		['00', `On an Outer Plane of your choice`],
	])
};


gen.siblings = (race)=>{
	const getSiblingCount = ()=>{
		const roll = d('1d10');
		if(race == 'elf') race -= 2;
		if(race == 'dwarf') race -= 2;

		return rand(roll, [
			['1—2', 0],
			['3—4', ()=>d('1d3') ],
			['5—6', ()=>d('1d4') + 1],
			['7—8', ()=>d('1d6') + 2],
			['9—10', ()=>d('1d3') + 3],
		]);
	};
}


gen.alignment = ()=>{
	return rand(d('3d6'), [
		['3', ()=>_.sample(['Chaotic evil', 'Chaotic neutral'])],
		['4—5', 'Lawful evil'],
		['6—8', 'Neutral evil'],
		['9—12', 'Neutral'],
		['13-15', 'Neutral good'],
		['16—17', ()=>_.sample(['Lawful good', 'Lawful neutral'])],
		['18', ()=>_.sample(['Chaotic good', 'Chaotic neutral'])],
	]);
}

gen.occupation = ()=>{
	return rand(d('1d100'), [
		['01—05', 'Academic'],
		['06—10', 'Adventurer (roll on the Class table)'],
		['11', 'Aristocrat'],
		['12—26', ()=>_.sample(['Artisan', 'Guild member'])],
		['27—31', 'Criminal'],
		['32—36', 'Entertainer'],
		['37—38', ()=>_.sample(['Exile', 'hermit', 'Refugee'])],
		['39—43', ()=>_.sample(['Explorer', 'Wanderer'])],
		['44—55', ()=>_.sample(['Farmer', 'Herder'])],
		['56—60', ()=>_.sample(['Hunter', 'Trapper'])],
		['61—75', 'Laborer'],
		['76—80', 'Merchant'],
		['81—35', ()=>_.sample(['Politician', 'Bureaucrat'])],
		['86—90', 'Priest'],
		['91—95', 'Sailor'],
		['96—00', 'Soldier'],
	]);
}


module.exports = gen;