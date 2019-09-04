const Slack = require('pico-slack');

Slack.onReact((event) => {
	const isProbablyADave = event.reaction.indexOf('dav') >= 0;
	if(isProbablyADave) {
		Slack.react(event.item, 'star_of_david');
	}
});
