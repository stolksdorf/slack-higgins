const Slack = require('pico-slack');
const twitterRegex = (str)=>(/https:\/\/(mobile\.)?twitter\.com\/\w+\/status\/(\d+)/.exec(str) || [])[2];

let Cache = {};

Slack.onMessage((msg)=>{
	const twitterId = twitterRegex(msg.text);
	if(twitterId){
		Cache[msg.ts] = twitterId;
		Slack.react(msg, ':scroll:');
	}
});

Slack.onReact((evt)=>{
	if(evt.reaction == 'scroll' && Cache[evt.item.ts]){
		Slack
			.alias('twitter_thread_bot', ':scroll:')
			.send(evt.channel, `https://threadreaderapp.com/thread/${Cache[evt.item.ts]}.html`);

		delete Cache[evt.item.ts];
	}
});
