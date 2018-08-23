const MARKOV_DEPTH = 6;
const getWeightedRandom = (weights={}, total=0)=>{
	const rand = Math.random() * total;
	let current = 0;
	return Object.keys(weights).find((key)=>{
		current += weights[key];
		return current >= rand;
	});
};
const trim = (key)=>(key.length > MARKOV_DEPTH ? key.slice(-MARKOV_DEPTH) : key);
const END = '¶';
module.exports = {
	updateMapping : (msgs, existingMapping)=>{
		const res = existingMapping || {msgs:0, letters:0, totals: {}, weights: {}};
		const encodeMsg = (msg)=>{
			if(!msg) return;
			const letters = `${msg}${END}`.split('');
			res.letters += letters.length;
			let key = '';
			letters.map((letter)=>{
				res.totals[key]  = (res.totals[key] || 0) + 1;
				if(!res.weights[key]) res.weights[key] = {};
				res.weights[key][letter] = (res.weights[key][letter] || 0) + 1;
				key = trim(`${key}${letter}`);
			});
		};
		msgs.map(encodeMsg);
		res.msgs += msgs.length;
		return res;
	},
	genMessage : (mapping)=>{
		const addLetter = (result='')=>{
			const key = trim(result);
			const letter = getWeightedRandom(mapping.weights[key], mapping.totals[key]);
			if(!letter || letter == END) return result;
			return addLetter(result + letter);
		};
		return addLetter();
	}
};