var utils = require('slack-microbots/utils');

module.exports = {
	name : 'santabot',
	icon : ':santa:',
	channel : '*',
	handle : function(msg, info, Higgins){
		if(info.isDirect && utils.messageHas('santachat')){
      			Higgins.reply(msg, 'secret-santa');
		}
    	}
}
