const map    = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);


const MARKOV_DEPTH = 6;

const END = '¶';
const SEQ_DIV = '⇢';
const WEIGHT_DIV = '˲';
const VAL_DIV = '।';


const trim = (key)=>(key.length > MARKOV_DEPTH ? key.slice(-MARKOV_DEPTH) : key);


const utils = {


};


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


const addFragmentToMapping = (mapping='', seq, weights)=>{
	const entry = findEntry(mapping, seq);
	if(entry){
		return mapping.substr(0, entry.start)
			+ encodeFragment(seq, mergeWeights(entry.weights, weights))
			+ mapping.substr(entry.end)
	}

	return (mapping?(mapping+'\n'):'') + encodeFragment(seq, weights);
};

const findEntry = (mapping, sequence)=>{
	if(!mapping) return false;
	const start = mapping.indexOf(`${sequence}${SEQ_DIV}`);
	if(start === -1) return false;
	let end = mapping.indexOf('\n', start);
	if(end === -1) end = mapping.length;
	const line = mapping.substring(start, end);
	return Object.assign(decodeFragment(line), {
		start,end
	});
};

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

///////////////////////

const extendMapping = (mapping='', fragments={})=>{
	return reduce(fragments, (acc, weights, seq)=>{
		return addFragmentToMapping(acc, seq, weights);
	}, mapping);
}

const mergeFragments = (frags1, frags2)=>{
	return frags2.reduce((acc , weights, seq)=>{
		if(acc[seq]){
			acc[seq] = mergeWeights(acc[seq], weights);
		}else{
			acc[seq] = weights;
		}
		return acc;
	}, frags1);
};

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
	utils : {
		encodeFragment,
		decodeFragment,
		findEntry,
		weightedRandom,
		mergeWeights,
		addFragmentToMapping
	},


	generateFragments,
	generateMessage,
	mergeFragments,
	extendMapping,
}