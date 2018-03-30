const Slack = require('pico-slack');
const _ = require('lodash');
const nums = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];


const send = (channel, text)=>Slack.sendAs('pollbot', 'bar_chart', channel, text);

const timeout = ()=>{
	return new Promise((resolve, reject)=>setTimeout(resolve, 250));
};

const addNumVotesToMsg = (evt, opts)=>{
	return opts.reduce((flow, opt, idx)=>{
		return flow.then(()=>Slack.react(evt, nums[idx])).then(()=>timeout();
	}, Promise.resolve());
}

Slack.onMessage((msg)=>{
	if(Slack.msgHas(msg, 'how', ['make', 'do', 'create'], 'poll')){
		send(msg.channel, `To create a poll, make a message in the following format: \n \`poll: [My question]? [option 1], [option 2], ...\``);
	}

	if(msg.text.indexOf('poll:') == 0){
		let [question, options] = msg.text.replace('poll:', '').split('?');
		options = options.split(',').map((opt)=>opt.trim());

		console.log('q', question);
		console.log('opts', options);

		const opts = options.map((opt, idx)=>`:${nums[idx]}: ${opt}`).join('\n')

		send(msg.channel, `*${question}?*\n${opts}`)
			.then((evt)=>addNumVotesToMsg(evt, options))
	}
});