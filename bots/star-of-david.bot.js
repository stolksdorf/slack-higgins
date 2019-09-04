const Slack = require('pico-slack');

Slack.onReact((reaction) => {
	const isProbablyADave = reaction.reaction.indexOf('dav') >= 0;
	if(isProbablyADave) {
		Slack.react(reaction.item, 'star_of_david');
	}
});
