var _ = require('lodash');
var request = require('superagent');

var categoryIds = {
	science : 25,
	animals : 21,
	water : 211,
	nature : 267,
	'4 letter words' : 51,
	homophones : 249,
	food : 49
};

var questionCache = {
	science : [],
	animals : [],
	water : [],
	nature : [],
	'4 letter words' : [],
	homophones : [],
	food : []
}

var scores = {}

var isActive = false;
var storedClue = {};
var channel;
var timer;

var getQuestion = function(category, cb){
	if(questionCache[category].length){
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

var startTimer = function(reply){
	timer = setTimeout(function(){
		reply("Times nearly up!");
		timer = setTimeout(function(){
			reply("Times up! The answer is *" + storedClue.answer + "*");
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
	var msgWords = _.words(msg.toLowerCase());
	var answer = _.words(storedClue.answer.toLowerCase());

	var dumbWords = ['the', 'their', 'sir', "its", "it's", 'a'];

	//each answer word must appear in the message
	return _.every(answer, (answerWord)=>{
		if(_.includes(dumbWords, answerWord)) return true;
		return _.includes(msgWords, answerWord);
	})
}

var messageScores = function(reply){
	reply(//"*Scores for this round are:*\n" +
		_.map(scores, (points, user)=>{
			return ':' + user + ': has ' + points + ' points';
		}).join('\n')
	);
};


module.exports = {
	listenFor : ['message'],
	response  : function(msg, info, reply, Higgins){
		console.log(info);
		if(isQuestionStart(msg)){
			var category = _.sample(_.keys(categoryIds));
			return getQuestion(category, function(clue){
				isActive = true;
				storedClue = clue;
				startTimer(reply);
				channel = info.channel;
				reply("The category is *" + category + "* worth " + clue.value +" points!\n" + clue.question);
			})
		}else if(isActive && channel == info.channel){
			if(checkAnswer(msg)){
				reply("Correct! Good job " + info.user + "!");

				//Increase scores
				if(!scores[info.user]) scores[info.user] = 0;
				scores[info.user] += storedClue.value;
				messageScores(reply);

				cleanup();
			}else{
				Higgins._api('reactions.add', {
					name : 'no_entry_sign',
					channel : info.channelId,
					timestamp : info.ts
				});
			}
		}
	},


}