const _ = require('lodash');
const Slack = require('pico-slack');

const pos = require('pos');
const speak = require('speakeasy-nlp');

//Add people's names to the POS system
// Add notable locations or other words to the POS system

/*


 //Remove special characters and return an array of tokens (words).
module.exports = function(input) {
    return input
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=_`\"~()]/g, '')
        .split(' ');
};
*/


const coreSpeech = (text, filteredWords=[])=>{
	let words = new pos.Lexer().lex(text.toLowerCase());
	console.log(words);
	words = _.filter((new pos.Tagger()).tag(words), (info)=>!_.includes(filteredWords, info[0]));
	return _.reduce(words, (acc, info)=>{
		const word = info[0];
		const partOfSpeech = info[1];
		if(_.includes(['NN', 'NNP', 'NNPS', 'CD', 'NNS', 'WP', 'WRB'], partOfSpeech)){
			acc.push(word);
		}
		return acc;
	}, []);
};

const classifySpeech = (text)=>{
	const res = speak.classify(text);
	delete res.tokens;
	return res;
};


Slack.onMessage((msg)=>{
	if(!(Slack.has(msg.text, [Slack.bot.id, 'higgins', 'higs']) && msg.channel == 'bottin-around')) return;
	const text = msg.text.replace(`<@${Slack.bot.id}>`, '').replace('higgins', '').replace('Higgins', '');

	const sentiment = speak.sentiment.analyze(text);

	Slack.msgAs('nlpbot', ':memo:', msg, `Core : \`${coreSpeech(text).join(' ')}\`
Classify :
\`\`\`${JSON.stringify(classifySpeech(text), null, '  ')}\`\`\`

Sentiment : \`score: ${sentiment.score}, comparative: ${sentiment.comparative}\`
`);

});