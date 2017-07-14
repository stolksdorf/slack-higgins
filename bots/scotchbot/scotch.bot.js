const _ = require('lodash');
const Slack = require('pico-slack');

const ScotchAPI = require('./scotch.api.js');
const Formatter = require('./scotch.formatter.js');
const pos = require('pos');


const getImportantWords = (text)=>{
	const words = new pos.Lexer().lex(text.toLowerCase());
	const filteredWords = _.filter((new pos.Tagger()).tag(words), (info)=>{
		return !_.includes(['scotchbot', 'review'], info[0])
	})
	return _.reduce(filteredWords, (acc, info)=>{
		const word = info[0];
		const partOfSpeech = info[1];
		if(_.includes(['NN', 'NNP', 'NNPS', 'CD'], partOfSpeech)){
			acc.push(word);
		}
		return acc;
	}, []).join(' ');
}


Slack.onMessage((msg)=>{
	if(!Slack.msgHas(msg.text, 'scotchbot')) return;
	const send = (text)=>Slack.msgAs('scotchbot', ':wine_glass:', msg.channel, text);

	if(Slack.msgHas(msg.text, ['random', 'heart', 'recommend'])){
		return send(Formatter.random(_.sample(ScotchAPI.list)));
	}

	if(Slack.msgHas(msg.text, ['tell me', 'review', 'describe', 'description', 'thoughts'])){
		const {scotch, confidence} = ScotchAPI.lookup(getImportantWords(msg.text));
		return send(Formatter.lookup(scotch, confidence));
	}

});






/* Lookup */

// parse(`Hey scotchbot, can you tell me about Ardbeg?`)
// parse(`scotchbot what's your review of Ardbeg`)
// parse(`scotchbot can you give me a review of Ardbeg`)
// parse(`Scotchbot, ardbeg, Thoughts?`)
// parse(`Macallan 10yo Sherry Oak`)
// parse(`Lagavulin 12yo Cask Strength`)









/* User Stories */
/*
- generally conversationalif no match
- Ask it for help,

- Recommend a scotch,
	- price, cheap, expensive
	- based on your collection?
	- name a soctch a similar scotch
	-

- info abut a scotch
- loosey goosey scotch name parsing

- Maintain a scotch collection,
	- redis
	- list, add, and remove
	-


*/
