const _ = require('lodash');
const Slack = require('pico-slack');

const ScotchAPI = require('./scotch.api.js');
const Formatter = require('./scotch.formatter.js');
const Groups = require('./group.info.js');
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

const recommendScotch = (text)=>{
	text = text.toLowerCase();
	const group = Groups.getMatchingGroup(text);

	let costs = ['$$$', '$$$$'];
	if(Slack.msgHas(text, ['cheap', 'poor', 'inexpensive'])){
		costs = ['$', '$$']
	}
	if(Slack.msgHas(text, ['fancy', 'rich', 'expensive', 'pricy'])){
		costs = ['$$$$$', '$$$$$+']
	}
	return ScotchAPI.search({
		groups :[group],
		costs : costs
	});
}


Slack.onMessage((msg)=>{
	if(!Slack.msgHas(msg.text, 'scotchbot')) return;
	const send = (text)=>Slack.msgAs('scotchbot', ':wine_glass:', msg.channel, text);

	if(Slack.msgHas(msg.text, ['introduce yourself', 'say hello'])){
		return send(`Why hello, everyone. `)
	}

	if(Slack.msgHas(msg.text, ['help', 'what do you do'])){
		return send(`Well, I can do a great many things. My knowledge of scotch is unrivaled.`
			+ `I can give a review and nearly every scotch, and can recommend you a scotch if you let me know what you like`
		);
	}

	if(Slack.msgHas(msg.text, ['random', 'heart'])){
		return send(Formatter.random(_.sample(ScotchAPI.list)));
	}

	if(Slack.msgHas(msg.text, ['tell me', 'review', 'describe', 'description', 'thoughts'])){
		const {scotch, confidence} = ScotchAPI.lookup(getImportantWords(msg.text));
		return send(Formatter.lookup(scotch, confidence));
	}

	if(Slack.msgHas(msg.text, ['recommend', 'suggest'])){
		const scotches = _.sampleSize(recommendScotch(msg.text), _.sample([1,1,1,1,2]))
		if(scotches.length == 0){
			return send(`_I couldn't find anything for you, however..._\n` +
				Formatter.random(_.sample(ScotchAPI.list)));
		}
		return send(Formatter.recommend(scotches));
	}

});



//const result = Groups.getMatchingGroup('Give me something medicinal')

//console.log(recommendScotch('Give me something medicinal and cheap'));
//console.log(recommendScotch('Give me something sweet and fancy'));


// const result = ScotchAPI.search({
// 	groups :['J'],
// 	costs : ['$', "$$", '$$$']
// })

// console.log(result);



//Hey scothcbot, can you recommend me something sweet and very smoky, but cheap, but I'm poor?





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
