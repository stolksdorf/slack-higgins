const _ = require('lodash');
const Slack = require('../utils/pico-slack');

Slack.onMessage((msg)=>{
	if(Slack.has(msg.text, ['battleship', 'battleshit'])){
		Slack.react(msg, 'boat');
    Slack.react(msg, 'hankey');
	}
});
