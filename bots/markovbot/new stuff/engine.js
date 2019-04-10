const map    = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);
const filter = (obj,fn)=>Object.keys(obj).reduce((a,key)=>!!fn(obj[key],key)?a.concat(obj[key]):a,[]);
const construct = (obj,fn)=>Object.keys(obj).reduce((a,key)=>{const [k,v]=fn(obj[key],key);a[k]=v;return a;},{});

/* fragement = {
	[sequence] : { [letter] : weight}
}*/




const MARKOV_DEPTH = 6;
const END = '¶';


const getWeightedRandom = (weights={}, total=0)=>{
	const rand = Math.floor(Math.random() * total);
	let current = 0;
	return Object.keys(weights).find((key)=>{
		current += weights[key];
		return current >= rand;
	});
};
const trim = (key)=>(key.length > MARKOV_DEPTH ? key.slice(-MARKOV_DEPTH) : key);


const mergeWeights = (weights1={}, weights2={})=>{
	return reduce(weights1, (acc, weight, letter)=>{
		acc[letter] = acc[letter] ? acc[letter] + weight : 0
		return acc;
	}, weights2);
}

const encodeFragment = (seq, weights)=>{
	return `${seq}|${map(weights, (w,l)=>`${l}:${w}`).join(',')}`;
}

////////////////////////////



const extendMapping = (seq, weights, mapping='')=>{
	const entry = findEntry(mapping, seq);
	if(entry){
		return mapping.substr(0, entry.start)
			+ encodeFragment(seq, mergeWeights(entry.weights, weights))
			+ mapping.substr(entry.end)
	}

	return mapping + '\n' + encodeFragment(sequence, weights);
}


const findEntry = (mapping, sequence)=>{
	if(!mapping) return false;

	const res = (new RegExp(`^${sequence}\\|(.*)`, 'm')).exec(mapping);
	if(!res) return false;

	const entry = res[1].split(',').reduce((acc, field)=>{
		const [letter, weight] = field.split(':');
		acc.total += Number(weight);
		acc.weights[letter] = Number(weight);
		return acc;
	}, {
		total : 0,
		weights : {}
	});

	return Object.assign(entry, {
		start : res.index,
		end   : res.index + res[0].length
	})
};

const generateFragments = (msg)=>{
	let frags = {};
	msg.split('').reduce((seq, letter)=>{
		frags[seq] = frags[seq] || {};
		frags[seq][letter] = frags[seq][letter]
			? frags[seq][letter] + 1
			: 1;
		return trim(acc + letter);
	}, '')
	return frags;
};

const mergeFragments = (frag1, frag2)=>{

}

const generateMessage = (mapping)=>{
	const addLetter = (msg='')=>{
		const sequence = trim(msg);
		const entry = findEntry(mapping, sequence);
		if(!entry) return msg;
		const letter = getWeightedRandom(entry.weights, entry.total);
		if(!letter || letter == END) return msg;
		return addLetter(msg + letter);
	};
	return addLetter();
};


module.exports = {
	//getWeights,

}