const Slack = require('pico-slack');
const Redis = require('pico-redis')('test');

Slack.onMessage((msg)=>{
	if(msg.isDirect && Slack.msgHas(msg.text, 'user')){
		Slack.msg(msg.user, JSON.stringify(Slack.channels))
	}


})