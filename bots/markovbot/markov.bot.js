const _ = require('lodash');
const Slack = require('pico-slack');
const MarkovService = require('./markov.service.js');

const aliases = {
	dave  : 'david',
	meg   : 'meggeroni',
	scoot : 'scott',
	brock : 'brockdusome',
	greg  : 'gleaver'
};

Slack.onMessage((msg)=>{
	MarkovService.addMessage(msg.user, msg.text);
	const send = async (user)=>{
		const newMsg = await MarkovService.getNewMessage(user);
		Slack.api('chat.postMessage', {
			channel     : msg.channel,
			username    : `${user}bot`,
			icon_emoji  : `:${user}:`,
			attachments : JSON.stringify([{
				pretext   : newMsg.text,
				mrkdwn_in : ['pretext'],
				footer    : `built with ${newMsg.msgs} messages, using ${newMsg.letters} letters.`
			}])
		});
	};
	_.map(Slack.users, (user)=>{
		if(Slack.msgHas(msg.text, `${user}bot`)) send(user);
	});
	_.map(aliases, (realName, alias)=>{
		if(Slack.msgHas(msg.text, `${alias}bot`)) send(realName);
	});
});