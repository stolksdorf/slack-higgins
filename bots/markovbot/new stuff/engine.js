const map    = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);


const MARKOV_DEPTH = 6;

const END = '¶';
const SEQ_DIV = '⇢';
const WEIGHT_DIV = '˲';
const VAL_DIV = '।';

const weightedRandom = (weights={}, total=0)=>{
	const rand = Math.floor(Math.random() * total);
	let current = 0;
	const keys = Object.keys(weights);
	if(keys.length == 1) return keys[0]
	return keys.find((key)=>{
		const passes = current >= rand;
		current += weights[key];
		return passes;
	});
};
const trim = (key)=>(key.length > MARKOV_DEPTH ? key.slice(-MARKOV_DEPTH) : key);

const mergeWeights = (weights1={}, weights2={})=>{
	return reduce(weights2, (acc, weight, letter)=>{
		acc[letter] = (acc[letter] ? acc[letter] : 0) + weight;
		return acc;
	}, weights1);
}

const encodeFragment = (seq, weights)=>{
	return `${seq}${SEQ_DIV}${map(weights, (w,l)=>`${l}${VAL_DIV}${w}`).join(WEIGHT_DIV)}`;
};
const decodeFragment = (line)=>{
	const [seq, data] = line.split(SEQ_DIV);
	return data.split(WEIGHT_DIV).reduce((acc, field)=>{
		const [letter, weight] = field.split(VAL_DIV);
		acc.total += Number(weight);
		acc.weights[letter] = Number(weight);
		return acc;
	}, {
		seq,
		total : 0,
		weights : {}
	});
};

const extendMapping = (seq, weights, mapping='')=>{
	const entry = findEntry(mapping, seq);
	if(entry){
		return mapping.substr(0, entry.start)
			+ encodeFragment(seq, mergeWeights(entry.weights, weights))
			+ mapping.substr(entry.end)
	}

	return (mapping?(mapping+'\n'):'') + encodeFragment(seq, weights);
}


const findEntry = (mapping, sequence)=>{
	if(!mapping) return false;
	const line = (new RegExp(`^${sequence}${SEQ_DIV}(.*)`, 'm')).exec(mapping);
	if(!line) return false;
	return Object.assign(decodeFragment(line[0]), {
		start : line.index,
		end   : line.index + line[0].length
	})
};

//TODO: re-work for multiple depths?
const generateFragments = (msg)=>{
	let frags = {};
	(msg+END).split('').reduce((seq, letter)=>{
		frags[seq] = frags[seq] || {};
		frags[seq][letter] = frags[seq][letter]
			? frags[seq][letter] + 1
			: 1;
		return trim(seq + letter);
	}, '')
	return frags;
};


const generateMessage = (mapping)=>{
	const addLetter = (msg='')=>{
		const sequence = trim(msg);
		const entry = findEntry(mapping, sequence);
		if(!entry) return msg;
		const letter = weightedRandom(entry.weights, entry.total);
		if(!letter || letter == END) return msg;
		return addLetter(msg + letter);
	};
	return addLetter();
};


module.exports = {
	findEntry,
	weightedRandom,
	mergeWeights,


	generateFragments,
	generateMessage,
	extendMapping,
}