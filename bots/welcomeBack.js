var _ = require('lodash');

module.exports = {
	listenFor : ['presence_change'],
	response : function(msg, info, reply, Higgins){
		if(_.random(3) !== 1) return;

		if(info.presence == 'active'){
			if(info.user == 'kellen') reply('Welcome back Commander', 'kellen');
		}
	},
};