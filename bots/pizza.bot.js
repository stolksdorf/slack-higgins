const _ = require('lodash');
const Slack = require('pico-slack');
const Redis = require('pico-redis')('pizzabot');


let tempTS;
let tempChannel;


const messageReact = (channel, text, reactions=[])=>{
	const flow = Promise.resolve();
	let end;

	return Slack.msgAs('pizzabot', ':pizza:', channel, text)
		.then((res)=>{
			end = res;
			_.each(reactions, (emoji)=>flow.then(()=>Slack.react(res, emoji)));
			return flow;
		})
		.then(()=>end)
}

Slack.onMessage((msg)=>{
	if(!Slack.msgHas(msg.text, 'pizzabot')) return;

	if(Slack.msgHas(msg.text, 'test')){
		Slack.api('reactions.get', {
			timestamp : tempTS,
			channel : tempChannel
		})
		.then((res)=>res.message.reactions)
		.then((reactions)=>console.log(reactions))



		return;
	}

	messageReact(msg.channel, 'test', ['+1', 'dizzy', 'on'])
		.then((res)=>{
			console.log('COOL RES', res);
			tempChannel = res.channel;
			tempTS = res.ts;
		})


});