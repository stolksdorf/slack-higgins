const Slack = require('pico-slack');


Slack.onMessage((msg)=>{
	if(msg.isDirect && Slack.has(msg.text, 'user')){
		Slack.msg(msg.user, JSON.stringify(Slack.channels));
	}

	if(msg.isDirect && Slack.has(msg.text, 'file')){


	}
});