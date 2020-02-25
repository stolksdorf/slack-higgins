const config = require('pico-conf');
const Slack = require('pico-slack');
const datefns = require('date-fns');
const request = require('superagent');

const S3 = require('../../utils/s3.js');

const MIN = 60 * 1000;
const BucketName = config.get('historybot.bucket_name');
const IgnoredChannels = (config.get('historybot.ignored_channels', true) || '').split(',');
const wait = async (n,val)=>new Promise((r)=>setTimeout(()=>r(val), n));

let HistoryStorage = {};

const getDate = (ts)=>datefns.format(new Date(ts*1000), 'YYYY-MM-DD H:mm:ss')

const fetchHistory = async (channel)=>{
	let channelData;
	try{
		channelData = JSON.parse(await S3.fetch(BucketName, `${channel}.json`));
	}catch(err){ channelData = [] }
	if(!HistoryStorage[channel]) return channelData
	return channelData.concat(HistoryStorage[channel]);
}

const saveChannel = async (channel)=>{
	console.log(`Saving ${channel}...`);

	const channelData = await fetchHistory(channel);
	await S3.upload(BucketName, `${channel}.json`, JSON.stringify(channelData));
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


const parseMessage = (msgObj)=>{
	let res = {
		ts : msgObj.ts,
		user : msgObj.user,
		//date : datefns.format(new Date(), 'dd/MMM/yyy - H:mm:ss'), //for v2 of datefns
		//date : datefns.format(new Date(), 'DD/MMM/YYYY - H:mm:ss'),
		//date : datefns.format(new Date(), 'YYYY-MM-DD H:mm:ss'),
		text : msgObj.text
	}
	if(msgObj.thread_ts) res.thread = msgObj.thread_ts;
	return res;
}

const storeMessage = (msg)=>{
	HistoryStorage[msg.channel] = (HistoryStorage[msg.channel] || []).concat(parseMessage(msg))
};

const uploadHistoryToSlack = async (channel)=>{
	const content = await fetchHistory(channel);
	const filename = `coolsville-${channel}-history.txt`

	const file = content.map((entry)=>`[${entry.user} ${getDate(entry.ts)}]:${entry.text}`).join('\n');

	await request.post('https://slack.com/api/files.upload')
		.field('token',  Slack.token)
		.field('channels', channel)
		.field('filename',  filename)
		.field('filetype',  'txt')
		.field('title', filename)
		.attach('file', Buffer.from(file), {filename})
};

const uploadJSONToSlack = async (channel)=>{
	const content = await fetchHistory(channel);
	const filename = `coolsville-${channel}-history.json`

	const file = JSON.stringify(content, null, '  ');

	await request.post('https://slack.com/api/files.upload')
		.field('token',  Slack.token)
		.field('channels', channel)
		.field('filename',  filename)
		.field('filetype',  'json')
		.field('title', filename)
		.attach('file', Buffer.from(file), {filename})
}


setInterval(backupAll, config.get('historybot:backup_rate'))

Slack.onMessage(async (msg)=>{
	if(Slack.msgHas(msg.text, 'higgins', 'history', ['please', 'plz'])){
		if(Slack.msgHas(msg.text, 'json')){
			return await uploadJSONToSlack(msg.channel);
		}
		return await uploadHistoryToSlack(msg.channel);
	}

	if(msg.text && !msg.isDirect && !IgnoredChannels.includes(msg.channel)){
		storeMessage(msg);
	}
});