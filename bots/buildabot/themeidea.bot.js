const Slack = require('../../utils/pico-slack');

const prevThemes = require('./prev_themes.js');


const pluck = (arr)=>arr[Math.floor(Math.random()*arr.length)];

Slack.onMessage((msg)=>{
	if(msg.channel == 'happiness-and-cheer'
		&& Slack.has(msg, [`can't think`, 'not sure', 'suggest', 'suggestion'], ['theme'])){
		return Slack.alias('themebot', 'lightning').send(msg.channel,
			pluck([
				'What about',
				'How about',
				'Play that theme again Jack',
				'This one was fun',
				'Round two, FIGHT',
				'Have you considered',
				'Why not this one again?',
				'I gotchu',
				'This is theme you are looking for',
				'np babe'
			])
			+ ': *' +
			pluck(prevThemes)
			+'*'
		);
	}
});