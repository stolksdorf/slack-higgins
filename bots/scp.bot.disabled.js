const Slack = require('pico-slack');
const config = require('nconf');


Slack.onMessage(async (msg)=>{
	if(!msg.isDirect) return;
	if(msg.user == 'christian'){
		Slack.msgAs('SCP Foundation', ':scp:', 'scp', msg.text);
	}
});
