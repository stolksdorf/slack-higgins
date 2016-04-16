var DiplomacyBot = require('diplomacy.interface.js');


var bot = {
	reply : function(text, target){
		var c = (target ? '[' + target + ']' : '')
		console.log(' - ', text, target);
	}
};

var msg = function(user, text){
	DiplomacyBot(text, {user : user, channel : 'diplomacy'}, bot)
}
var drt = function(user, text){
	DiplomacyBot(text, {user : user, isDirect : true}, bot)
}



drt('scott', 'I am going to defend this round');

