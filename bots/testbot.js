var moment = require('moment');
var Storage = require('slack-helperbot/storage');

module.exports = {
	name : 'testbot',
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(info.user == 'scott' && msg.indexOf('time') !== -1){
			Higgins.reply(moment().format());
		}


		Storage.set('test', 'cool');

		Higgins.reply(Storage.get('test'));
	}
}