const Slack = require('pico-slack');


Slack.onMessage((msg)=>{
	if(msg.isDirect && msg.text == 'info'){
		const {users, channels, dms, bots} = Slack;
		Slack.send(msg.user, "```"+JSON.stringify({users, channels, dms, bots}, null, '  ')+"```");
	}

	if(msg.isDirect && msg.text == 'carly'){
		Slack.send('carlygrayy', "This is a message that should go only and directly to Carly. I am so sorry that I have not messaged you in so long.");
	}
});