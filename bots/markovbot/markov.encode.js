const s3 = require('../../utils/s3.js');
const request = require('superagent');
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




const getUsers = async ()=>{
	return await request.get(`https://slack.com/api/users.list`)
		.query({ token : config.get('command_token') })
		.then((res)=>res.body.members.map((user)=>user.name))
};

const getAllHistory = async ()=>{
	const channels = await s3.list(config.get('historybot:bucket_name'));

	//const channels = ['bsg.json'];

	let res = {};
	await sequence(channels, async (channel, _, acc={})=>{
		console.log('Fetching', channel);
		const raw = await s3.fetch(config.get('historybot:bucket_name'), channel);
		if(!raw) return;
		res[channel] = JSON.parse(raw);
	});
	return res;
};

const getMappingForUser = (user, channels)=>{
	const mapping = {
		letters  : 0,
		messages : 0,
		depth5   : {},
		depth6   : {},
		depth7   : {},
		depth8   : {},
	};
	console.log('Processing', user);
	console.time('done');
	Object.entries(channels).map(([name, logs])=>{
		logs.filter((log)=>log.user == user).map((msg)=>{
			mapping.letters += msg.msg.length;
			mapping.messages++;
			//mapping.depth5 = Markov.encode(mapping.depth5, msg, 5);
			//mapping.depth6 = Markov.encode(mapping.depth6, msg, 6);
			//mapping.depth7 = Markov.encode(mapping.depth7, msg, 7);
			mapping.depth8 = Markov.encode(mapping.depth8, msg.msg, 8);
		})
	})
	console.timeEnd('done');
	return mapping;
}



const run = async ()=>{
	console.time('Finished');

	console.log('Fetching Users...');
	const users = await getUsers();

	console.log('Fetching All Channel History...');
	const channels = await getAllHistory();

	users.map((user)=>{
		const res = getMappingForUser(user, channels);
		console.log(user, res.letters, res.messages);
		if(res.messages > 100){
			fs.writeFileSync(exportPath + `/${user}.mapping.json`, JSON.stringify(res))
		}
	})

	// // await sequence(Object.keys(Mappings), async (user)=>{
	// // 	console.log('Saving mapping', user);
	// // 	await s3.upload(config.get('markov:bucket_name'), `${user}.mapping.json`, JSON.stringify(Mappings[user]))
	// // });

	console.timeEnd('Finished');

}

try{
	run()
}catch(err){
	console.log(err);
}