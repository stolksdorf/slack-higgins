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

	rebaybay : 'rebabybay',
	rebecca : 'rebabybay',
};
const blacklist = ['trivia-time'];

const botSend = async (channel, user)=>{
	const msg = await MarkovService.getNewMessage(user);
	Slack.api('chat.postMessage', {
		channel     : channel,
		username    : `${user}bot`,
		icon_emoji  : `:${user}:`,
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
const sendRandomMessage = ()=>{
	botSend('bottin-around', _.sample(Slack.users));
	setTimeout(sendRandomMessage, _.random(5, 10) * HOURS);
};
sendRandomMessage();
