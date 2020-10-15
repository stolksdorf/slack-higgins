const Slack = require('pico-slack');

const twitterRegex = (str)=>(/https:\/\/(mobile\.)?twitter\.com\/[a-z_0-9]+\/status\/(\d+)/.exec(str) || [])[2];

Slack.onMessage((msg)=>{
	const twitterId = twitterRegex(msg.text);
	if(twitterId){
		Slack
			.alias('twitter_thread_bot', ':scroll:')
			.send(msg.channel, `https://threadreaderapp.com/thread/${twitterId}.html`);
	}
})