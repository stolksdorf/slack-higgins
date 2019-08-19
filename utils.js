const Slack = require('pico-slack');

const commands = [];

Slack.onMessage((msg)=>{
	if(msg.channel != 'diagnostics') return;
	if(msg.user != 'scott') return;
	console.log('onMessage commands:', commands);
	commands.map((cmd)=>{
		if(Slack.msgHas(msg.text, cmd.keywords)) cmd.fn(msg);
	})
});


module.exports = {
	onCommand : (keywords, fn)=>{
		commands.push({keywords,fn})

	}
}
