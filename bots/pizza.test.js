const _ = require('lodash');

const PizzaEngine = require('./pizza.engine.js');


const toppings = [
	'red_circle',
	'mushroom',
	'bell',
	'tomato',
	'cheese',
	'hot_pepper',
	'pineapple',
	'chicken',
	'cow2',
	'pig2',
	'hotdog',

	'garlic',
	'onion',
	'olive',
	'olive_black'
];

const prefs = {
	scott : {
		like : ['garlic', 'onion', 'chicken'],
		hate : ['olive', 'olive_black', 'hot_pepper'],
		hunger : 4
	},
	meg : {
		like : ['red_circle', 'olive', 'chicken'],
		hate : ['onion', 'pineapple'],
		hunger : 8
	}
}

const testpizza1={
	size : 'med',
	toppings: ['olive', 'onion']
}
const testpizza2={
	size : 'large',
	toppings: ['chicken', 'onion', 'garlic']
}

console.log(PizzaEngine.getRandomPizza(toppings));

console.log(PizzaEngine.getPizzaSet(toppings, 10));



