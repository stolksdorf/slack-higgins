var moment = require('moment');

module.exports = {
	name : 'testbot',
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(info.user == 'scott' && msg.indexOf('time') !== -1){
			Higgins.reply(moment().format());
		}
	}
}