var utils = require('slack-microbots/utils');

module.exports = {
	name : 'pinbot',
	icon : ':pushpin:',
	//events: ['message'],
	channel : '*',
	handle : function(msg, info, Higgins){
		console.log('pin', msg.type);
	}
}
