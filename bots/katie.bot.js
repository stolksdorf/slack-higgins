var utils = require('slack-microbots/utils');

module.exports = {
	name : 'katiebot',
	icon : ':katie:',
	channel : 'secret-laboratory',
	handle : function(msg, info, Higgins){
    if(info.user == 'katie'){
      Higgins.react('tada');
    }
		Higgins.reply('yo');
	}
}
