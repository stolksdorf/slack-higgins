const config = require('nconf');
const _ = require('lodash');
const Slack = require('pico-slack');
const MarkovService = require('./markov.service.js');

const SafeChannels = [
	'1861',
	'arts-and-crafts',
	'automation',
	'always-sunny',
	'automation',
	'boardgames',
	'climbing',
	'cooking-and-baking',
	'coding',
	'design-dabblers',
	'diet-talk',
	'dnd',
	'dnd-homebrew',
	'events',
	'floofs',
	'feedback',
	'listen-to-this',
	'general',
	'green-thumbs',
	'habitual-homebrewers',
	'hmmm',
	'mighty-maple-leafs',
	'myers-briggs',
	'overwatch',
	'random',
	'science',
	'the-tasting-room',
	'travel-talk',
	'vidya'
].map((channel)=>`in:${channel}`).join(' ');


let total = 0;

const fetch = async (query, page=1, Messages={})=>{
	console.log('Fetching page', page);
	return Slack.api('search.messages', {
		token : config.get('command_token'),
		count : 100,
		page,
		query,
	}).then((res)=>{
		Messages = res.messages.matches.reduce((acc, msg)=>{
			total += 1;
			const user = Slack.users[msg.user];
			if(user){
				acc[user] = acc[user] || [];
				acc[user].push(msg.text);
			}
			return acc;
		}, Messages);
		if(res.messages.pagination.page < res.messages.pagination.page_count){
			return fetch(query, page +1, Messages);
		}
		return Messages;
	});
}

const send = (msg)=>{
	return Slack.sendAs('botbot', ':robot_face:', 'bottin-around', msg);
};

module.exports = async ()=>{
	try{
		await send(`Getting slack history...`);
		let messages = await fetch(SafeChannels);
		await send(`Fetched a total of ${total} messages`);

		await _.reduce(messages, (flow, msgs, user)=>{
			return flow.then(async ()=>{
				await send(`Encoding ${msgs.length} of ${user}'s messages...`);
				await MarkovService.encodeMessages(user, msgs)
			});
		}, Promise.resolve());

		send('All done!');
	}catch(err){
		console.log(err);
		console.log(err.message);
	}


}