const _ = require('lodash');
const Supplements = require('./supplements.js')
const People = require('./people.js')
const Life = require('./life.js')


module.exports = {
	Supplements,
	People,
	Life,
	npc : (race, gender)=>{
		const peep = People.person({race, gender});
		peep.event = Life.event();
		return peep
	}
}
