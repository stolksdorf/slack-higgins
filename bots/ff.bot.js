const _ = require('lodash');
const Slack = require('pico-slack');

const fishEmojis = [
	'fish',
	'tropical_fish',
	'fishing_pole_and_fish',
	'blowfish',
];
const fuckEmojis = [
	'fuck',
	'eggplant',
	'sweat_drops',
	'cold_sweat_b',
	'hot_sweat_b',
	'mouth'
];

Slack.onMessage((msg)=>{
	if(msg.user_id == 'U01MHD15XPX' && _.random(15) == 3){
		Slack.react(msg, _.sample(fishEmojis));
		Slack.react(msg, _.sample(fuckEmojis));
	}
});