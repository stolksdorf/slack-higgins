const _ = require('lodash');

const PizzaEngine = require('./pizza.engine.js');


const toppings = ['red_circle', 'mushroom', 'bell', 'tomato', 'cheese', 'hot_pepper', 'pineapple', 'chicken', 'cow2', 'pig2', 'hotdog', 'garlic', 'onion', 'olive', 'olive_black'];

const prefs = {
	scott : {
		like : ['garlic', 'onions', 'chicken'],
		hate : ['olive', 'olive_black', 'hot_pepper', 'mushrooms'],
		hunger : 6
	},
	carly : {
		like : ['pineapple', 'chicken', 'garlic', 'red pepper', 'goat cheese'],
		hate : ['ham', 'olives'],
		hunger : 2
	},
	lp : {
		like : ['garlic', 'red pepper', 'goat cheese', 'onions', 'chicken'],
		hate : ['olives', 'pepperoni', 'ham', 'tomato'],
		hunger : 4
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

console.time('test')
const res = PizzaEngine.getOptimalPizzaSet(prefs, 100)
console.log(JSON.stringify(res, null, '  '));
console.timeEnd('test');


