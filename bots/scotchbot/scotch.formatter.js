const _ = require('lodash');

const Groups = require('./group.info.js');

const niceWords = ['gorgeous','lovely','charming','appealing','attractive','gorgeous','good-looking','cute','ravishing','charming','beautiful','appealing','handsome','fair','exquisite','delightful','fine','fascinating','marvelous','pretty','stunning','alluring','sightly','magnificent','asty','delectable','luscious','scrumptious','palatable','yummy','appetizing','toothsome','savory','dainty','savoury','delightful','mouth-watering','ambrosial','enjoyable','succulent','lush','flavorful','tasteful','delish'];


const prices = {
	'$' : ' under$30 CAD',
	'$$' :  'about $30~$50 CAD',
	'$$$' :  'about $50-$70 CAD',
	'$$$$' :  'about $70~$125 CAD',
	'$$$$$' :  'about $125~$300 CAD',
	'$$$$$+' :  'over $300 CAD'
}


const Formatter = {

	lookup : (scotch, confidence=1)=>{
		const sure = _.sample([
			`Ah yes, the ${scotch.name}...`,
			`Excellent choice!`,
			`My my, you have fine tastes`,
			`What a keen palette!`,
			`Certainly,`
		]);
		const unsure = _.sample([
			`I'm not quite sure if I have that name right but...`,
			//`I don't think I heard you correctly, but here's what I have`,
			`I might have this wrong, but did you mean the ${scotch.name}?`
		]);
		const preamble = confidence > 0.75 ? sure : unsure
		return `_${preamble}_\n${Formatter.description(scotch)}`;
	},

	random : (scotch)=>{
		const preamble = _.sample([
			`I too, like to live dangerously,`,
			`Like a leaf on the wind`,
			`I think you might like this one`
		]);
		return `_${preamble}_\n${Formatter.description(scotch)}`;
	},

	description : (scotch)=>{
		let rating = '';
		if(Math.floor(scotch.rating) == 9){
			rating = 'It\'s quite highly rated. ';
		}
		if(Math.floor(scotch.rating) < 8){
			rating = 'It\'s not that highly rated. ';
		}

		const pricing = 'And it can be yours for ' + prices[scotch.cost];
		const type = (scotch.type == 'Malt' ? 'Single Malt' : 'Blend');

		return `*${scotch.name}*, it's a ${_.sample(niceWords)} ${type}; ${Groups.getDescription(scotch.group)}. ${rating}${pricing}.`;
	}

};

module.exports = Formatter;