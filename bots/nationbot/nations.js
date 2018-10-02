const config = require('pico-conf');
module.exports = {
	scott : {
		ruler    : 'scott',
		id       : 'machina_isles',
		nation   : 'Machina Isles',
		flag_url : 'https://www.nationstates.net/images/flags/uploads/machina_isles__284058.png',
		password : config.get('nationstates_pwd:scott', true)
	},
	simon : {
		ruler    : 'simon',
		id       : 'baerbados',
		nation   : 'The Dominion of Baerbados',
		flag_url : 'https://www.nationstates.net/images/flags/uploads/baerbados__618440.jpg',
		password : config.get('nationstates_pwd:simon', true)
	},
	chris : {
		ruler    : 'chris',
		id       : 'very_good_boyes',
		nation   : 'The Grand Duchy of Very Good Boyes',
		flag_url : 'https://www.nationstates.net/images/flags/uploads/very_good_boyes__125942.png',
		password : config.get('nationstates_pwd:chris', true)
	},
	christian : {
		ruler    : 'christian',
		id       : 'roleplaysia',
		nation   : 'The Kingdom of Roleplaysia',
		flag_url : 'https://www.nationstates.net/images/flags/Default.png',
		password : config.get('nationstates_pwd:christian', true)
	},
	rebabybay : {
		ruler    : 'rebabybay',
		id       : 'new_rebaybia',
		nation   : 'The Most Serene Republic of New Rebaybia',
		flag_url : 'https://www.nationstates.net/images/flags/uploads/new_rebaybia__240938.jpg',
		password : config.get('nationstates_pwd:rebabybay', true)
	},
}
