const _ = require('lodash');
const utils = require('./utils');
const d = utils.d;

const Supplement = require('./supplements.js');
const People = require('./people.js');
const Life = require('./life.js');


const Characters = {
	npc : (race, gender)=>{
		const peep = People.person({race, gender});
		peep.event = Life.event();
		return peep;
	}


};

module.exports = Characters;