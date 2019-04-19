const redis = require('pico-redis')('markov');
const Engine = require('./engine.js');
const S3 = require('./s3.js');

module.exports = async (user)=>{
	const data = await redis.get(user);
	//console.log(Object.keys(data.weights).length);
	const newMapping = Engine.extendMapping('', data.weights);
	console.log(newMapping);
	await S3.upload(user, newMapping);
}