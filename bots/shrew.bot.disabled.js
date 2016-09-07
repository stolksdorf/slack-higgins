var _ = require('lodash');

module.exports = {
//	listenFor : ['message'],

	response : function(msg, info, Higgins){
		if(info.user == 'meggeroni' && msg.indexOf('sandshrew') != -1){
			Higgins.react('sandshrew');
		}
	},
};
