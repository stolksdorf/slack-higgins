var _ = require('lodash');
var request = require('superagent');

var Storage = require('slack-helperbot/storage');

var ClueCache = Storage.get("trivia_cluecache") || {};


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


var TriviaApi = {
	getClue : function(categoryId, cb){
		var getQuestion = function(){
			//Remove a random element from the question cache
			var clue = ClueCache[categoryId].splice(_.random(ClueCache[categoryId].length - 1), 1)[0];
			Storage.set("trivia_cluecache", ClueCache);

			//Check for invalid questions
			if(!clue || !clue.answer || !clue.question){
				console.log('invalid question');
				return getQuestion();
			}
			if(!clue.value) clue.value = 400;

			cb(clue);
		}

		//If we don't have questions in that category, refresh the pool
		if(!ClueCache[categoryId] || !ClueCache[categoryId].length){
			return TriviaApi.refreshCategoryPool(categoryId, function(questions){
				getQuestion();
			})
		}

		return getQuestion();
	},

	refreshCategoryPool : function(categoryId, cb){
		var questions = [];
		var offset = 0;

		var callCategories = function(){
			request.get("http://jservice.io/api/clues?category=" + categoryId + '&offset=' + offset)
				.send()
				.end(function(err, res){
					if(res.body.length){
						offset += res.body.length;
						questions = _.union(questions, res.body);
						callCategories();
					}else{
						//when we run out of questions, finish the callback
						ClueCache[categoryId] = questions;
						Storage.set("trivia_cluecache", ClueCache);
						cb(questions);
					}
				});
		}
		callCategories();
	},

	checkAnswer : function(clueAnswer, msg){
		if(!msg) return false;
		var dumbWords = ['the', 'their', 'sir', 'its', 'a', 'an', 'and', 'or', 'to', 'thing', 'things'];

		var msgWords = stringToCleanWordArray(msg);
		var answerWords = stringToCleanWordArray(clueAnswer);

		//each answer word must appear in the message
		return _.every(answerWords, (answerWord)=>{
			if(_.includes(dumbWords, answerWord)) return true;
			return _.includes(msgWords, answerWord);
		});

	},

	//returns a map of category id, name, and poolSize
	getCategories : function(categoryMap){
		return _.map(categoryMap, (id, name)=>{
			return {
				id : id,
				name : name,
				size : (ClueCache[id] ? ClueCache[id].length : '???')
			};
		});
	},

};



module.exports = TriviaApi;
