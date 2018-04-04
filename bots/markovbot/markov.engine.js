const MARKOV_DEPTH = 6;
const getWeightedRandom = (weights={}, total=0)=>{
	const rand = Math.floor(Math.random() * total);
	let current = 0;
	return Object.keys(weights).find((key)=>{
		current += weights[key];
		return current >= rand;
	});
};
const trim = (key)=>(key.length > MARKOV_DEPTH ? key.slice(-MARKOV_DEPTH) : key);
const END = '¶';
module.exports = {
	updateMapping : (msgs, existingMapping={count:0, totals: {}, weights: {}})=>{
		const res = existingMapping;
		const encodeMsg = (msg)=>{
			if(!msg) return;
			const letters = `${msg}${END}`.split('');
			let key = '';
			letters.map((letter)=>{
				res.totals[key]  = (res.totals[key] || 0) + 1;
				if(!res.weights[key]) res.weights[key] = {};
				res.weights[key][letter] = (res.weights[key][letter] || 0) + 1;
				key = trim(`${key}${letter}`);
			});
		};
		msgs.map(encodeMsg);
		res.count += msgs.length;
		return res;
	},
	getMessage : (mapping)=>{
		const addLetter = (result='')=>{
			const key = trim(result);
			const letter = getWeightedRandom(mapping.weights[key], mapping.totals[key]);
			if(!letter || letter == END) return result;
			return addLetter(result + letter);
		};
		return addLetter();
	}
};