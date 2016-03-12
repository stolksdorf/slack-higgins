module.exports = {
	listenFor : ['message'],
	response : function(msg, info, Higgins){

		if(info.user == 'scott'){
			Higgins.reply('Hey!');
		}


	}
}