const Slack = require('pico-slack');
const { processPollMessage, getHelpMessage, getMessage, emojis } = require('./poll.utils.js');

const send = (channel, text)=>Slack.sendAs('pollbot', 'bar_chart', channel, text);

const times = (n,fn)=>Array.from(new Array(n*1),(v,i)=>fn(i));
const wait = async (n,val)=>new Promise((r)=>setTimeout(()=>r(val), n));
const sequence = async (obj, fn)=>Object.keys(obj).reduce((a,key)=>a.then((r)=>fn(obj[key], key, r)), Promise.resolve());

const addNumVotesToMsg = (msgEvt, options=[])=>{
	return sequence(options, (opt, idx)=>{
		return Slack.react(msgEvt, emojis[idx])
			.then(()=>wait(300))
	})
};


/* Slash Command Helper */
Slack.onMessage((msg)=>{
	if(msg.subtype == 'bot_message' && global.pollRequests[msg.text]){
		addNumVotesToMsg(msg, global.pollRequests[msg.text]);
		delete global.pollRequests[msg.text];
	}
});

Slack.onMessage((msg)=>{
	if(msg.subtype == 'bot_message' || msg.text.indexOf('/poll') == 0) return;
	if(msg.text.indexOf('poll:') == 0 || msg.text.indexOf('Poll:') == 0){
		const {question, options} = processPollMessage(msg.text.slice(5));
		if(!question || !options || options.length < 2){
			return send(msg.channel, getHelpMessage());
		}
		return send(msg.channel, getMessage(question, options))
			.then((res)=>{
				addNumVotesToMsg(res, options)
			})
	}
	if(Slack.msgHas(msg, ['poll', 'pollbot'], ['make', 'do', 'create', 'forget'])){
		return send(msg.channel, getHelpMessage());
	}
});


