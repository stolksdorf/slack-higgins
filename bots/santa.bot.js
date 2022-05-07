const Slack = require('../utils/pico-slack');

Slack.onMessage((msg)=>{
	if(msg.isDirect && Slack.has(msg.text, ['santachat', 'santabot'])){
		const message = msg.text
			.replace('santachat', '')
			.replace('santabot', '')
			.replace('Santachat', '')
			.replace('Santabot', '')
			.trim()
		Slack.send('secret-santa', message, {
			username:   'santabot',
			icon_emoji: ':santa:',
		});
	}
});
