var _ = require('lodash');

module.exports = {
	channel : 'none', //'*',
	handle : function(msg, info, Higgins){
		if(info.user == 'meggeroni' && msg.indexOf('sandshrew') != -1){
			Higgins.react('sandshrew');
		}
	},
};
