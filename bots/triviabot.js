var _ = require('lodash');
var request = require('superagent');
var Storage = require('storage');

var CROWN_THRESHOLD = 25000;

var Categories = {
	science : 25,
	animals : 21,
	water : 211,
	nature : 267,
	'4 letter words' : 51,
	'5 letter words' : 139,
	homophones : 249,
	food : 49,
	rhymes : 561,
	'word origins' : 223,
	'science & nature' : 218,
	'before & after' : 1800,
	'familiar phrases' : 705,
	'common bonds' : 508,
	'hodgepodge' : 227,
	'mythology' : 680,

};

//Load persistant data
var questionCache = {};
Storage.get("trivia_cache", function(cache){
	questionCache = cache || {};
});

var Scores = {};
Storage.get("trivia_scores", function(scores){
	Scores = scores || {};
});

var isActive = false;
var storedClue = {};
var channel;
var timer;

var _contains = function(str, list){
	return _.some(list, (word)=>{
		return _.includes(str.toLowerCase(), word.toLowerCase());
	});
}

var getTrivia = function(Higgins, category, cb){

	var getQuestion = function(){
		//Higgins.reply("Pool size is " + questionCache[category].length)

		//Remove a random element from the question cache
		var question = questionCache[category].splice(_.random(questionCache[category].length - 1), 1)[0];
		Storage.set("trivia_cache", questionCache);
		cb(question);
	}

	if(questionCache[category]){
		return getQuestion();
	}
	Higgins.reply("Refreshing question pool for *" + category + "*...");
	request.get("http://jservice.io/api/clues?category=" + Categories[category])
		.send()
		.end(function(err, res){
			questionCache[category] = res.body;
			return getQuestion();
		});
}

var isTriviaRequest = function(msg){
	return _contains(msg, ['higgins', 'hizzle', 'h-dawg', 'higs', 'higgs', 'boson', 'very good', 'well done', 'quite so', 'my good sir', 'higgles', 'higgers']) &&
			_contains(msg, ['trivia', 'another', 'trizzle', 'question', 'hit me', 'quiz me', 'once more', 'keep em coming', 'don\'t stop', 'brain buster', 'small potatoes']) &&
			!isActive;
}
var isScoreboardRequest = function(msg){
	return _.includes(msg.toLowerCase(), 'higgins') &&
			_.includes(msg.toLowerCase(), 'score');
}
var isCategoriesRequest = function(msg){
	return _.includes(msg.toLowerCase(), 'higgins') &&
			_.includes(msg.toLowerCase(), 'categories');
}

var getCategory = function(msg){
	var result = _.reduce(Categories, function(r, id, name){
		if(_.includes(msg.toLowerCase(), name.toLowerCase())) return name;
		return r;
	}, false)

	//If no match, get random category
	if(!result) return _.sample(_.keys(Categories));
	return result;
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

// takes a string and splits it in to words using ' ', '/', and '-' as delimiters
// converts to lowercase
// removes html tags and punctuation
// removes trailing 's' or 'es'
var stringToCleanWordArray = function(string) {
	return _.chain(string)
		.words(/[^ \/-]+/g)
		.map((word) => {
			return word.toLowerCase().replace(/<[^>]*>/g, '').replace(/\W+/g, '').replace(/s$/, '');
		})
		.filter()
		.value();
};

var checkAnswer = function(msg){
	if(!msg) return;
	var dumbWords = ['the', 'their', 'sir', 'its', 'a', 'an', 'and', 'or', 'to', 'thing', 'things'];

	var msgWords = stringToCleanWordArray(msg);
	var answerWords = stringToCleanWordArray(storedClue.answer);

	//each answer word must appear in the message
	return _.every(answerWords, (answerWord)=>{
		if(_.includes(dumbWords, answerWord)) return true;
		return _.includes(msgWords, answerWord);
	});
}

var increaseScore = function(Higgins, user, newPoints){
	if(!Scores[user]){
		Scores[user] = {
			user   : user,
			points : 0,
			crowns : 0
		};
	}
	Scores[user].points += storedClue.value || 5001;

	if(Scores[user].points >= CROWN_THRESHOLD){
		Higgins.reply("Congrats " + user + "! You've been awarded a :crown: https://media.giphy.com/media/WWrf3mWsicNqM/giphy.gif! \n" + printScoreboard() +"\n\nScores reset!");
		Scores[user].crowns += 1;
		_.each(Scores, (score)=>{
			score.points = 0;
		});
	}else{
		Higgins.reply("Correct! Good job " + user + "!\n" + printScoreboard());
	}

	Storage.set('trivia_scores', Scores);
}

var printCategories = function(Higgins){
	Higgins.reply('The categories are: \n' +
		_.map(Categories, (id, name)=>{
			return name + " - " + (questionCache[name] ? questionCache[name].length : '?');
		}).join('\n'));
}

var printScoreboard = function(){
	var sortedScores = _.sortBy(Scores, (score)=>{
		return 999999 - score.points;
	});
	return _.map(sortedScores, (score)=>{
		return ':' + score.user + ': has ' + score.points + ' points \t' +
			_.times(score.crowns, ()=>{return ':crown:'}).join(' ');
	}).join('\n');
};


module.exports = {
	listenFor : ['message'],
	response  : function(msg, info, Higgins){
		if(info.channel !== 'trivia-time' && !process.env.LOCAL) return;
		if(!msg) return;

		if(isTriviaRequest(msg)){
			var category = getCategory(msg);
			return getTrivia(Higgins, category, function(clue){
				isActive = true;
				storedClue = clue;
				storedClue.answer = storedClue.answer.replace('<i>', '').replace('</i>', '')
				startTimer(Higgins);
				channel = info.channel;
				Higgins.reply("The category is *" + category + "* worth " + clue.value +" points!\n" + clue.question);
			})
		}else if(isCategoriesRequest(msg)){
			return printCategories(Higgins);
		}else if(isScoreboardRequest(msg)){
			return Higgins.reply(' \n ' + printScoreboard());
		}else if(isActive && channel == info.channel){
			if(checkAnswer(msg)){
				if(Scores.scott && info.user != 'scott') Scores.scott.points++;
				increaseScore(Higgins, info.user, storedClue.value);
				cleanup();
			}else{
				Higgins.react('no_entry_sign');
			}
		}
	}
}
