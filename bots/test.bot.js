const Slack = require('../utils/pico-slack');


Slack.onMessage((msg)=>{
	if(msg.isDirect && msg.text == 'info'){
		Slack.log(msg)
		const {users, channels, dms, bots} = Slack;
		Slack.send(msg.user, "```"+JSON.stringify({users}, null, '  ')+"```");
		Slack.send(msg.user, "```"+JSON.stringify({channels}, null, '  ')+"```");
		Slack.send(msg.user, "```"+JSON.stringify({dms}, null, '  ')+"```");
		Slack.send(msg.user, "```"+JSON.stringify({bots}, null, '  ')+"```");
	}

	if(msg.isDirect && msg.text == 'carly'){
		Slack.send('carlygrayy', "This is a message that should go only and directly to Carly. I am so sorry that I have not messaged you in so long.");
	}
});