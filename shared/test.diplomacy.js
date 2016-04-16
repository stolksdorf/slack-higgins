var DiplomacyBot = require('../bots/diplomacy.bot.js');
var DiplomacyGame = require('./diplomacy.game.js');
var Storage = require('slack-helperbot/storage');



var bot = {
	reply : function(text, target){
		var c = (target ? '[' + target + ']' : '')
		console.log(' -', c, text);
	}
};

var msg = function(user, text){
	DiplomacyBot.response(text, {user : user, channel : 'diplomacy'}, bot)
}
var drt = function(user, text){
	DiplomacyBot.response(text, {user : user, isDirect : true}, bot)
}


Storage.init(function(){

	console.log('\n---------\n');

	msg('scott', 'Higs, end game?');

	msg('scott', 'Higs, start game?');

	drt('scott', 'I am going to defend this round');
	drt('jibz', 'attack scott plz');

	DiplomacyGame.endRound();


	msg('scott', 'higs scores?')

	//console.log(DiplomacyBot.STATE());

})
