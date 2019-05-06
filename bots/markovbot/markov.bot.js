const Slack = require('pico-slack');
const Markov = require('./markov.service.js');

const sample       = (obj)=>Object.values(obj)[Math.floor(Math.random() * Object.values(obj).length)];
const map          = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const formatNumber = (num)=>num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
const loop = (fn, time=1000)=>setTimeout(()=>loop(fn, fn() || time), time);

const MIN = 1000 * 60;
const HOURS = MIN * 60;

const Aliases = require('./aliases.js');
const encodeBlacklist = ['trivia-time'];

//const Users = Object.values(Slack.users);
const Users = ['scott'];


const BotSend = async (channel, user)=>{
	Slack.log(`Sending Message as ${user}bot in ${channel}`);

	const msg = await Markov.generateMessage(user);
	Slack.api('chat.postMessage', {
		channel     : channel,
		username    : `${user}bot`,
		icon_emoji  : `:${Aliases.icon[user] || user}:`,
		attachments : [{
			pretext   : msg.text,
			mrkdwn_in : ['pretext'],
			footer    : `built with ${formatNumber(msg.msgCount)} messages, using ${formatNumber(msg.letterCount)} letters.`
		}]
	});
};

const AttemptEncode = (msg)=>{
	if(msg.isDirect) return;
	if(encodeBlacklist.includes(msg.channel)) return;

	return Markov.encodeMessage(msg.user, msg.text);
};

const CheckForEvocation = (msg)=>{
	const shouldProc = (lookup, user)=>{
		if(Slack.msgHas(msg.text, `${lookup}bot`)) BotSend(msg.channel, user);
	};
	map(Users, (user)=>shouldProc(user, user));
	map(Aliases.name, (user, nickname)=>shouldProc(nickname, user));
};

const TriggerRandomBot = ()=>{
	const filteredUsers = Users
		.filter((user)=>!['hil', 'wyatt', 'ms.chelsea'].includes(user))
	const randomUser = sample(filteredUsers);
	BotSend('bottin-around', randomUser);
};

/* --------------------------- */


loop(()=>{
	TriggerRandomBot();
	return sample([5,6,7,8,9]) * HOURS;
}, 1 * HOURS);
loop(Markov.backupCache, 10 * MIN);

Slack.onMessage((msg)=>{
	AttemptEncode(msg);
	CheckForEvocation(msg);
});