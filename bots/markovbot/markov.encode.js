const s3 = require('../../utils/s3.js');
const Markov = require('./markov.engine.js');
const config = require('pico-conf');

const sequence = async (obj, fn)=>Object.keys(obj).reduce((a,key)=>a.then((r)=>fn(obj[key], key, r)), Promise.resolve());


let Mappings = {};

const createMapping = {
	letters  : 0,
	messages : 0,
	depth5   : {},
	depth6   : {},
	depth7   : {},

}

(async ()=>{
	console.log('here');
	console.time('Finished');
	const channels = await s3.fetch(config.get('historybot:bucket_name'));

	console.log('channels', channels);

	await sequence(channels, async (channel)=>{
		console.log('Fetching', channel);
		const logs = await s3.fetch(config.get('historybot:bucket_name'), `${channel}.json`);
		console.log('Processing', channel);
		logs.map(({user, msg})=>{

			Mappings[user] = Mappings[user] || createMapping();
			Mappings[user].depth5 = Markov.encode(Mappings[user].depth5, msg, 5);
			Mappings[user].depth6 = Markov.encode(Mappings[user].depth6, msg, 6);
			Mappings[user].depth7 = Markov.encode(Mappings[user].depth7, msg, 7);
		});
	});


	await sequence(Object.keys(Mappings), async (user)=>{
		console.log('Saving mapping', user);
		await s3.upload(config.get('markov:bucket_name'), `${user}.mapping.json`, JSON.stringify(Mappings[user]))
	});

	console.timeEnd('Finished');

})()