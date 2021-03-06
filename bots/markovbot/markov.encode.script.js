/*
Downloads our slack history from S3 and encodes it to markov mappings

Usage:

node markov.enocde.js --depth=8 --cache --upload

*/


const s3 = require('../../utils/s3.js');
const request = require('superagent');
const Markov = require('./markov.engine.js');
const config = require('pico-conf');
const fs = require('fs');

const fse = require('fs-extra');


const sequence = async (obj, fn)=>Object.keys(obj).reduce((a,key)=>a.then((r)=>fn(obj[key], key, r)), Promise.resolve());



const exportPath = "C:/Users/scott/Desktop/coolsville-markov-mappings";
const HistoryCache = "C:/Users/scott/Desktop/cache/history/";
const MappingCache = "C:/Users/scott/Desktop/cache/mappings/";

const IgnoredChannels = ['support'];


const getArgs = (processArr = process.argv.slice(2))=>{
	return processArr.reduce((acc, arg)=>{
		if(arg[0]=='-'){
			let [key,val] = arg.replace(/-(-)?/, '').split('=');
			acc[key] = typeof val == 'undefined' ? true : val;
			return acc;
		}
		acc.args.push(arg);
		return acc;
	}, {args:[]});
};

const Args = getArgs();



const getUsers = async ()=>{
	return await request.get(`https://slack.com/api/users.list`)
		.query({ token : config.get('command_token') })
		.then((res)=>res.body.members.map((user)=>user.name))
};


const getChannel = async (channelname)=>{
	const fp = HistoryCache + channelname;
	if(fs.existsSync(fp)) return fs.promises.readFile(fp);
	const channeldata = await s3.fetch(config.get('historybot:bucket_name'), channelname);
	if(Args.cache) await fse.outputFile(fp, channeldata);
	return channeldata;
}

const getAllHistory = async ()=>{
	let channels = await s3.list(config.get('historybot:bucket_name'));
	//const channels = ['bsg.json'];

	channels = channels.filter((name)=>{
		return !IgnoredChannels.includes(name.replace('.json', ''));
	})

	let res = {};
	await sequence(channels, async (channelname, _, acc={})=>{
		console.log('Fetching', channelname);
		const raw = await getChannel(channelname);
		if(!raw) return;
		res[channelname] = JSON.parse(raw);
	});
	return res;
};

const makeMappingForUser = (user, strings, depth=8)=>{
	console.time(`${user} done`);

	const mapping = {
		letters    : 0,
		messages   : 0,
		created_at : (new Date()).toISOString(),
		fragments  : {}
	};

	strings.map((text)=>{
		mapping.letters += text.length;
		mapping.messages++;
		mapping.fragments = Markov.encode(mapping.fragments, text, depth);
	});

	console.timeEnd(`${user} done`);
	return mapping;
};


const getAllTextByUser = (channels, user)=>{
	return Object.entries(channels).reduce((acc, [name, logs])=>{
		return acc.concat(logs.filter((log)=>log.user == user).map((msg)=>msg.text))
	}, [])
}

const run = async (depth=8)=>{
	console.time('Finished');

	console.log('Fetching Users...');
	const users = await getUsers();

	console.log('Fetching All Channel History...');
	const channels = await getAllHistory();

	await sequence(users, async (user)=>{
		const mapping = makeMappingForUser(user, getAllTextByUser(channels, user), depth);

		if(mapping.messages > 150){
			console.log(user, 'total messages', mapping.messages);
			if(Args.cache){
				await fse.outputFile(MappingCache + `${user}.mapping${depth}.json`, JSON.stringify(mapping));
			}

			if(Args.upload){
				console.time(`${user} uploaded!`);
				await s3.upload(config.get('markov.bucket_name'), `${user}.mapping${depth}.json`, JSON.stringify(mapping));
				console.timeEnd(`${user} uploaded!`);
			}
		}else{
			console.log(user, 'total messages', mapping.messages, 'SKIPPING');
		}
	})
	console.timeEnd('Finished');
}

try{
	run(Args.depth)
}catch(err){
	console.log(err);
}