const _ = require('lodash');
const Slack = require('pico-slack');
const config = require('nconf');

const MARKOV_DEPTH = 2;

let mappings = {};

const buildMap = (msgs)=>{
	let result = { starts : [], chain : {}};
	_.each(msgs, (msg)=>{
		let words = msg.split(' ');
		words.push(false);
		result.starts.push(_.slice(words, 0, MARKOV_DEPTH))
		let key = [];
		_.each(words, (word)=>{
			if(key.length == MARKOV_DEPTH){
				const stringkey = key.join('|');
				result.chain[stringkey] = result.chain[stringkey] || [];
				result.chain[stringkey].push(word);
			}
			key.push(word);
			if(key.length > MARKOV_DEPTH) key.shift();
		});
	})
	return result;
}

const getMapping = (username)=>{
	if(mappings[username]) return Promise.resolve(mappings[username]);
	Slack.debug(`Building mapping for ${username}`);
	return Slack.api('search.messages', {
		token : config.get('markov_token'),
		query : `from:${username}`,
		sort : 'timestamp',
		count : 1000
	})
	//TODO: add a direct message filter here
	.then((res)=>_.map(res.messages.matches, (msg)=>msg.text))
	.then((msgs)=>{
		mappings[username] = buildMap(msgs);
		Slack.debug(`Built with ${_.size(mappings[username].chain)}`);
		return mappings[username];
	})
}

const genMessage = (mapping)=>{
	let msgArray = _.sample(mapping.starts);
	const chooseWord = ()=>{
		if(_.last(msgArray) === false) return _.initial(msgArray);
		const key = _.slice(msgArray, msgArray.length - MARKOV_DEPTH).join('|');
		const choiceArray = mapping.chain[key];
		if(!choiceArray) return msgArray;
		msgArray.push(_.sample(choiceArray));
		return chooseWord();
	}
	return chooseWord().join(' ');
}

Slack.onMessage((msg)=>{
	_.each(Slack.users, (user)=>{
		if(Slack.msgHas(msg.text, `${user}bot`)){
			getMapping(user)
				.then((mapping)=>genMessage(mapping))
				.then((text)=>Slack.msgAs(`${user}bot`, user, msg.channel, text))
				.catch((err)=>Slack.error(err))
		}
	})
});
