const Slack = require('pico-slack');
const _ = require('lodash');

const jokes = [
	{
		triggers : ['I feel so dumb', 'I\'m an idiot', 'I\'m so dumb'],
		joke     : 'I guess you didn\'t fall too far from the turnip truck.',
		who      : ['chris']
	},
	// 	{
	// 	triggers: ['too hard', 'I give up', 'I don\'t know what I\'m doing'],
	// 	joke: 'That\'s one tough cookie to crumble!',
	// 	who: ['chris']
	// 	},
	{
		triggers : 'make me a sandwich',
		joke     : ['Poof! Chris is a sandwich!'],
		who      : ['chris']
	},
	{
		triggers : ['so tired', 'too tired'],
		joke     : 'Last night I dreamed I was a muffler, when I woke up this morning I was exhausted.',
		who      : ['chris']
	},
];

const findJoke = (text)=>{
	return _.find(jokes, (joke)=>{
		return Slack.has(text, joke.triggers);
	});
};

const ohHai = (msg)=>{
	const joke = findJoke(msg.text);
	if(joke){
		Slack.alias('JokeBot', ':chris:').send(msg, joke.joke);
	}
// 	Slack.log(msg, joke);
};

//Slack.onMessage(ohHai);
