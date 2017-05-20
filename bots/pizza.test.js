const _ = require('lodash');

const PizzaEngine = require('./pizza.engine.js');


const toppings = ['red_circle', 'mushroom', 'bell', 'tomato', 'cheese', 'hot_pepper', 'pineapple', 'chicken', 'cow2', 'pig2', 'hotdog', 'garlic', 'onion', 'olive', 'olive_black'];

const prefs = {
	scott : {
		like : ['garlic', 'onion', 'chicken'],
		hate : ['olive', 'olive_black', 'hot_pepper'],
		hunger : 5
	},
	meg : {
		like : ['red_circle', 'olive', 'chicken'],
		hate : ['pineapple'],
		hunger : 8
	},
	katie : {
		like : [],
		hate : ['pineapple'],
		hunger : 2
	}
}

const testSet1 =[
	{
		size : 'med',
		toppings: ['olive', 'onion']
	},
	{
		size : 'large',
		toppings: ['chicken', 'onion', 'garlic']
	}
];

const testSet2 =[
	{
		size : 'large',
		toppings: ['olive', 'onion']
	},
	{
		size : 'large',
		toppings: ['chicken', 'onion', 'garlic']
	}
];

//console.log(PizzaEngine.getRandomPizza(toppings));

//console.log(PizzaEngine.getPizzaSet(toppings, 10));

// console.log('Get Pizza bias');
// console.log(PizzaEngine.scorePizzas(testSet1, prefs));
// console.log(PizzaEngine.scorePizzas(testSet2, prefs));


const res = PizzaEngine.getOptimalPizzaSet(prefs)
console.log(JSON.stringify(res, null, '  '));



