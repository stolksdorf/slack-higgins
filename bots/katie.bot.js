var _ = require('lodash');
var utils = require('slack-microbots/utils');
var santaSayings = ['Ho ho ho!', 'Christmas is coming!', 'Chestnuts roasting on an open fire...','Merry Christmas!']


module.exports = {
	name : 'katiebot',
	icon : ':katie:',
	channel : 'secret-laboratory',
	handle : _.delay(function(msg, info, Higgins){
    			if(info.user == 'katie'){
				Higgins.reply(_.sample(santaSayings));
    		}
	}, 1000)
};
