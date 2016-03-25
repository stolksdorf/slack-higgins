var _ = require('lodash');
var utils = require('slack-helperbot/utils.js');

var DiplomacyEngine = require('diplomacy.engine.js');

const ACTIONS = ['defend', 'attack', 'support', 'invest'];



var parseMove = function(msg, player){
	var target;
	var action = _.find(ACTIONS, (action)=>{
		return msg.indexOf(action) !== -1;
	});
	if(action == 'attack' || action == 'support'){
		var index = _.reduce(msg.split(' '), (r, part, i)=>{
			if(_.includes(part, action)) r = i + 1;
			return r;
		}, null);

		target = msg.split(' ')[index];
	}

	Higgins.reply('Got it! \n _Action:_ ' + action +
		(target ? '\n _Target:_ ' + target : ''));

	//check if new player
	if(!_.includes(DiplomacyEngine.gameState().players, player)){
		DiplomacyEngine.addPlayer(player);
		Higgins.reply(player + ' has joined the game!', 'diagnostics'); //'diplomacy')
	}

	DiplomacyEngine.submitMove(player, action, target);
}





DiplomacyEngine.startGame();




var HandleDebug = function(msg, info, Higgins){

	//Debug Commands
	if(utils.messageHas(msg, 'db', 'actions')){
		Higgins.reply(DiplomacyEngine.gameState().submittedMoves)
	}
	if(utils.messageHas(msg, 'db', 'end round')){

	}
	if(utils.messageHas(msg, 'db', 'end game')){

	}
	if(utils.messageHas(msg, 'db', ACTIONS) && !info.isDirect){
		var parts = msg.split(' ');
		var player = parts[0];
		var target = parts[2];
		var action = _.find(ACTIONS, (action)=>{
			return msg.indexOf(action) !== -1;
		})


		console.log(DiplomacyEngine.gameState().players);
		if(!_.includes(DiplomacyEngine.gameState().players, player)){
			DiplomacyEngine.addPlayer(player);
			Higgins.reply(player + ' has joined the game!', 'diagnostics'); //'diplomacy')
		}

		DiplomacyEngine.submitMove(player, action, target);
		Higgins.reply('got it!')
	}


}


module.exports = {
	name : 'diplomacybot',
	icon : 'passport_control',
	//listenIn : ['diplomacy'],
	//listenFor : ['message'],
	response : function(msg, info, Higgins){

		if(utils.messageHas(msg, 'db')){
			HandleDebug(msg, info, Higgins);
		}


//////////////////////



		if(info.isDirect && utils.messageHas(msg, ACTIONS)){
			parseMove(msg, info.user)
		}





	}
}
