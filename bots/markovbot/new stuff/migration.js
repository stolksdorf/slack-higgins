const redis = require('pico-redis')('markov');
const Engine = require('./engine.js');
const Storage = require('./storage.js');
const S3 = require('./s3.js');

const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);


const sequence = async (arr, func)=>{
	return arr.reduce((prom, val, key)=>{
		return prom.then(()=>func(val, key))
	}, Promise.resolve())
};


module.exports = async (users)=>{
	return sequence(users, async (user)=>{
		console.log('exttracitng redis', user);
		const data = await redis.get(user);
		Storage.cacheStats(user, data.msgs, data.letters);

		const size = Object.keys(data.weights).length
		let idx = 0;

		const newMapping = reduce(data.weights, (acc, weights, seq)=>{
			console.log(Math.round(idx++/size*100*100)/100);
			return acc + Engine.utils.encodeFragment(seq, weights) + '\n'
		},'');

		await S3.upload(`${user}.map`, newMapping);
		console.log('Uploaded to S3');
	})
	.then(()=>Storage.backupStats())
}