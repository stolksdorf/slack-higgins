module.exports = {
	//icon : ':scott:',
	//name : "scottbot",

	listenIn : 'floofs',
	listenFor : ['user_typing'],
	response : function(msg, info, Higgins){
		if(_) return;

		if(info.user == 'scott'){
			Higgins.reply('sloth');
		}

	}
}