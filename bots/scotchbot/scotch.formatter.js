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


module.exports = {

	info : (scotch)=>{

		const preamble = _.sample([
			`Ah yes, the ${scotch.name}`,
			`Excellent choice!`,
			`My my, you have fine tastes`,
		]);

		let rating = '';
		if(Math.floor(scotch.rating) == 9){
			rating = "It's quite highly rated";
		}
		if(Math.floor(scotch.rating) < 8){
			rating = "It's not that highly rated";
		}

		let pricing = 'And it can be yours for ' + prices[scotch.cost];

		const type = (scotch.type == 'Malt' ? 'Single Malt' : 'Blend');

		return `_${preamble}_
*${scotch.name}* comes from ${scotch.country}. It's a ${_.sample(niceWords)} ${type}; ${Groups.getDescription(scotch.group)}. ${rating}. ${pricing}.`;
	}

};