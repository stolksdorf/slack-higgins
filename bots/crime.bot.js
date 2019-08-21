const config = require('pico-conf');
const Slack = require('pico-slack');
const Gist = require('pico-gist')(config.get('github_token'));

const crimeGistID = '24d22dfeecc3d02e419cad8739e8b672';

let lastMessage = {};
let lastSender  = {};

Slack.onMessage((msg)=>{
	if(Slack.has(msg.text, ['#20crimeteen', '#twentycrimeteen', '#20crimeteam', '#twentycrimeteam'])){
		Slack.alias('crimebot', 'police_car').send(msg.channel, `<https://gist.github.com/stolksdorf/${crimeGistID}|#20crimeteen!>`)
		Gist.append(crimeGistID, {
			'20crimeteen' : `\n\n\`[in #${msg.channel} on ${(new Date()).toLocaleDateString()} at ${(new Date()).toLocaleTimeString()}]\`<br />`
				+ `**${lastSender[msg.channel]}**: ${lastMessage[msg.channel]}<br />`
				+ `**${msg.user}**: ${msg.text}\n\n`
		})
	}else{
		lastMessage[msg.channel] = msg.text;
		lastSender[msg.channel] = msg.user;
	}
});
