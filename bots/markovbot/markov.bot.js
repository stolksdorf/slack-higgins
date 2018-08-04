const _ = require('lodash');
const Slack = require('pico-slack');
const MarkovService = require('./markov.service.js');

const Populate = require('./populate.js')

const aliases = {
	dave  : 'david',
	meg   : 'meggeroni',
	scoot : 'scott',
	brock : 'brockdusome',
	greg  : 'gleaver',
	goog  : 'gleaver',
	jenny : 'jennifer.czekus',
	tina  : 'tskoops',
	jenaynay : 'jennifer.czekus',
	rebaybay : 'rebabybay',
	rebecca  : 'rebabybay',
};
const iconAliases = {
	'jennifer.czekus' : 'jenny',
	'scott' : '+1'
};

const blacklist = ['trivia-time'];

const botSend = async (channel, user, msg)=>{
	if(!msg) msg = await MarkovService.getNewMessage(user);
	const icon = iconAliases[user] || user;
	Slack.api('chat.postMessage', {
		channel     : channel,
		username    : `${user}bot`,
		icon_emoji  : `:${icon}:`,
		attachments : JSON.stringify([{
			pretext   : msg.text,
			mrkdwn_in : ['pretext'],
			footer    : `built with ${msg.msgs} messages, using ${msg.letters} letters.`
		}])
	});
};

Slack.onMessage((msg)=>{
if(blacklist.some((channel)=>channel==msg.channel)) return;

	if(msg.text == 'populate' && msg.user == 'scott'){
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
const HOURS = 1000 * 60 * 60;
const sendRandomMessage = async ()=>{
	const randomUser = _.sample(Slack.users);
	const msg = await MarkovService.getNewMessage(randomUser);
	if(msg.msgs < 50) return sendRandomMessage();
	botSend('bottin-around', randomUser, msg);
	setTimeout(sendRandomMessage, _.random(5, 10) * HOURS);
};
sendRandomMessage();
