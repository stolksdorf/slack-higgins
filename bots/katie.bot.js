var _ = require('lodash');
var utils = require('slack-microbots/utils');
var santaSayings = ['Ho ho ho!', 'Christmas is coming!', 'Chestnuts roasting on an open fire...','Merry Christmas!']


module.exports = {
	name : 'katiebot',
	icon : ':katie:',
	channel : 'secret-laboratory',
	handle : function(msg, info, Higgins){
    		if(info.user =='katie' && _.random(10) == 5){
      		Higgins.react('tada');
    }
		Higgins.reply(_.sample(santaSayings));
	}
}
