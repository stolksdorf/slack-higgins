const Slack = require('./utils/pico-slack');

const admins = ['scott', 'jared'];
const commands = [];

Slack.onChannelMessage('diagnostics', (msg)=>{
	if(!admins.includes(msg.user)) return;
	console.log('onMessage commands:', commands);
	commands.map((cmd)=>{
		if(Slack.has(msg.text, cmd.keywords)) cmd.fn(msg);
	})
});


module.exports = {
	onCommand : (keywords, fn)=>{
		commands.push({keywords,fn})

	}
}
