var _ = require('lodash');
var request = require('superagent');
var moment = require('moment');
var Storage = require('slack-helperbot/storage');
var utils = require('slack-helperbot/utils');
var TriviaApi = require('trivia.api.js');

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


var Scores = {};
Storage.getAsync("trivia_scores", function(scores){
	Scores = scores || {};
});

var isActive = false;
var storedClue = {};
var Higs = {};
var timer;


var higginsNames = [
	'higgins', 'hizzle', 'h-dawg', 'higs', 'higgs', 'boson', 'good sir',
	'higgles', 'higgers', 'old chap', 'old boy', 'higgings', 'higgidy'
];

var isTriviaRequest = function(msg){
	return !isActive && utils.messageHas(msg, higginsNames, [
		'trivia', 'another', 'trizzle', 'question', 'quite so', 'hit me', 'quiz', 'very good', 'well done','once more',
		'keep em coming', "keep 'em coming", "don't stop", 'brain buster', 'small potatoes', 'hit it',
		'brain teaser', 'yet more', 'even more'
	])
}
var isScoreboardRequest = function(msg){
	return utils.messageHas(msg, higginsNames, ['score', 'scoreboard', 'points', 'winning', 'crowns']);
}
var isCategoriesRequest = function(msg){
	return utils.messageHas(msg, higginsNames, ['categories', 'category']);
}


var getCategoryId = function(msg){
	var result = _.reduce(Categories, function(r, id, name){
		if(_.includes(msg.toLowerCase(), name.toLowerCase())) return id;
		return r;
	}, false)

	//If no match, get random category
	if(!result) return _.sample(_.values(Categories));
	return result;
}

var startTimer = function(){
	timer = setTimeout(function(){
		Higs.reply("Times nearly up!");
		timer = setTimeout(function(){
			Higs.reply("Times up! The answer is *" + storedClue.answer + "*");
			cleanup();
		}, 15000);
	}, 30000)

};

var cleanup = function(){
	storedClue = {};
	isActive = false;
	clearTimeout(timer);
}


var increaseScore = function(username, points){
	if(!Scores[username]){
		Scores[username] = {
			user   : username,
			points : 0,
			crowns : 0
		};
	}
	Scores[username].points += points;

	if(Scores[username].points >= CROWN_THRESHOLD){
		awardCrown(username);
	}else{
		Higs.reply("Correct! Good job " + username + "! You been awarded " + points + " points");
		printScoreboard();
	}

	Storage.set('trivia_scores', Scores);
}


var awardCrown = function(username){
	Scores[username].crowns += 1;
	_.each(Scores, (score)=>{
		score.points = 0;
	});
	Higs.reply("Congrats " + username +
		"! You've been awarded a :crown: ! https://media.giphy.com/media/WWrf3mWsicNqM/giphy.gif \n"
		+ printScoreboard() +"\n\nScores reset!");
};


var printCategories = function(){
	var categories = _.map(TriviaApi.getCategories(Categories), (cat)=>{
		return cat.name + ' - _' + cat.size + '_'
	}).join('\n');

	Higs.reply('The categories are: \n' + categories);
}

var printScoreboard = function(){
	var sortedScores = _.sortBy(Scores, (score)=>{
		return 999999 - score.points;
	});
	Higs.reply('\n' + _.map(sortedScores, (score)=>{
		return ':' + score.user + ': has ' + score.points + ' points \t' +
			_.times(score.crowns, ()=>{return ':crown:'}).join(' ');
	}).join('\n'));
};

var refreshCategoryPool = function(categoryId){
	TriviaApi.refreshCategoryPool(categoryId, function(){
		Higs.reply('Refreshed category pool!');
	})
}


module.exports = {
	listenIn : 'trivia-time',
	listenFor : ['message'],
	response  : function(msg, info, Higgins){
		if(!msg) return;
		Higs = Higgins;

		if(isTriviaRequest(msg)){
			return TriviaApi.getClue(getCategoryId(msg), function(clue){
				isActive = true;
				storedClue = clue;
				startTimer();
				Higgins.reply("The category is *" + clue.category.title + "* worth " + clue.value +" points!\n" + clue.question);
			})
		}else if(isCategoriesRequest(msg)){
			return printCategories();
		}else if(isScoreboardRequest(msg)){
			return printScoreboard();

		}else if (utils.messageHas(msg, higginsNames, 'refresh')){
			return refreshCategoryPool(getCategoryId(msg));
		}else if(isActive){
			if(TriviaApi.checkAnswer(storedClue.answer, msg)){
				increaseScore(info.user, storedClue.value);
				cleanup();
			}else{
				Higgins.react('no_entry_sign');
			}
		}
	}
}
