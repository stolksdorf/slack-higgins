const Slack = require('pico-slack');
const between = (str, term1, term2)=>str.substring(str.indexOf(term1) + term1.length, str.indexOf(term2)).trim();


//eg. as coolbot in general : Hey guys!
Slack.onMessage(async (msg)=>{
	const lower = msg.text.toLowerCase();
	if(msg.isDirect){
		if(lower.startsWith('as') && lower.indexOf(':') !== -1){
			const peep = between(lower, 'as ', ' in ');
			const channel = between(lower, ' in ', ' ');
			const message = msg.text.split(':')[1].trim();
			Slack.sendAs(`${peep}bot`, peep, channel, message);
		}
	}
});
