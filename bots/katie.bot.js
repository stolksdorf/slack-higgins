const KatieBot = require('pico-slack').alias('katiebot', 'katie');

KatieBot.onMessage((msg)=>{
	if(msg.channel == 'secret-laboratory' && msg.user == 'katie'){
		KatieBot.send(msg.channel, 'Why hello there!');
	}
});