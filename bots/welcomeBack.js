var _ = require('lodash');


var messageMap = {
	scott : ['Welcome back sir'],
	kellen : ['Welcome back Commander'],
	katie : ["How was your tf2 session m'lady?"]
}

module.exports = {
	listenFor : ['presence_change'],
	response : function(msg, info, Higgins){
		if(_.random(10) !== 1) return;
		if(info.presence == 'active' && messageMap[info.user]){
			Higgins.reply(_.sample(messageMap[info.user]), info.user);
		}
	},
};