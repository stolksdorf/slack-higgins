const _ = require('lodash');

const sizes = {
	small : 6,
	med   : 8,
	large : 12
};


const PizzaEngine = {
	getRandomPizza: (toppings, toppingCount=3)=>{
		return {
			size : _.sample(_.keys(sizes)),
			toppings: _.sampleSize(toppings, toppingCount)
		}
	},

	getPizzaSet: (toppings, slices = 0)=>{
		let total = 0;
		let result = [];
		while(total < slices){
			const pizza = PizzaEngine.getRandomPizza(toppings);
			total += sizes[pizza.size];
			result.push(pizza);
		}
		return result;
	},


	scorePizza: (pizza, prefs)=>{
		//for each person
			//find pizza pref,
			//eat relative number of slices
			//points per slice eaten
			//

	},



};



module.exports = PizzaEngine