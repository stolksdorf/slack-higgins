const Slack = require('pico-slack');

Slack.onReact(({ reaction, item }) => {
	const isProbablyADave = reaction.indexOf('dav') >= 0;
	if(isProbablyADave && reaction !== 'star_of_david') {
		Slack.react(item, 'star_of_david');
	}
});
