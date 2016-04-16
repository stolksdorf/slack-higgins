var diplomacyBot = require('./diplomacybot.js');


var res = {
	reply : function(text, channel){
		var c = (channel ? '[' + channel +' ]' ; '')
		console.log(' - ', text, c);
	}
};

var msg = function(user, text){

}

var direct = function(user, text){
	diplomacyBot.response(text, {
		isDirect : true,
		user : user
	},)
}