const Slack = require('pico-slack');

const commands = [];

Slack.onMessage((msg)=>{
	console.log(commands);
	if(msg.channel != 'diagnostics') return;
	if(msg.user != 'scott') return;
	commands.map((cmd)=>{
		if(Slack.msgHas(msg.text, cmd.keywords)) cmd.fn(msg);
	})
});


module.exports = {
	onCommand : (keywords, fn)=>{
		commands.push({keywords,fn})

	}
}