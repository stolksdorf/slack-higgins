const Slack = require('../../utils/pico-slack').alias('pollbot', 'bar_chart')
const { processPollMessage, getHelpMessage, getMessage, emojis } = require('./poll.utils.js');


const times = (n,fn)=>Array.from(new Array(n*1),(v,i)=>fn(i));
//const wait = async (n,val)=>new Promise((r)=>setTimeout(()=>r(val), n));
//const sequence = async (obj, fn)=>Object.keys(obj).reduce((a,key)=>a.then((r)=>fn(obj[key], key, r)), Promise.resolve());

// const addNumVotesToMsg = (msgEvt, options=[])=>{
// 	return sequence(options, (opt, idx)=>{
// 		return Slack.react(msgEvt, emojis[idx])
// 			.then(()=>wait(300))
// 	})
// };


/* Slash Command Helper */
Slack.onMessage((msg)=>{
	if(msg.subtype == 'bot_message' && global.pollRequests[msg.text]){
		Slack.react(msg, times(global.pollRequests[msg.text].length, (idx)=>emojis[idx]));
		delete global.pollRequests[msg.text];
	}
});

Slack.onMessage((msg)=>{
	if(msg.subtype == 'bot_message' || msg.text.indexOf('/poll') == 0) return;
	if(msg.text.toLowerCase().indexOf('poll:') == 0){
		const {question, options} = processPollMessage(msg.text.slice(5));
		if(!question || !options || options.length < 2){
			return Slack.send(msg.channel, getHelpMessage());
		}
		return Slack.send(msg.channel, getMessage(question, options))
			.then((evt)=>{
				Slack.react(evt, times(options.length, (idx)=>emojis[idx]));
			})
	}
	if(Slack.has(msg, ['poll', 'pollbot'], ['make', 'do', 'create', 'forget', 'help', 'how'])){
		return Slack.send(msg.channel, getHelpMessage());
	}
});


