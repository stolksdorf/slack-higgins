const map    = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);
const filter = (obj,fn)=>Object.keys(obj).reduce((a,key)=>!!fn(obj[key],key)?a.concat(obj[key]):a,[]);
const construct = (obj,fn)=>Object.keys(obj).reduce((a,key)=>{const [k,v]=fn(obj[key],key);a[k]=v;return a;},{});

/* fragement = {
	[sequence] : { [letter] : weight}
}*/


const encode = ()=>{

};

const mergeWeights = (weights1, weights2)=>{
	return reduce(weights1, (acc, weight, letter)=>{
		acc[letter] = acc[letter] ? acc[letter] + weight : 0
		return acc;
	}, weights2);
}

const encodeFragment = (seq, weights)=>{
	return `${seq}|${map(weights, (w,l)=>`${l}:${w}`).join(',')}`;
}

const extendMapping = (seq, weights, prevMapping='')=>{
	const entry = findEntry(prevMapping, seq);
	if(entry){
		return mapping.substr(0, entry.start)
			+ encodeFragment(seq, mergeWeights(entry.weights, weights))
			+ mapping.substr(entry.end)
	}

	return mapping + '\n' + encodeFragment(sequence, weights);
}

// const createMapping = (fragments, prevMapping = '')=>{
// 	// find sequence in prevMapping
// 	reduce(fragments, (mapping, weights, sequence)=>{
// 		const frag = findEntry(prevMapping, sequence);
// 		//const frag = encodeFragment(sequence, weights);

// 		if(frag){
// 			const newFrag = encodeFragment(sequence, mergeWeights(frag.weights, weights))
// 			return mapping.substr(0, frag.start)
// 				+ newFrag
// 				+ mapping.substr(frag.end)
// 			//slice it into
// 		}

// 		return mapping + '\n' + encodeFragment(sequence, weights);
// 	}, prevMapping)


// };


//TODO: rename, findEntry
const findEntry = (mapping, sequence)=>{
	if(!mapping) return false;

	const res = (new RegExp(`^${sequence}\\|(.*)`, 'm')).exec(mapping);
	if(!res) return false;


	const length = res[0].length;
	const idx = res.index;

	const temp =  {
		total : 0,
		weights : {},
		start : idx,
		end : idx + length

		// idx : {
		// 	start : idx,
		// 	end : idx + length
		// },
		// loc : [idx, length]
	}


	return res[1].split(',').reduce((acc, field)=>{
		const [letter, weight] = field.split(':');
		acc.total += Number(weight);
		acc.weights[letter] = Number(weight);
		return acc;
	}, temp);


	//return weights, total, and start and end indexes

	return res[1];
}


module.exports = {
	//getWeights,

}