const redis = require('pico-redis')('markov');
const Engine = require('./engine.js');
const Storage = require('./storage.js');
const S3 = require('./s3.js');


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

		const newMapping = Engine.extendMapping('', data.weights);
		console.log('created new map', Object.keys(data.weights).length);
		await S3.upload(`${user}.map`, newMapping);
		console.log('Uploaded to S3');
	})
	.then(()=>Storage.backupStats())
}