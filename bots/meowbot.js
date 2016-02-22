var _ = require('lodash');
var cat_emojis = ['cat', 'cat2', 'smiley_cat', 'joy_cat', 'heart_eyes_cat', 'smile_cat'];

module.exports = {
	icon : ':cat:',
	name : 'meowbot',
	listenFor : ['message'],
	response : function(msg, info, reply, Higgins){
		if(info.user == 'meggeroni' && _.random(10) == 3){
			Higgins._api('reactions.add', {
				name : _.sample(cat_emojis),
				channel : info.channelId,
				timestamp : info.ts
			});
		}
	},
};