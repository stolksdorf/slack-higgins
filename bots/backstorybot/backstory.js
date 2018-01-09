const _ = require('lodash');
const Supplement = require('./supplements.js')
const People = require('./people.js')
const Life = require('./life.js')
const Class = require('./classes.js');
const Background = require('./background.js');


module.exports = {
	Supplement,
	People,
	Life,
	Class,
	Background,
	//TODO: move out
	npc : (race, gender)=>{
		const peep = People.person({race, gender});
		peep.event = Life.event();
		return peep
	},
	character : (defaults = {})=>{
		defaults.gender     = defaults.gender || Supplement.gender();
		defaults.race       = defaults.race || Supplement.race();
		defaults.familyName = defaults.familyName || Supplement.familyName(defaults.race);
		defaults.class      = defaults.class ? Class.get(defaults.class) : Class.random();
		defaults.background = defaults.background ? Background.get(defaults.background) : Background.random();

		defaults.age = 25;

		return Object.assign({
			name      : Supplement.name(defaults.gender, defaults.race),
			alignment : Supplement.alignment(),
			events : Life.eventsByAge(defaults.age),
			family : People.family(defaults.race, defaults.familyName),
		}, defaults)
	}
}
