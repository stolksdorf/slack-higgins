const config = require('nconf');
module.exports = {
	scott : {
		name : 'scott',
		nation : 'machina_isles',
		password : config.get('nation_states:scott')
	}
}
