const Slack = require('pico-slack');
const config = require('pico-conf');


Slack.onMessage(async (msg)=>{
	if(!msg.isDirect) return;
	if(msg.user == 'christian'){
		Slack.msgAs('SCP Foundation', ':scp:', 'scp', msg.text);
	}
});
