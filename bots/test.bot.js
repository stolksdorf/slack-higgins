const Slack = require('pico-slack');


Slack.onMessage((msg)=>{
	if(msg.isDirect && Slack.has(msg.text, 'user')){
		Slack.send(msg.user, JSON.stringify(Slack.channels));
	}

	if(msg.isDirect && Slack.has(msg.text, 'file')){


	}
});