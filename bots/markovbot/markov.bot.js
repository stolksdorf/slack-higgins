const Slack = require('pico-slack');
const s3 = require('../../utils/s3.js');
const Markov = require('./markov.engine2.js');
//const config = require('pico-conf');
const config = require('../../config')

const sample       = (obj)=>Object.values(obj)[Math.floor(Math.random() * Object.values(obj).length)];
const map          = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const format = (num)=>num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
const loop = (fn, time=1000)=>setTimeout(()=>loop(fn, fn() || time), time);


const MIN = 1000 * 60;
const HOURS = MIN * 60;

const Aliases = require('./aliases.js');
const Users = Object.values(Slack.users);


const TriggerRandomBot = ()=>{
	const filteredUsers = Users
		.filter((user)=>!['hil', 'wyatt', 'ms.chelsea'].includes(user))
	const randomUser = sample(filteredUsers);
	BotSend('bottin-around', randomUser);
};

const BotSend = async (channel, user)=>{
	const raw = await s3.fetch(config.get('markov:bucket_name'), `${user}.mapping.json`);
	if(!raw) return Slack.log(`No mapping for user: ${user}`);

	const mapping = JSON.parse(raw);

	const depth = sample([5,6,7]);
	const footer = `built with ${format(mapping.messages)} messages, using ${format(mapping.letters)} letters with a depth of ${depth}.`;
	const pretext = Markov.generate(mapping[`depth${depth}`], depth);

	Slack.api('chat.postMessage', {
		channel     : channel,
		username    : `${user}bot`,
		icon_emoji  : `:${Aliases.icon[user] || user}:`,
		attachments : [{ mrkdwn_in : ['pretext'], footer, pretext }]
	});
};

Slack.onMessage((msg)=>{
	const shouldProc = (lookup, user)=>{
		if(Slack.has(msg.text, `${lookup}bot`)) BotSend(msg.channel, user);
	};
	map(Users, (user)=>shouldProc(user, user));
	map(Aliases.name, (user, nickname)=>shouldProc(nickname, user));
});

loop(()=>{
	TriggerRandomBot();
	return sample([5,6,7,8,9]) * HOURS;
}, 1 * HOURS);

