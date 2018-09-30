const _ = require('lodash');
const Slack = require('pico-slack');
const MarkovService = require('./markov.service.js');

const Populate = require('./populate.script.js')

const aliases = {
	dave  : 'david',
	meg   : 'meggeroni',
	scoot : 'scott',
	brock : 'brockdusome',
	greg  : 'gleaver',
	goog  : 'gleaver',
	'jennifer.czekus' : 'jenny',
	tina  : 'tskoops',
	jenaynay : 'jenny',
	rebabybay : 'rebaybay',
	rebecca  : 'rebaybay',
	sarah : 'sarahellen.w',
};
const iconAliases = {
	brockdusome : 'broccoli',
	slackbot : 'slack',
	david : 'mariachi_dave',
	'sarahellen.w' : 'sarah',
};

const blacklist = ['trivia-time'];

const botSend = async (channel, user, msg)=>{
	const icon = iconAliases[user] || user;
	if(!msg) msg = await MarkovService.getNewMessage(user);
	Slack.api('chat.postMessage', {
		channel     : channel,
		username    : `${user}bot`,
		icon_emoji  : `:${icon}:`,
		attachments : [{
			pretext   : msg.text,
			mrkdwn_in : ['pretext'],
			footer    : `built with ${msg.msgs} messages, using ${msg.letters} letters.`
		}]
	});
};

Slack.onMessage((msg)=>{
if(blacklist.some((channel)=>channel==msg.channel)) return;

	if(msg.isDirect && msg.text == 'populate' && msg.user == 'scott'){
		return Populate();
	}

	if(!msg.isDirect && !blacklist.includes(msg.channel)){
		MarkovService.addMessage(msg.user, msg.text);
	}
	_.map(Slack.users, (user)=>{
		if(Slack.msgHas(msg.text, `${user}bot`)) botSend(msg.channel, user);
	});
	_.map(aliases, (realName, alias)=>{
		if(Slack.msgHas(msg.text, `${alias}bot`)) botSend(msg.channel, realName);
	});
});

/** Random Proc **/
let populatedUsers = false;
const getRandomUser = async ()=>{
	if(Array.isArray(populatedUsers)) return _.sample(populatedUsers);
	populatedUsers = [];
	await Promise.all(_.map(Slack.users, async (name)=>{
		const count = await MarkovService.getMessageCount(name);
		if(count > 8) populatedUsers.push(name);
	}));
	return _.sample(populatedUsers);
};

const HOURS = 1000 * 60 * 60;
const sendRandomMessage = async ()=>{
	const randomUser = await getRandomUser();
	if(!randomUser) return;
	const msg = await MarkovService.getNewMessage(randomUser);
	if(msg) botSend('bottin-around', randomUser, msg);
	setTimeout(sendRandomMessage, _.random(5, 10) * HOURS);
};
sendRandomMessage();
