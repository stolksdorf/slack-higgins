const Slack = require('../utils/pico-slack');

Slack.onReact(({ reaction, item }) => {
	const isProbablyADave = reaction.indexOf('dav') >= 0;
	if(isProbablyADave) {
		Slack.react(item, 'star_of_david').catch(()=>null);
	}
});
