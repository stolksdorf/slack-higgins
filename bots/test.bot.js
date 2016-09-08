var _ = require('lodash');
var moment = require('moment');
var Storage = require('slack-microbots/storage').create('testbot');
var Utils = require('slack-microbots/utils');


module.exports = {
	name : 'testbot',
	icon : ':gear:',
	channel : 'none', // 'general',
	handle : function(msg, info, Higgins){
		if(info.user == 'scott') Higgins.reply('yo');
	}
}