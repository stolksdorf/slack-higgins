const s3 = require('../../utils/s3.js');
const Markov = require('./markov.engine2.js');
const config = require('pico-conf');

const sequence = async (obj, fn)=>Object.keys(obj).reduce((a,key)=>a.then((r)=>fn(obj[key], key, r)), Promise.resolve());

const fs = require('fs');

const exportPath = "C:/Users/scott/Desktop/coolsville-markov-mappings";

let Mappings = {};

const createMapping = ()=>{
	return {
		letters  : 0,
		messages : 0,
		depth5   : {},
		depth6   : {},
		depth7   : {},
		depth8   : {},
	}
};

//Fetch corpus
// Loop through for each user and generate mapping
//

const run = async ()=>{
	console.log('here');
	console.time('Finished');
	const channels = await s3.list(config.get('historybot:bucket_name'));

	console.log('channels', channels);

	await sequence(channels, async (channel)=>{
		//console.log('Fetching', channel);
		const raw = await s3.fetch(config.get('historybot:bucket_name'), channel);
		const logs = JSON.parse(raw);
		console.log('Processing', logs.length, channel);

		logs.map(({user, msg})=>{
			//if(user !== 'rebaybay') return;

			Mappings[user] = Mappings[user] || createMapping();
			Mappings[user].letters += msg.length;
			Mappings[user].messages++;


			//Mappings[user].depth5 = Markov.encode(Mappings[user].depth5, msg, 5);
			//Mappings[user].depth6 = Markov.encode(Mappings[user].depth6, msg, 6);
			//Mappings[user].depth7 = Markov.encode(Mappings[user].depth7, msg, 7);
			Mappings[user].depth8 = Markov.encode(Mappings[user].depth8, msg, 8);
		});
	});


	Object.keys(Mappings).map((user)=>{
		console.log('Writing', user);
		fs.writeFileSync(exportPath + `/${user}.mapping.json`, JSON.stringify(Mappings[user]))
	})


	// await sequence(Object.keys(Mappings), async (user)=>{
	// 	console.log('Saving mapping', user);
	// 	await s3.upload(config.get('markov:bucket_name'), `${user}.mapping.json`, JSON.stringify(Mappings[user]))
	// });

	console.timeEnd('Finished');

}

try{
	run()
}catch(err){
	console.log(err);
}