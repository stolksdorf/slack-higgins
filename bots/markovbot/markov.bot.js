const Slack = require('pico-slack');
const MarkovService = require('./markov.service.js');

Slack.onMessage((msg)=>{
	MarkovService.addMessage(msg.user, msg.text);
	Object.values(Slack.users).map(async (user)=>{
		if(!Slack.msgHas(msg.text, `${user}bot`)) return;
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
	});
});