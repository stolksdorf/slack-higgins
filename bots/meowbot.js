module.exports = {
	icon : ':cat:',
	name : 'meowbot',
	listenFor : ['user_typing'],
	response : function(msg, info, reply, Higgins){
		if(info.user == 'meggeroni'){
			reply('meow');
		}
	},
};