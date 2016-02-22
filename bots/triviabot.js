var _ = require('lodash');
var request = require('superagent');

var categoryIds = {
	science : 25,
	animals : 21,
	water : 211,
	nature : 267,
	'4 letter words' : 51,
	homophones : 249,
	food : 49,
	rhymes : 561,
	'Word Origins' : 223
};

var questionCache = {}
var scores = {}

var isActive = false;
var storedClue = {};
var channel;
var timer;

var getQuestion = function(category, cb){
	if(questionCache[category]){
		return cb(_.sample(questionCache[category]));
	}
	request.get("http://jservice.io/api/clues?category=" + categoryIds[category])
		.send()
		.end(function(err, res){
			questionCache[category] = res.body;
			cb(_.sample(questionCache[category]));
		});
}

var isQuestionStart = function(msg){
	return  _.includes(msg.toLowerCase(), 'higgins') &&
			_.includes(msg.toLowerCase(), 'trivia') &&
			!isActive;
}

var isScoreboardRequest = function(msg){
	return  _.includes(msg.toLowerCase(), 'higgins') &&
			_.includes(msg.toLowerCase(), 'score') &&
			!_.isEmpty(scores);
}

var startTimer = function(Higgins){
	timer = setTimeout(function(){
		Higgins.reply("Times nearly up!");
		timer = setTimeout(function(){
			Higgins.reply("Times up! The answer is *" + storedClue.answer + "*");
			cleanup();
		}, 15000);
	}, 30000)

};

var cleanup = function(){
	storedClue = {};
	isActive = false;
	channel = null;
	clearTimeout(timer);
}

var checkAnswer = function(msg){
	if(!msg) return;
	var msgWords = _.words(msg.toLowerCase());
	var answer = _.words(storedClue.answer.toLowerCase());

	var dumbWords = ['the', 'their', 'sir', "its", "it's", 'a', 'an'];

	//each answer word must appear in the message
	return _.every(answer, (answerWord)=>{
		if(_.includes(dumbWords, answerWord)) return true;
		return _.includes(msgWords, answerWord);
	})
}

var getScoreboard = function(){
	var sortedScores = _.sortBy(scores, (score)=>{
		return 999999 - score.points;
	});
	return _.map(sortedScores, (score)=>{
		return ':' + score.user + ': has ' + score.points + ' points';
	}).join('\n');
};


module.exports = {
	listenFor : ['message'],
	response  : function(msg, info, Higgins){
		if(info.channel !== 'trivia-time') return;

		if(isQuestionStart(msg)){
			var category = _.sample(_.keys(categoryIds));
			return getQuestion(category, function(clue){
				isActive = true;
				storedClue = clue;
				storedClue.answer = storedClue.answer.replace('<i>', '').replace('</i>', '')
				startTimer(Higgins);
				channel = info.channel;
				Higgins.reply("The category is *" + category + "* worth " + clue.value +" points!\n" + clue.question);
			})
		}else if(isScoreboardRequest(msg)){
			return reply(getScoreboard());
		}else if(isActive && channel == info.channel){
			if(checkAnswer(msg)){
				//Increase scores
				if(!scores[info.user]) scores[info.user] = {user: info.user, points: 0};
				scores[info.user].points += storedClue.value;

				Higgins.reply("Correct! Good job " + info.user + "!\n\n" + getScoreboard());

				cleanup();
			}else{
				Higgins.react('no_entry_sign');
			}
		}
	}
}