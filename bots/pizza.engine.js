const _ = require('lodash');

const sizes = {
	small : 6,
	med   : 8,
	large : 10
};


const PizzaEngine = {
	getRandomPizza: (toppings, toppingCount=3)=>{
		return {
			size : _.sample(_.keys(sizes)),
			toppings: _.sampleSize(toppings, toppingCount)
		}
	},

	getPizzaSet: (toppings, slicesNeeded = 10)=>{
		let total = 0;
		let result = [];
		while(total < slicesNeeded){
			const pizza = PizzaEngine.getRandomPizza(toppings);
			total += sizes[pizza.size];
			result.push(pizza);
		}
		return result;
	},


	scorePizzaSet: (pizzas, people)=>{
		getBias = (pizzas, people)=>{
			let result = _.times(pizzas.length, ()=>{return {}});
			return _.mapValues(people, (prefs, peep)=>{
				const dispositions = _.map(pizzas, (pizza)=>{
					return _.reduce(pizza.toppings, (acc, topping)=>{
						if(acc == 0) return acc;
						if(_.includes(prefs.like, topping)) return acc + 1;
						if(_.includes(prefs.hate, topping)) return 0;
						return acc;
					},1)
				});
				const total = _.sum(dispositions);
				return _.map(dispositions, (disposition, idx)=>{
					result[idx][peep] = {
						bias : disposition,
						slicesToEat : (total ? prefs.hunger * disposition / total : 0),
						hunger : prefs.hunger
					};
					return {
						bias : disposition,
						slicesToEat : (total ? prefs.hunger * disposition / total : 0)
					};
				});
			});
			return result;
		}

		let score = 0;
		const peopleBias = getBias(pizzas, people);
		let slicesRemaining = _.map(pizzas, (pizza)=>sizes[pizza.size]);
		let hungerRemaining = _.mapValues(people, (prefs)=>prefs.hunger);

		_.each(peopleBias, (pizzaPrefs, peep)=>{
			_.each(pizzaPrefs, (pref, pizzaIdx)=>{
				// console.log('-------');
				// console.log(peep, pref, pizzaIdx);
				const slices = _.min([slicesRemaining[pizzaIdx], pref.slicesToEat])
				slicesRemaining[pizzaIdx] -= slices;
				hungerRemaining[peep] -= slices;
				score += slices*pref.bias;
				//console.log(score, slicesRemaining, hungerRemaining);
			});
		});

		//Reduce score if anyone is hungry
		score -= _.sum(_.values(hungerRemaining)) * 5;
		//Reduce score for 'wasted' pizza
		score -= _.sum(slicesRemaining) * 2
		return score;
	},

	getScoredPizzaSet : (slices, toppings, prefs)=>{
		const pizzaSet = PizzaEngine.getPizzaSet(toppings, slices);
		return {
			score : PizzaEngine.scorePizzaSet(pizzaSet, prefs),
			pizzaSet
		}
	},

	getOptimalPizzaSet : (prefs, attempts = 10)=>{
		const toppings = _.chain(prefs)
			.map((pref)=>pref.like)
			.flatten()
			.uniq()
			.value();
		const totalSlices = _.reduce(prefs, (acc, pref)=>acc+pref.hunger, 0);


		const results = _.times(attempts, ()=>PizzaEngine.getScoredPizzaSet(totalSlices, toppings, prefs));

		return _.sortBy(results, (res)=>-res.score);





	}



};



module.exports = PizzaEngine