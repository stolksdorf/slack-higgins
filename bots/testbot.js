var _ = require('lodash');
var moment = require('moment');
var Storage = require('slack-helperbot/storage');


module.exports = {
	name : 'testbot',
	//listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(info.user == 'scott') Higgins.reply('yo');
	}
}