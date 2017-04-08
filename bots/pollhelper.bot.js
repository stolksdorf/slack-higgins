const Slack = require('pico-slack');
const _ = require('lodash');
const nums = ['one','two','three','four','five','six','seven','eight','nine'];

//Helps out PollBot by adding the default reactions for each option whenever a user posts a poll
Slack.onMessage((msg)=>{
	if(msg.user !== 'pollbot') return;
	const flow = Promise.resolve();

	_.each(nums, (num)=>{
		if(_.includes(msg.text, ':' + num + ':')){
			flow.then(()=>Slack.react(msg, num));
		}
	});
});
