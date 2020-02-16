const END = '¶';

const sum = (arr)=>arr.reduce((x,y)=>x+y,0);
const truncate = (str, depth)=>(str.length > depth ? str.slice(-depth) : str);

const weightedRandom = (weights={})=>{
	const keys = Object.keys(weights);
	if(keys.length == 1) return keys[0];
	const total = sum(Object.values(weights));
	const rand = Math.floor(Math.random() * total) + 1;
	let threshold = 0;
	return keys.find((key)=>{
		threshold += weights[key];
		return rand <= threshold;
	});
};

const encode = (mapping={}, message, depth=6)=>{
	(message + END).split('').reduce((partial, letter)=>{
		const key = truncate(partial, depth);
		mapping[key] = mapping[key] || {};
		mapping[key][letter] = (mapping[key][letter] || 0) + 1;
		return partial + letter;
	}, '')
	return mapping;
};

const generate = (mapping, depth=6)=>{
	const addLetter = (msg='')=>{
		const key = truncate(msg, depth);
		const letter = weightedRandom(mapping[key]);
		if(typeof letter === 'undefined' || letter == END) return msg;
		return addLetter(msg + letter);
	};
	return addLetter();
};

module.exports = {
	encode,
	generate,
	truncate
};

