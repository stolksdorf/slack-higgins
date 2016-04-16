var _ = require('lodash');
var utils = require('slack-helperbot/utils.js');
var Moment = require('moment');

var Diplomacy = require('diplomacy.game.js');

var Bot;


var Actions = {
	printEndRound : function(){

	},
	printScoreboard  : function(){

	},
	printActions : function(){

	},

	///
	parseMove : function(){

	},
	addPlayer : function(){

	},
	triggerStart : function(username){
		Bot.reply('Start Game!')
		Diplomacy.startGame(username, 15000, 6);
	},
	triggerEnd  : function(){

	},









};


module.exports = function(msg, info, bot){
	Bot = bot;

	try{


		if(info.isDirect){
			if(utils.messageHas(msg, ACTIONS)){
				return parseMove(msg, info.user)
			}
			if(utils.messageHas(msg, ['playing', 'join'])){
				Diplomacy.addPlayer(info.user)
			}


		}else if(utils.messageHas(msg, BOT_NAMES)){

			if(utils.messageHas(msg, ['playing', 'join'])){
				return Diplomacy.addPlayer(info.user)
			}

			if(utils.messageHas(msg, ['start'], 'game')){
				return triggerStart(info.user);
			}
			if(utils.messageHas(msg, ['end'], 'game')){
				return triggerEnd(info.user);
			}
			if(utils.messageHas(msg, ['score', 'points', 'players'])){
				return Bot.reply('The current scores are: \n' + printScoreboard());
			}
		}

	}catch(e){
		Bot.reply(':warning: ' + e.toString())
	}





}