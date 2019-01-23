const _ = require('lodash');
const Slack = require('pico-slack');
const Storage = require('pico-redis')('trivia');
//const TriviaApi = require('./jservice.api.js');
const TriviaApi = require('./triviafyi.api.js');

const CROWN_THRESHOLD = 10000;
const AUTO_PROC = true;


let activeClue = null;
let timer;
let someoneHasTried = false;


const higginsNames = [
	'higgins', 'hizzle', 'h-dawg', 'higs', 'higgs', 'boson', 'good sir',
	'higgles', 'higgers', 'old chap', 'old boy', 'higgings', 'higgidy'
];

const isActive = ()=>!!activeClue;
const isTriviaRequest = (msg)=>{
	return !isActive() && Slack.msgHas(msg.text, higginsNames, [
		'trivia', 'another', 'trizzle', 'question', 'quite so', 'hit me', 'quiz', 'very good', 'well done', 'once more',
		'keep em coming', 'keep \'em coming', 'don\'t stop', 'brain buster', 'small potatoes', 'hit it',
		'brain teaser', 'yet more', 'even more'
	]);
};
const isScoreboardRequest = (msg)=>Slack.msgHas(msg.text, higginsNames, ['score', 'scoreboard', 'points', 'winning', 'crowns'])
const isCategoriesRequest = (msg)=>Slack.msgHas(msg.text, higginsNames, ['categories', 'category'])
const send = (msg)=>Slack.send('trivia-time', msg);


const askQuestion = async (clue)=>{
	if(activeClue) return;
	if(!clue) clue = await TriviaApi.getClue();
	someoneHasTried = false;
	activeClue = clue;
	await send(`The category is *${clue.category.title}* worth ${clue.value} points!\n${clue.question}`);
	timer = setTimeout(()=>{
		send('Times nearly up!');
		timer = setTimeout(()=>{
			send(`Times up! The answer is *${activeClue.answer}*`);
			cleanup();
		}, 15000);
	}, 30000);
};

const cleanup = ()=>{
	activeClue = null;
	clearTimeout(timer);
	if(AUTO_PROC && someoneHasTried){
		setTimeout(()=>{
			send('`Auto-proccing a new question in 8 secs`')
			setTimeout(askQuestion, 8000);
		}, 500);
	}
};


const increaseScore = async (username, points)=>{
	const awardCrown = ()=>{
		Scores[username].crowns += 1;
		_.each(Scores, (score)=>score.points = 0);
		send(`Congrats ${username}! You've been awarded a :crown: ! https://media.giphy.com/media/WWrf3mWsicNqM/giphy.gif \n\nScores reset!`);
	};

	cleanup();

	let Scores = await Storage.get('scores') || {};

	if(!Scores[username]){
		Scores[username] = {
			user   : username,
			points : 0,
			crowns : 0
		};
	}
	Scores[username].points += points;

	if(Scores[username].points >= CROWN_THRESHOLD){
		awardCrown();
	}else{
		await send(`Correct! Good job :${username}:! You been awarded ${points} points`);
	}

	await Storage.set('scores', Scores);

};



const sendScoreboard = async ()=>{
	const Scores = await Storage.get('scores') || {};

	const sortedScores = _.sortBy(Scores, (score)=>999999 - score.points);
	send(`\n${_.map(sortedScores, (score)=>{
		return `:${score.user}: has ${score.points} points \t${_.times(score.crowns, ()=>':crown:').join(' ')}`;
	}).join('\n')}`);
};


Slack.onMessage(async (msg)=>{
	if(msg.channel !== 'trivia-time') return;

	if(isScoreboardRequest(msg)) return sendScoreboard();

	if(isActive()){
		someoneHasTried = true;
		if(TriviaApi.checkAnswer(activeClue.answer, msg.text)){
			return await increaseScore(msg.user, activeClue.value);
		}else{
			return Slack.react(msg, 'no_entry_sign');
		}
	}

	if(isTriviaRequest(msg)) return askQuestion();
});


//TriviaApi.getClue().then((clue)=>console.log(clue)).catch((err)=>console.log(err))