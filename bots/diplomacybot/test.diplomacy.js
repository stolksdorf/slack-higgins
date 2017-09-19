const DiplomacyBot = require('./diplomacy.bot.js');
const DiplomacyGame = require('./diplomacy.game.js');
const Storage = require('slack-microbots/storage').create('diplomacy');

const bot = {
	reply : function(text, target){
		const c = (target ? `[${target}]` : '');
		console.log(' -', c, text);
	}
};
const msg = function(user, text){
	DiplomacyBot.response(text, {user: user, channel: 'diplomacy'}, bot);
};
const drt = function(user, text){
	DiplomacyBot.response(text, {user: user, isDirect: true}, bot);
};


Storage.init(function(){
	console.log('\n---------\n');

	//startGameTest();
	scoreBoardTest();



	//console.log(DiplomacyBot.STATE());


});


const startGameTest = function(){
	msg('scott', 'Higs, end game');
	msg('scott', 'Higs, start the game with 8 rounds that each last 1 day');
};

var scoreBoardTest = function(){
	msg('scott', 'Higs, end game');
	msg('scott', 'Higs, start game 3 rounds that last 15 min');
	drt('scott', 'I am going to invest this round');
	drt('jibz', 'attack scott');
	DiplomacyGame.endRound();
	drt('scott', 'I am going to invest this round');
	drt('jibz', 'attack scott');
	drt('lp', 'support jibz');
	drt('lp', 'attack scott PACHOW!!!!');

	DiplomacyGame.endRound();

	drt('scott', 'I am going to invest this round');


};

