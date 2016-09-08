var _ = require('lodash');
var cat_emojis = ['cat', 'cat2', 'smiley_cat', 'joy_cat', 'heart_eyes_cat', 'smile_cat'];

module.exports = {
	channel : '*',
	handle : function(msg, info, Higgins){
		if(info.user == 'meggeroni' && _.random(15) == 3){
			Higgins.react(_.sample(cat_emojis));
		}
	},
};