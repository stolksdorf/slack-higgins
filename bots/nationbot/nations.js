const config = require('pico-conf');
module.exports = {
	scott : {
		ruler    : 'scott',
		id       : 'machina_isles',
		nation   : 'Machine Isles',
		flag_url : 'https://www.nationstates.net/images/flags/uploads/machina_isles__284058.png',
		password : config.get('nationstates_pwd:scott')
	}
}
