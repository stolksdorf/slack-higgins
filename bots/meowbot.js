module.exports = {
	icon : ':cat:',
	name : 'meowbot',
	listenFor : ['message'],
	response : function(msg, info, reply, Higgins){
		if(info.user == 'meggeroni'){
			Higgins._api('reactions.add', {
				name : 'cat',
				channel : info.channelId,
				timestamp : info.ts
			});
		}
	},
};