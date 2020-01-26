const config = require('pico-conf');
const Slack = require('pico-slack');
const datefns = require('date-fns');
const request = require('superagent');

const S3 = require('../utils/s3.js');

const MIN = 60 * 1000;
const BucketName = config.get('historybot.bucket_name');
const wait = async (n,val)=>new Promise((r)=>setTimeout(()=>r(val), n));
const DIV = '\n\n'

let HistoryStorage = {};


const fetchHistory = async (channel)=>{
	let channelData = await S3.fetch(BucketName, `${channel}.txt`);
	if(HistoryStorage[channel]) channelData += DIV + HistoryStorage[channel];
	return channelData;
}

const saveChannel = async (channel)=>{
	console.log(`Saving ${channel}...`);

	const channelData = await fetchHistory(channel);
	await S3.upload(BucketName, `${channel}.txt`, channelData);
	delete HistoryStorage[channel];

	console.log(`Finished ${channel}`);
};

const backupAll = async ()=>{
	const channels = Object.keys(HistoryStorage);
	if(!channels.length){
		Slack.log('nothing to backup');
		return;
	}

	Slack.log('Starting history backup...');

	await channels.reduce((seq, channel)=>{
		return seq.then(()=>saveChannel(channel)).then(()=>wait(500));
	}, Promise.resolve());

	Slack.log('Finished history backup:', channels.join(', '));
};


const parseMessage = (msg)=>{
	return `[${msg.user}] {${datefns.format(new Date(), 'dd/MMM/yyyy - H:mm:ss')}} = ${msg.text}`
}

const storeMessage = (msg)=>{
	if(!msg.text) return;
	HistoryStorage[msg.channel] = (HistoryStorage[msg.channel]
			? HistoryStorage[msg.channel] + DIV
			: '')
		+ parseMessage(msg);
};

const uploadHistory = async (channel)=>{
	const content = await fetchHistory(channel);
	const filename = `coolsville-${channel}-history.txt`

	await request.post('https://slack.com/api/files.upload')
		.field('token',  Slack.token)
		.field('channels', channel)
		.field('filename',  filename)
		.field('filetype',  'txt')
		.field('title', `${channel} history`)
		.attach('file', Buffer.from(content), {filename})
}


setInterval(backupAll, 20 * MIN)

Slack.onMessage(async (msg)=>{
	if(Slack.msgHas(msg.text, 'higgins', 'history')){
		return await uploadHistory(msg.channel);
	}

	if(msg.text) storeMessage(msg);
});