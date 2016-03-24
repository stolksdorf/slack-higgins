var _ = require('lodash');

var moment = require('moment');
var Storage = require('slack-helperbot/storage');


console.log(Storage.get('test'));



module.exports = {
	name : 'testbot',
	//listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(info.user != 'scott' || info.channel != 'diagnostics' ) return;


		if(info.user == 'scott' && msg.indexOf('time') !== -1){
			Higgins.reply(moment().format());
		}

		var t = a + b;


		Storage.set('test', 'HEY THERE');

		Higgins.reply(Storage.get('test'));
	}
}