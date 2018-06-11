const _ = require('lodash');
const request = require('superagent');

const Storage = require('pico-redis')('trivia');

let CategoryCache = {};

// takes a string and splits it in to words using ' ', '/', and '-' as delimiters
// converts to lowercase
// removes html tags and punctuation
// removes trailing 's' or 'es'
const stringToCleanWordArray = (string) =>{
	return _.chain(string)
		.words(/[^ \/-]+/g)
		.map((word)=>{
			return word.toLowerCase().replace(/<[^>]*>/g, '').replace(/\W+/g, '').replace(/s$/, '');
		})
		.filter()
		.value();
};


var TriviaApi = {
	Categories : {
		science            : 25,
		animals            : 21,
		water              : 211,
		nature             : 267,
		'4 letter words'   : 51,
		'5 letter words'   : 139,
		homophones         : 249,
		food               : 49,
		rhymes             : 561,
		'word origins'     : 223,
		'science & nature' : 218,
		'before & after'   : 1800,
		'familiar phrases' : 705,
		'common bonds'     : 508,
		'hodgepodge'       : 227,
		'mythology'        : 680,
	},

	updateStorage : async ()=>Storage.set('categoryCache', CategoryCache),

	getClue : async (categoryId)=>{
		//await TriviaApi.updateStorage();

		if(!categoryId) categoryId = _.sample(Object.values(TriviaApi.Categories));
		if(_.isEmpty(CategoryCache)) CategoryCache = await Storage.get('categoryCache') || {};

		if(!CategoryCache[categoryId] || !CategoryCache[categoryId].length){
			console.log('refreshing');
			await TriviaApi.refreshCategoryPool(categoryId);
		};

		let clue = CategoryCache[categoryId].splice(_.random(CategoryCache[categoryId].length - 1), 1)[0];
		await TriviaApi.updateStorage();

		if(!clue || !clue.answer || !clue.question) clue = await TriviaApi.getQuestion(categoryId);
		if(!clue.value) clue.value = 400;

		clue.answer = stringToCleanWordArray(clue.answer).join(' ');

		console.log(clue);

		return clue;
	},
	refreshCategoryPool : async (categoryId)=>{
		const fetchQuestions = async (offset = 0, questions = [])=>{
			return await request.get(`http://jservice.io/api/clues?category=${categoryId}&offset=${offset}`)
				//.query({ category : categoryId, offset})
				.then((res)=>{
					//console.log(res.body);
					console.log('fetched questions!', offset);
					if(res.body.length){
						return fetchQuestions(offset + res.body.length, questions.concat(res.body));
					}else{
						return questions.concat(res.body);
					}
				})
				.catch((err)=>console.log(err.toString()));
		};
		CategoryCache[categoryId] = await fetchQuestions();
		TriviaApi.updateStorage();
		return CategoryCache[categoryId];
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
		return _.map(TriviaApi.Categories, (id, name)=>{
			return {
				id,
				name,
				size : (CategoryCache[id] ? CategoryCache[id].length : '???')
			};
		});
	},
};



module.exports = TriviaApi;



// const getCategoryId = function(msg){
// 	const result = _.reduce(Categories, function(r, id, name){
// 		if(_.includes(msg.toLowerCase(), name.toLowerCase())) return id;
// 		return r;
// 	}, false);

// 	//If no match, get random category
// 	if(!result) return _.sample(_.values(Categories));
// 	return result;
// };