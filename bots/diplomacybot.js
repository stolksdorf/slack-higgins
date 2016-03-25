var _ = require('lodash');
var utils = require('slack-helperbot/utils.js');

var DiplomacyEngine = require('diplomacy.engine.js');

const ACTIONS = ['defend', 'attack', 'support', 'invest'];
const BOT_NAMES = ['higgins', 'higs', 'diplomacybot'];

var Higs;

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

	//Confirm action

	Higs.reply('Got it! You are *' + action + 'ing* ' + (target || '') + ' this round.');

	//check if new player
	if(!_.includes(DiplomacyEngine.gameState().players, player)){
		DiplomacyEngine.addPlayer(player);
		Higs.reply(player + ' has joined the game!', 'diagnostics'); //'diplomacy')
	}

	DiplomacyEngine.submitMove(player, action, target);
}








var HandleDebugCommands = function(msg, info){
	//Debug Commands
	if(utils.messageHas(msg, 'start')){
		DiplomacyEngine.startGame();
		parseMove('attack meg', 'jared');
		parseMove('attack scott', 'lp');
		parseMove('invest', 'scott');
		parseMove('support lp', 'meg');


		var roundResults = DiplomacyEngine.calculateRound()

		//Higs.reply(JSON.stringify(res, null, '  '));
		Higs.reply(printEndRound(roundResults));
	}

	if(utils.messageHas(msg, 'actions')){
		Higs.reply(JSON.stringify(DiplomacyEngine.gameState().submittedMoves, null, '  '));
	}
	if(utils.messageHas(msg, 'end round')){

	}
	if(utils.messageHas(msg, 'end game')){

	}
	if(utils.messageHas(msg, ACTIONS)){
		var parts = msg.split(' ');
		var player = parts[1];
		var target = parts[3];
		var action = _.find(ACTIONS, (action)=>{
			return msg.indexOf(action) !== -1;
		})

		if(!_.includes(DiplomacyEngine.gameState().players, player)){
			DiplomacyEngine.addPlayer(player);
			Higs.reply(player + ' has joined the game!', 'diagnostics'); //'diplomacy')
		}

		DiplomacyEngine.submitMove(player, action, target);
		Higs.reply('got it!')
	}


}

//Provide a state to get deltas
var printScoreboard = function(state){
	return _.map(DiplomacyEngine.gameState().scores, (score, player)=>{
		var delta = '';
		if(state){
			var res = state[player];
			var val = (res.gain || 0) + (res.stole || 0) + (res.invest || 0) - (res.loss || 0)
			if(val >= 0){
				delta = ' _(+' + val + ')_'
			}else{
				delta = ' _(' + val + ')_'
			}
		}

		return ':' + player + ': has ' + score + ' points' + delta;
	}).join('\n');
};

var printMoveResults = function(state){
	return _.map(state, (res, player)=>{
		if(res.action == 'invest'){
			return ':moneybag: *' + player + '* invests, earning ' + res.invest;
		}else if(res.action == 'support'){
			return ':heart: *' + player + '* supports *' + res.target + '*';
		}else if(res.action == 'attack'){
			if(res.isSuccessful){
				return ':crossed_swords: *' + player + '* sucessfully attacks *' + res.target + '*' +
					(res.supporters.length ? ' _(with support from ' + res.supporters.join(', ') + ')_' : '') +
					', gaining ' + res.gain +
					(res.stole ? ' and stealing ' + res.stole :'');
			}else{
				return ':grimacing: *' + player + '* fails to attack *' + res.target + '*';
			}
		}else if(res.action == 'defend'){
			if(res.isSuccessful){
				return ':shield: *' + player + '* sucessfully defends attack from *' + res.target + '*' +
					(res.supporters.length ? ' _(with support from ' + res.supporters.join(', ') +')_' : '');
			}else{
				return ':white_flag: *' + player + '* fails to defend from *' + res.target + '*' +
					(res.loss ? ' losing ' + res.loss : '');
			}
		}
	}).join('\n');
}

var printEndRound = function(state){
	var msg = 'End of round ' +
		DiplomacyEngine.gameState().currentRound + '/' + DiplomacyEngine.gameState().config.totalRounds + '!!\n';

	msg += '\n' + printMoveResults(state) + '\n\n The new scores are: \n' + printScoreboard(state);

	return msg
}


module.exports = {
	name : 'diplomacybot',
	icon : ':passport_control:',
	//listenIn : ['diplomacy'],
	//listenFor : ['message'],
	response : function(msg, info, Higgins){


		Higs = Higgins;

		if(utils.messageHas(msg, 'db') && !info.isDirect){
			return HandleDebugCommands(msg, info, Higgins);
		}


//////////////////////


		if(!DiplomacyEngine.isRunning()){
			return Higs.reply('No game is currently running.');
		}


		if(utils.messageHas(msg, BOT_NAMES, ['score', 'points'])){
			return Higs.reply('The current scores are: \n' + printScoreboard());
		}


		if(info.isDirect && utils.messageHas(msg, ACTIONS)){
			return parseMove(msg, info.user)
		}





	}
}
