module.exports = {
	icon : ':scott:',
	name : "scottbot",

	listenIn : 'floofs',
	listenFor : ['message'],
	response : function(msg, info, Higgins){

		if(info.user == 'scott'){
			Higgins.react('sloth');
		}


	}
}