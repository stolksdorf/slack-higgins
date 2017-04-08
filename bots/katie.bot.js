const Slack = require('pico-slack');
const Msg = Slack.msgAs.bind(null, 'batiebot', 'katie');


Slack.onMessage((msg)=>{
	if(msg.channel == 'secret-laboratory' && msg.user == 'katie'){
		Msg(msg.channel, 'Why hello there!');
	}
});