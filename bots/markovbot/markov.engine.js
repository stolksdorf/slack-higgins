const map    = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);

const MARKOV_DEPTH = 6;

const END_MSG    = String.fromCharCode(28);
const SEQ_DIV    = String.fromCharCode(29);
const ENTRY_DIV  = String.fromCharCode(30);
const WEIGHT_DIV = String.fromCharCode(31);

const truncate = (key)=>(key.length > MARKOV_DEPTH ? key.slice(-MARKOV_DEPTH) : key);

/* Terms:

weights: pairs of letters and numbers indicating their frequency

sequence: 0-6 letter code
fragment: a sequence and weight pair

	{ENTRY_DIV}hello.{SEQ_DIV}a16{WEIGHT_DIV}b1{WEIGHT_DIV}c123{ENTRY_DIV}

fragment: an encoded fragment?


*/



const utils = {
	mergeWeights : (weights1={}, weights2={})=>{
		return reduce(weights2, (acc, weight, letter)=>{
			acc[letter] = (acc[letter] || 0) + weight;
			return acc;
		}, weights1);
	},

	encodeFragment : (seq, weights)=>{
		return `${seq}${SEQ_DIV}${map(weights, (w,l)=>`${l}${w}`).join(WEIGHT_DIV)}`;
	},

	decodeFragment : (fragment)=>{
		const [seq, data] = fragment.split(SEQ_DIV);
		if(!data) return;
		return data.split(WEIGHT_DIV).reduce((acc, field)=>{
			const letter = field[0];
			const weight = Number(field.substr(1));
			acc.total += weight;
			acc.weights[letter] = weight;
			return acc;
		}, {
			seq,
			total   : 0,
			weights : {}
		});
	},

	findFragment : (mapping, sequence)=>{
		if(!mapping) return false;
		let start = mapping.indexOf(`${ENTRY_DIV}${sequence}${SEQ_DIV}`);
		if(start === -1) return false;
		start += 1;
		let end = mapping.indexOf(ENTRY_DIV, start);
		if(end === -1) return false;
		const fragment = mapping.substring(start, end);
		//if(!fragment || fragment.indexOf(SEQ_DIV) === -1) return false;
		if(!fragment) return false;
		return Object.assign(utils.decodeFragment(fragment), {start,end});
	},

	addFragmentToMapping : (mapping='', weights, seq)=>{
		const frag = utils.findFragment(mapping, seq);
		if(frag){
			return mapping.substr(0, frag.start)
				+ utils.encodeFragment(seq, utils.mergeWeights(frag.weights, weights))
				+ mapping.substr(frag.end)
		}

		if(mapping[mapping.length-1] !== ENTRY_DIV) mapping += ENTRY_DIV

		return mapping + utils.encodeFragment(seq, weights) + ENTRY_DIV;
	},

	generateFragments : (msg)=>{
		let frags = {};
		(msg+END_MSG).split('').reduce((seq, letter)=>{
			frags[seq] = frags[seq] || {};
			frags[seq][letter] = (frags[seq][letter] || 0) + 1;
			return truncate(seq + letter);
		}, '')
		return frags;
	},

	//NOTE: Used for testing
	decodeMapping : (_mapping)=>{
		const {stats, mapping } = utils.extractStats(_mapping);
		const fragments = reduce(mapping.split(ENTRY_DIV), (res, fragment)=>{
			if(fragment){
				const frag = utils.decodeFragment(fragment);
				res[frag.seq] = frag;
			}
			return res;
		}, {});
		return {fragments, stats};
	},

	weightedRandom : (weights={}, total=0)=>{
		const rand = Math.floor(Math.random() * total);
		let current = 0;
		const keys = Object.keys(weights);
		if(keys.length == 1) return keys[0];
		return keys.find((key)=>{
			const passes = current >= rand;
			current += weights[key];
			return passes;
		});
	},

	extractStats : (mapping='')=>{
		const pivot = mapping.indexOf(ENTRY_DIV);
		let stats = {msgs:0,letters:0};
		try{
			if(pivot !== -1){
				stats = JSON.parse(mapping.substr(0,pivot));
				mapping = mapping.substr(pivot+1);
			}
		}catch(err){};
		return {stats, mapping}
	}
};



// const mergeFragments = (frags1={}, frags2={})=>{
// 	return reduce(frags2, (acc , weights, seq)=>{
// 		acc[seq] = acc[seq]
// 			? utils.mergeWeights(acc[seq], weights)
// 			: weights
// 		return acc;
// 	}, frags1);
// };





///////////////

const encodeMessages = (msgs=[], old_mapping='')=>{
	let {stats, mapping} = utils.extractStats(old_mapping);
	msgs.map((msg)=>{
		stats.msgs += 1;
		stats.letters += msg.length;
		const frags = utils.generateFragments(msg);
		mapping = reduce(frags, utils.addFragmentToMapping, mapping);
		//console.log(mapping);
		//console.log();
		//console.log('--------------------');
		//console.log();
	});
	return `${JSON.stringify(stats)}${mapping}`;
}


const generateMessage = (mapping)=>{
	const { stats } = utils.extractStats(mapping);
	const addLetter = (msg='')=>{
		const sequence = truncate(msg);
		const fragment = utils.findFragment(mapping, sequence);
		if(!fragment) return msg;
		const letter = utils.weightedRandom(fragment.weights, fragment.total);
		if(!letter || letter == END_MSG) return msg;
		return addLetter(msg + letter);
	};
	return {
		message : addLetter(),
		...stats
	}
};

module.exports = {
	utils,
	encodeMessages,
	generateMessage,
	//mergeFragments,
	//extendMapping,
}