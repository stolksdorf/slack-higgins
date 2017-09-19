const _ = require('lodash');

const Groups = require('./group.info.js');

const niceWords = ['gorgeous', 'lovely', 'charming', 'appealing', 'attractive', 'gorgeous', 'good-looking', 'cute', 'ravishing', 'charming', 'beautiful', 'appealing', 'handsome', 'fair', 'exquisite', 'delightful', 'fine', 'fascinating', 'marvelous', 'pretty', 'stunning', 'alluring', 'sightly', 'magnificent', 'asty', 'delectable', 'luscious', 'scrumptious', 'palatable', 'yummy', 'appetizing', 'toothsome', 'savory', 'dainty', 'savoury', 'delightful', 'mouth-watering', 'ambrosial', 'enjoyable', 'succulent', 'lush', 'flavorful', 'tasteful', 'delish'];


const prices = {
	'$'      : ' under$30 CAD',
	'$$'     : 'about $30~$50 CAD',
	'$$$'    : 'about $50-$70 CAD',
	'$$$$'   : 'about $70~$125 CAD',
	'$$$$$'  : 'about $125~$300 CAD',
	'$$$$$+' : 'over $300 CAD :dizzy_face:'
};


const Formatter = {

	lookup : (scotch, confidence=1)=>{
		const sure = _.sample([
			`Ah yes, the ${scotch.name}...`,
			'Excellent choice!',
			'My my, you have fine tastes',
			'What a keen palette!',
			'Certainly,',
			'A fine choice, old chap!',
			'I see you\'re a man ᵒʳ ᶫᵃᵈʸ of sophisticated tastes!'
		]);
		const unsure = _.sample([
			'I\'m not quite sure if I have that name right but...',
			`I might have this wrong, but did you mean the ${scotch.name}?`,
			'Oh dear, that\'s a bit of a sticky wicket. Did you mean:',
			`I don't suppose you meant ${scotch.name}?`,
			'I can\'t seem to solve your query! Oh the dram-a!',
			'Hmmm... that\'s a riddle, wrapped in a mystery, inside an enigma. But perhaps,'
		]);
		const preamble = confidence > 0.75 ? sure : unsure;
		return `_${preamble}_\n${Formatter.description(scotch)}`;
	},

	random : (scotch)=>{
		const preamble = _.sample([
			'I too, like to live dangerously,',
			'Like a leaf on the wind',
			'I think you might like this one',
			'One right off the top of the head'
		]);
		return `_${preamble}_\n${Formatter.description(scotch)}`;
	},

	recommend : (scotches)=>{
		const preamble = _.sample([
			'I have just the thing for you',
			'Perhaps you could chris-ten this',
			'I\'ve concocted the perfect elixir for your desires',
			'I have scoured every tome written on this malted panacea and here is my humble recommendation'
		]);
		let result = `_${preamble}_\n${Formatter.description(scotches[0])}`;

		if(scotches.length == 2){
			const secondPreamble = _.sample([
				'Or, how about this',
				'You should also try',
				'On second thought... What about this?'
			]);
			result += `\n\n_${secondPreamble}_\n${Formatter.description(scotches[1])}`;
		}
		return result;
	},

	description : (scotch)=>{
		let rating = '';
		if(Math.floor(scotch.rating) == 9){
			rating = 'It\'s quite highly rated. ';
		}
		if(Math.floor(scotch.rating) < 8){
			rating = 'It\'s not that highly rated. ';
		}

		const pricing = `And it can be yours for ${prices[scotch.cost]}`;
		const type = (scotch.type == 'Malt' ? 'Single Malt' : 'Blend');

		return `*${scotch.name}*, it's a ${_.sample(niceWords)} ${type} coming from ${scotch.country}; ${Groups.getDescription(scotch.group)}. ${rating}${pricing}.`;
	},

	misunderstand : ()=>{
		return _.sample([
			'Seems like I\'ve had one too many sippy-poos, I didn\'t catch that',
			'Come again?',
			'Please speak clearly and thoughtfully.',
			'I\'m here to help, not to chit-chat sir. You have other bots for that.',
			'Maybe you should crack into a 40-month-old bergen?'
		]);
	}

};

module.exports = Formatter;