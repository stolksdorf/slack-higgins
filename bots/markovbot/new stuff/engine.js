const map    = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);


const MARKOV_DEPTH = 6;

//TODO: Change all the characters to be invisible, non-used unicode,
//Weight pairs can be done by a single character, then number, just need a weight divider
// Require a end fragment character, and remove the new lines


const END_SEQ = '¶';
const SEQ_DIV = '⇢';
const WEIGHT_DIV = '˲';
const VAL_DIV = '।';


const trim = (key)=>(key.length > MARKOV_DEPTH ? key.slice(-MARKOV_DEPTH) : key);


const utils = {
	mergeWeights : (weights1={}, weights2={})=>{
		return reduce(weights2, (acc, weight, letter)=>{
			acc[letter] = (acc[letter] || 0) + weight;
			return acc;
		}, weights1);
	},

	encodeFragment : (seq, weights)=>{
		return `${seq}${SEQ_DIV}${map(weights, (w,l)=>`${l}${VAL_DIV}${w}`).join(WEIGHT_DIV)}`;
	},

	decodeFragment : (line)=>{
		const [seq, data] = line.split(SEQ_DIV);
		return data.split(WEIGHT_DIV).reduce((acc, field)=>{
			const [letter, weight] = field.split(VAL_DIV);
			acc.total += Number(weight);
			acc.weights[letter] = Number(weight);
			return acc;
		}, {
			seq,
			total   : 0,
			weights : {}
		});
	},


	addFragmentToMapping : (mapping='', seq, weights)=>{
		const entry = utils.findEntry(mapping, seq);
		if(entry){
			return mapping.substr(0, entry.start)
				+ utils.encodeFragment(seq, utils.mergeWeights(entry.weights, weights))
				+ mapping.substr(entry.end)
		}

		return (mapping?(mapping+'\n'):'') + utils.encodeFragment(seq, weights);
	},

	findEntry : (mapping, sequence)=>{
		if(!mapping) return false;
		const start = mapping.indexOf(`${sequence}${SEQ_DIV}`);
		if(start === -1) return false;
		let end = mapping.indexOf('\n', start);
		if(end === -1) end = mapping.length;
		const line = mapping.substring(start, end);
		if(!line || line.indexOf(SEQ_DIV) === -1) return false;
		return Object.assign(utils.decodeFragment(line), {
			start,end
		});
	},

	weightedRandom : (weights={}, total=0)=>{
		const rand = Math.floor(Math.random() * total);
		let current = 0;
		const keys = Object.keys(weights);
		if(keys.length == 1) return keys[0]
		return keys.find((key)=>{
			const passes = current >= rand;
			current += weights[key];
			return passes;
		});
	},
};


const extendMapping = (mapping='', fragments={})=>{
	return reduce(fragments, (acc, weights, seq)=>{
		return utils.addFragmentToMapping(acc, seq, weights);
	}, mapping);
}

const mergeFragments = (frags1={}, frags2={})=>{
	return reduce(frags2, (acc , weights, seq)=>{
		acc[seq] = acc[seq]
			? utils.mergeWeights(acc[seq], weights)
			: weights
		return acc;
	}, frags1);
};

const generateFragments = (msg)=>{
	let frags = {};
	(msg+END_SEQ).split('').reduce((seq, letter)=>{
		frags[seq] = frags[seq] || {};
		frags[seq][letter] = (frags[seq][letter] || 0) + 1;
		return trim(seq + letter);
	}, '')
	return frags;
};


const generateMessage = (mapping)=>{
	const addLetter = (msg='')=>{
		const sequence = trim(msg);
		const entry = utils.findEntry(mapping, sequence);
		if(!entry) return msg;
		const letter = utils.weightedRandom(entry.weights, entry.total);
		if(!letter || letter == END_SEQ) return msg;
		return addLetter(msg + letter);
	};
	return addLetter();
};

module.exports = {
	utils,
	generateFragments,
	generateMessage,
	mergeFragments,
	extendMapping,
}