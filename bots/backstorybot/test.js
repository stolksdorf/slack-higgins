const _ = require('lodash')
const Backstory = require('./backstory.js');


const Stats = require('./stats.js');
const Classes = require('./classes.js');
const Life = require('./life.js')
const Supp = require('./supplements.js');
const People = require('./people.js')


_.times(1, ()=>{
	//console.log(Backstory.birthplace());
	//console.log(Stats.pointBuy());
	//console.log(Classes.barbarian());
	console.log(Life.events());
	//console.log(Supp.status());
	//console.log(People.family('Tiefling'));
})