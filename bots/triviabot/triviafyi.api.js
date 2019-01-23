const request = require('superagent');
const cheerio = require('cheerio');
const _ = require('lodash');

// https://trivia.fyi/random-trivia-questions/


const stringToCleanWordArray = (string) =>{
	return _.chain(string)
		.words(/[^ \/-]+/g)
		.map((word)=>{
			return word.toLowerCase().replace(/<[^>]*>/g, '').replace(/\W+/g, '')
		})
		.map((word)=>{
			if(word[word.length-1] == 's'){
				const secLast = word[word.length-2]
				if(secLast !== 'u' && secLast !== 'i'&& secLast !== 's'){
					return word.replace(/s$/, '');
				}
			}
			return word;
		})
		.filter()
		.value();
};


const TriviaAPI = {
	refreshCategoryPool : async()=>{},
	getClue : async (categoryId)=>{
		return request.get('https://trivia.fyi/random-trivia-questions/')
			.then((res)=>cheerio.load(res.text))
			.then(($)=>{
				return {
					category : {
						title : 'triviafyi'
					},
					question : $('a.query-title-link').text().trim(),
					answer : $('.su-spoiler-content').text().trim(),
					value : 400
				}
			});
	},
	checkAnswer : (clueAnswer, msg)=>{
		if(!msg) return false;
		const dumbWords = ['the', 'their', 'sir', 'its', 'a', 'an', 'and', 'or', 'to', 'thing', 'things'];

		const msgWords = stringToCleanWordArray(msg);
		const answerWords = stringToCleanWordArray(clueAnswer);

		//each answer word must appear in the message
		return _.every(answerWords, (answerWord)=>{
			if(_.includes(dumbWords, answerWord)) return true;
			return _.includes(msgWords, answerWord);
		});

	},
	getCategories : ()=>{
		return [
			{
				id : 'triviafyi',
				name : "triviaFYI",
				size : 1
			}
		]
	}

}


module.exports = TriviaAPI;