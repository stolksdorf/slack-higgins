const _ = require('lodash');
const Slack = require('pico-slack');
const fs = require('fs');
const config = require('nconf');

const MARKOV_DEPTH = 6;
const SEP = '';

const SafeChannels = _.map([
	'1861',
	'arts-and-crafts',
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
], (channel)=>`in:${channel}`).join(' ');

const mappings = {};

const buildMap = (msgs)=>{
	const result = {starts: [], chain: {}};
	_.each(msgs, (msg)=>{
		if(!msg) return;
		const words = msg.split(SEP);
		words.push(false);
		result.starts.push(_.slice(words, 0, MARKOV_DEPTH));
		const key = [];
		_.each(words, (word)=>{
			if(key.length == MARKOV_DEPTH){
				const stringkey = key.join('|');
				result.chain[stringkey] = result.chain[stringkey] || [];
				result.chain[stringkey].push(word);
			}
			key.push(word);
			if(key.length > MARKOV_DEPTH) key.shift();
		});
	});
	return result;
};

const searchMessages = (query, page=1)=>{
	return Slack.api('search.messages', {
		token : config.get('command_token'),
		sort  : 'timestamp',
		count : 100,
		page,
		query,
	})
		.then((res)=>{
			const result = _.reduce(res.messages.matches, (r, msg)=>{
				const text = msg.text.replace(/(<h.+>)/gi, '').trim(); //Remove links from messages
				if(text.indexOf('uploaded a file:') !== -1) return r;  //Skip file upload messages
				if(text) r.push(text);
				return r;
			}, []);
			//console.log(res.messages.matches.length, result.length);
			if(res.messages.pagination.page < res.messages.pagination.page_count){
				return searchMessages(query, page + 1)
					.then((msgs)=>_.concat(msgs, result));
			}
			return result;
		});
};

const hasMapping = (username)=>!!mappings[username];


const getMapping = (username)=>{
	if(hasMapping(username)) return Promise.resolve({mapping: mappings[username]});
	let query = `from:${username} ${SafeChannels}`;
	if(username=='hivebot') query = `${SafeChannels}`;
	return searchMessages(query)
		.then((msgs)=>{
			mappings[username] = buildMap(msgs);
			Slack.debug(`Map for ${username}bot built with ${_.size(msgs)} messages`);
			return {
				mapping : mappings[username],
				info    : {
					msgs  : _.size(msgs),
					chars : _.sumBy(msgs, (msg)=>msg.length)
				}
			};
		});
};

const genMessage = (mapping, info)=>{
	const msgArray = _.sample(mapping.starts);
	const chooseWord = ()=>{
		if(_.last(msgArray) === false) return _.initial(msgArray);
		const key = _.slice(msgArray, msgArray.length - MARKOV_DEPTH).join('|');
		const choiceArray = mapping.chain[key];
		if(!choiceArray) return msgArray;
		msgArray.push(_.sample(choiceArray));
		return chooseWord();
	};
	return {
		text : chooseWord().join(SEP),
		info
	};
};

const sendMessage = (name, icon, channel, {text='', info=false})=>{
	return Slack.api('chat.postMessage', {
		channel     : channel,
		username    : name,
		icon_emoji  : `:${icon}:`,
		attachments : JSON.stringify([{
			pretext   : text,
			mrkdwn_in : ['pretext'],
			footer    : (info ? `built with ${info.msgs} messages, using ${info.chars} letters.` : '')
		}])
	});
};

Slack.onMessage((msg)=>{
	_.each(Slack.users, (user)=>{
		if(Slack.msgHas(msg.text, `${user}bot`)){
			if(!hasMapping(user)) sendMessage(`${user}bot`, user, msg.channel, {text: ':timer_clock: `hold plz...`'});

			getMapping(user, msg.channel)
				.then(({mapping, info})=>genMessage(mapping, info))
				.then((text)=>sendMessage(`${user}bot`, user, msg.channel, text))
				.catch((err)=>Slack.error(err));
		}
	});
	if(Slack.msgHas(msg.text, 'hivebot')){
		getMapping('hivebot', msg.channel)
			.then(({mapping, info})=>genMessage(mapping, info))
			.then((text)=>sendMessage('hivebot', 'hivebot', msg.channel, text))
			.catch((err)=>Slack.error(err));
	}
});

/** Thesis Bot **/
const thesis = fs.readFileSync('./bots/katie_thesis.txt', 'utf8');
const thesisMapping = buildMap(thesis.split('\n'));
Slack.onMessage((msg)=>{
	if(Slack.msgHas(msg.text, 'thesisbot')){
		sendMessage('thesisbot', 'pencil', msg.channel, genMessage(thesisMapping))
			.catch((err)=>Slack.error(err));
	}
});

/** Random Proc **/
const HOURS = 1000 * 60 * 60;
const sendRandomMessage = ()=>{
	const randomUser = _.sample(Slack.users);
	getMapping(randomUser)
		.then(({mapping, info})=>genMessage(mapping, info))
		.then((text)=>sendMessage(`${randomUser}bot`, randomUser, 'bottin-around', text))
		.then(()=>makeTimeout());
};
const makeTimeout = ()=>setTimeout(()=>sendRandomMessage(), _.random(5, 10) * HOURS);
makeTimeout();
