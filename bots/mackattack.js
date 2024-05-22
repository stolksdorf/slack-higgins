const _ = require('lodash');
const Slack = require('../utils/pico-slack');

Slack.onMessage((msg)=>{
	if(Slack.has(msg.text, ['rabbit', 'bunny'])){
		Slack.react(msg, 'mack-attack');
	}
});
