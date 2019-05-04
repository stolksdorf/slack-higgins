const redis = require('pico-redis')('markov');
const Engine = require('./engine.js');
const S3 = require('./s3.js');

const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);
const sequence = async (arr, func)=>{
	return arr.reduce((prom, val, key)=>{
		return prom.then(()=>func(val, key))
	}, Promise.resolve())
};


module.exports = async (users)=>{
	let newStats = {};

	return sequence(users, async (user)=>{
		console.log('exttracitng redis', user);
		const data = await redis.get(user);
		newStats[user] = {
			msgCount : data.msgs,
			letterCount : data.letters
		};

		const size = Object.keys(data.weights).length
		let idx = 0;

		const newMapping = Engine.extendMapping('', data.weights);

		await S3.upload(`${user}.map`, newMapping);
		console.log('Uploaded to S3');
	})
	.then(()=>S3.upload('stats.json', JSON.stringify(newStats, null, '  ')))
}