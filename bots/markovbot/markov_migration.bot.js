const redis = require('pico-redis')('markov');
const Engine = require('./markov.engine.js');
const S3 = require('./s3.js');

const Slack = require("pico-slack");

const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);
const sequence = async (arr, func)=>{
	return arr.reduce((prom, val, key)=>{
		return prom.then(()=>func(val, key))
	}, Promise.resolve())
};


const migrate = async (users)=>{
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


//Command Messages
Slack.onMessage((msg)=>{
	if(msg.isDirect && msg.user == 'scott'){

		if(msg.text == 'migrate'){
			return migrate(['scott']).then(()=>Slack.msg('scott', 'done!'));
		}
	}
});