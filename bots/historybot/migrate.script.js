const config = require('pico-conf');
const Slack = require('pico-slack');
const datefns = require('date-fns');
const request = require('superagent');

const S3 = require('../../utils/s3.js');

const BucketName = config.get('historybot.bucket_name');


const sequence = async (obj, fn)=>Object.keys(obj).reduce((a,key)=>a.then((r)=>fn(obj[key], key, r)), Promise.resolve());


const migrateChannel = async (name)=>{
	console.time(`Finished ${name}`);

	const logs = JSON.parse(await S3.fetch(BucketName, name));


	await S3.upload(BucketName, name, JSON.stringify(logs.map((log)=>{
		return {
			ts : log.ts,
			user : log.user,
			thread : log.thread,
			text : log.msg || log.text,
		}
	})));
	console.timeEnd(`Finished ${name}`);
}



const run = async ()=>{
	console.time('Finished');
	const channels = await S3.list(BucketName);

	console.log(channels);

	await sequence(channels, migrateChannel);

	console.timeEnd('Finished');
}


//run();

//TODO: test on one channel


migrateChannel('iasip.json');