const _ = require('lodash');
const Slack = require('pico-slack');
const Redis = require('pico-redis')('pizzabot');

const PizzaEngine = require('./pizza.engine.js');

const sliceCounts = ['one','two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
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

	//'garlic',
	'onion',
	'olive',
	'olive_black'
];


let storedMsgs = {
	hunger : null,
	likes : null,
	hates : null
};

const messageAndReact = (channel, text, reactions=[])=>{
	let end;
	return Slack.msgAs('pizzabot', ':pizza:', channel, text)
		.then((res)=>{
			end = res;
			return _.reduce(reactions,
				(flow, emoji)=>flow.then(()=>Slack.react(res, emoji)).catch(()=>{}),
				Promise.resolve());
		})
		.then(()=>end)
};

const getMessageReactions = (msg, reactionSet)=>{
	return Slack.api('reactions.get', {
			timestamp : msg.ts,
			channel   : msg.channel
		})
		.then((res)=>{
			return _.reduce(res.message.reactions, (r, reaction)=>{
				if(!_.includes(reactionSet, reaction.name)) return r;
				_.each(reaction.users, (user)=>{
					if(Slack.users[user] == 'higgins') return;
					if(!r[Slack.users[user]]) r[Slack.users[user]] = [];
					r[Slack.users[user]].push(reaction.name);
				})
				return r;
			}, {})
		});
};

const sendPrefMessages = (msg)=>{
	return messageAndReact(msg.channel, 'How many slices will you eat?', sliceCounts)
		.then((sentMsg)=>{storedMsgs.hunger=sentMsg})
	.then(()=>messageAndReact(msg.channel, 'Pick the toppings you *like*', toppings))
		.then((sentMsg)=>{storedMsgs.likes=sentMsg})
	.then(()=>messageAndReact(msg.channel, 'Pick the toppings you *hate*', toppings))
		.then((sentMsg)=>{storedMsgs.hates=sentMsg})
	.catch((err)=>Slack.error(err))
}

const getPreferencesFromStored = ()=>{

	return Promise.all([
		getMessageReactions(storedMsgs.hunger, sliceCounts),
		getMessageReactions(storedMsgs.likes, toppings),
		getMessageReactions(storedMsgs.hates, toppings)
	])
	.then(([hunger, likes, hates])=>{
		console.log(hunger, likes, hates);
		let result = {};
		_.each(hates, (hate, peep)=>{
			if(!result[peep]) result[peep] = { hunger : 2 };
			result[peep].hate = hate;
		});
		_.each(likes, (like, peep)=>{
			if(!result[peep]) result[peep] = { hunger : 2 };
			result[peep].like = like;
		})
		_.each(hunger, (h, peep)=>{
			result[peep].hunger = _.indexOf(sliceCounts, _.last(h)) + 1;
		})
		return result
	})


}

Slack.onMessage((msg)=>{
	if(!Slack.msgHas(msg.text, 'pizzabot')) return;

	if(Slack.msgHas(msg.text, 'test')){
		messageAndReact(msg.channel, 'How many slices will you eat?', sliceCounts)
	}

	if(Slack.msgHas(msg.text, 'go')){
		sendPrefMessages(msg);
	}

	if(Slack.msgHas(msg.text, 'ready')){
		getPreferencesFromStored()
			.then((prefs)=>{
				const pizza = PizzaEngine.getOptimalPizzaSet(prefs);
				Slack.msg(msg.channel, '```\n' + JSON.stringify(prefs, null, '  ') + '\n```')
				Slack.msg(msg.channel, '```\n' + JSON.stringify(pizza, null, '  ') + '\n```')
			});
	}


});

