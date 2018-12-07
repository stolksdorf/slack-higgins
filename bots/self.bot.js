const Slack = require('pico-slack');
const between = (str, term1, term2)=>{
	const idx1 = str.indexOf(term1)+ term1.length;
	const idx2 = str.indexOf(term2, idx1);
	return str.substring(idx1, idx2).trim();
}


//eg. as coolbot in general : Hey guys!
Slack.onMessage(async (msg)=>{
	const lower = msg.text.toLowerCase();
	if(msg.isDirect){
		if(lower.startsWith('as') && lower.indexOf(':') !== -1){
			const peep = between(lower, 'as ', ' in ');
			const channel = between(lower, ' in ', ':');
			const message = msg.text.replace(msg.text.split(':')[0]+':', '').trim();
			Slack.sendAs(peep, peep.replace('bot', ''), channel, message)
				.then(()=>{
					Slack.send(msg.user, `${peep}\n${channel}\n${message}`)
				})
				.catch((err)=>{
					Slack.send(msg.user, `${peep}\n${channel}\n${message}`)
					Slack.send(msg.user, err.toString())
				})
		}
	}
});
