const _ = require('lodash');
const Slack = require('pico-slack');
const Redis = require('pico-redis')('pizzabot');

const toppings = [
	'red_circle',
	'mushroom',
	'bell',
	'tomato',
	'cheese',
	'hot_pepper',
	'pineapple',
	'chicken',
	'cow2',
	'pig2',
	'hotdog',

	'garlic',
	'onion',
	'olive',
	'olive_black'
];


let storedMsg;

const messageAndReact = (channel, text, reactions=[])=>{
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

const getMessageReactions = (msg)=>{
	return Slack.api('reactions.get', {
			timestamp : msg.ts,
			channel : msg.channel
		})
		.then((res)=>{
			return _.reduce(res.message.reactions, (r, reaction)=>{
				if(!_.includes(toppings, reaction.name)) return r;
				_.each(reaction.users, (user)=>{
					if(!r[Slack.users[user]]) r[Slack.users[user]] = [];
					r[Slack.users[user]].push(reaction.name);
				})
				return r;
			}, {})
		});
}

Slack.onMessage((msg)=>{
	if(!Slack.msgHas(msg.text, 'pizzabot')) return;

	if(Slack.msgHas(msg.text, 'test')){
		getMessageReactions(storedMsg)
			.then((reactions)=>console.log(reactions))
		return;
	}

	messageAndReact(msg.channel, 'Pick your *favourite* toppings', toppings)
		.then((res)=>{
			console.log('COOL RES', res);
			storedMsg = res;
		})


});

