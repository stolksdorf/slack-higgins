const _ = require('lodash');
const Slack = require('pico-slack');

const ScotchAPI = require('./scotch.api.js');
const Formatter = require('./scotch.formatter.js');
const Groups = require('./group.info.js');
const pos = require('pos');


const getImportantWords = (text)=>{
	const words = new pos.Lexer().lex(text.toLowerCase());
	const filteredWords = _.filter((new pos.Tagger()).tag(words), (info)=>{
		return !_.includes(['scotchbot', 'review'], info[0]);
	});
	return _.reduce(filteredWords, (acc, info)=>{
		const word = info[0];
		const partOfSpeech = info[1];
		if(_.includes(['NN', 'NNP', 'NNPS', 'CD'], partOfSpeech)){
			acc.push(word);
		}
		return acc;
	}, []).join(' ');
};

const recommendScotch = (text)=>{
	text = text.toLowerCase();
	const group = Groups.getMatchingGroup(text);

	let costs = ['$$$', '$$$$'];
	if(Slack.msgHas(text, ['cheap', 'poor', 'inexpensive'])){
		costs = ['$', '$$'];
	}
	if(Slack.msgHas(text, ['fancy', 'rich', 'expensive', 'pricy'])){
		costs = ['$$$$$', '$$$$$+'];
	}
	console.log(group, costs);

	return ScotchAPI.search({
		groups : group,
		costs  : costs
	});
};


Slack.onMessage((msg)=>{
	if(!Slack.msgHas(msg.text, 'scotchbot')) return;
	const send = (text)=>Slack.msgAs('scotchbot', ':scotch:', msg.channel, text);

	if(Slack.msgHas(msg.text, ['introduce yourself', 'say hello'])){
		return send('Greetings and saluations to the fine populace of Coolsville. '+
			'I, Scotchbot, am your steadfast servant in your sortie to seek out, however surreptitious or unsung, the most succulent of spirits; *Scotch*. ');
	}

	if(Slack.msgHas(msg.text, ['what can you do', 'how do you'])){
		return send('Well, I can do a great many things. My knowledge of scotch is unrivaled. '
			+ 'I can give a review of nearly every scotch or recommend you a scotch.\n\n'
			+ 'For example you can say \'Scotchbot mayhaps I desire to whet my palette with something smoky, pungent, and _very_ expensive\' or '
			+ '\'yo scotchbot whats the deal with Lagavulin?\'.'
		);
	}

	if(Slack.msgHas(msg.text, 'how', 'were', 'made')){
		return send('Well my good friend, you have the rare opportunity to witness the creation of such a fine bot as myself! ' +
			'\n\nhttps://www.youtube.com/playlist?list=PLAWj9jpFY-UsjNiFiACdUMP_dxJCK_QIv');
	}

	if(Slack.msgHas(msg.text, ['random', 'heart'])){
		return send(Formatter.random(_.sample(ScotchAPI.list)));
	}

	if(Slack.msgHas(msg.text, ['tell me', 'review', 'describe', 'description', 'thoughts', 'the deal'])){
		const {scotch, confidence} = ScotchAPI.lookup(getImportantWords(msg.text));
		return send(Formatter.lookup(scotch, confidence));
	}

	if(Slack.msgHas(msg.text, ['recommend', 'suggest', 'desire', 'palette', 'want'])){
		const scotches = _.sampleSize(recommendScotch(msg.text), _.sample([1, 1, 1, 1, 2]));
		if(scotches.length == 0){
			return send(`_I couldn't find anything for you, however..._\n${
				Formatter.random(_.sample(ScotchAPI.list))}`);
		}
		return send(Formatter.recommend(scotches));
	}

	return send(`_${Formatter.misunderstand()}_`);
});
