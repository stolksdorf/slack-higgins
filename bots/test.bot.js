const Slack = require('pico-slack');


Slack.onMessage((msg)=>{
	if(msg.isDirect && msg.text == 'users'){
		Slack.send(msg.user, JSON.stringify(Slack.users));
	}
});