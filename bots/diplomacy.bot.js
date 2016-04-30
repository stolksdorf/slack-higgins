var _ = require('lodash');
var utils = require('slack-helperbot/utils.js');
var Moment = require('moment');

var Diplomacy = require('../shared/diplomacy.game.js');
var Print = require('../shared/diplomacy.print.js');

const ACTIONS = ['defend', 'attack', 'support', 'invest'];
const BOT_NAMES = ['higgins', 'higs', 'diplomacybot'];

var Higs = require('slack-helperbot/botLoader.js').getBotContext({
	name : 'diplomacybot',
	icon : ':passport_control:'
},{
	channel : 'diplomacy'
});




var parseMove = function(msg, playerName){
	var target;
	var action = _.find(ACTIONS, (action)=>{return msg.indexOf(action) !== -1;});
	if(action == 'attack' || action == 'support'){
		var index = _.reduce(_.words(msg), (r, part, i)=>{
			if(_.includes(part, action)) r = i + 1;
			return r;
		}, null);
		target = msg.split(' ')[index];
	}

	//check if new player
	if(!Diplomacy.isRunning()) throw "A game isn't currently running.";
	if(!Diplomacy.getState().players[playerName]) addPlayer(playerName);

	//Catch it here to make sure it gets sent to the private channel
	try{
		submitMove(playerName, action, target);
	}catch(e){
		Higs.reply(':warning: ' + e.toString(), playerName);
	}
};
var submitMove = function(playerName, action, target){
	Diplomacy.submitMove(playerName, action, target);
	Higs.reply('Got it! You are *' + action + 'ing* ' + (target || '') + ' this round.', playerName);
}
var addPlayer = function(playerName){
	Diplomacy.addPlayer(playerName)
	Higs.reply(playerName + ' has joined the game!', 'diplomacy');
};
var triggerStart = function(username, message){
	var rounds = 6;
	var roundLengthMs = 1000 * 60 * 60 * 24;

	//Extract out is the user passed game params
	var params = utils.extractNumberUnits(message);
	_.each(params, (param)=>{
		if(utils.messageHas(param.unit, ['round', 'turn'])) rounds = param.val;

		if(utils.messageHas(param.unit, ['min'])) roundLengthMs = param.val * 1000 * 60;
		if(utils.messageHas(param.unit, ['hour', 'hr'])) roundLengthMs = param.val * 1000 * 60 * 60;
		if(utils.messageHas(param.unit, ['day'])) roundLengthMs = param.val * 1000 * 60 * 60 * 24;
	});

	Diplomacy.startGame(username, roundLengthMs, rounds);
};



/* GAME EVENT HANDLERS */
Diplomacy.startGameHandler = function(state){
	Higs.reply('A new game of Diplomacy has started!\n It will run for ' +
			state.totalRounds + ' rounds, each lasting ' +
			Moment.duration(state.roundLengthMs).humanize()
	, 'diplomacy');
};
Diplomacy.newRoundHandler = function(state){

	//Add a slight pause so the messages appear in the right order
	setTimeout(function(){
		Higs.reply([
			"> *Round " + state.currentRound + "* (of " + state.totalRounds + ")",
			"> " + Print.timeLeft(state),
			"> " + Print.investPool(state)
		].join('\n'),
		'diplomacy');
	}, 500);

};
Diplomacy.endRoundHandler = function(state){
	Higs.reply([
		"*Round " + state.currentRound + " is over!*",
		"",
		Print.actions(state),
		"",
		"The current scores are:\n" + Print.scoreboard(state)
	].join('\n'),
	'diplomacy');
};
Diplomacy.endGameHandler = function(state){
	setTimeout(function(){
		Higs.reply('*Game is over!*', 'diplomacy');
	}, 1000);
}





//TODO: Add time remaining command
//TODO: Debug command for current player's actions
//TODO: Remove supporters if you are attacking
//TODO: Make scores, info, whatever, Print scores, invest pool, and time remaining


//BUG: Attempt to action a player, msg went to general




module.exports = {
	name : 'diplomacybot',
	icon : ':passport_control:',

	listenIn : ['diplomacy', 'direct'],
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		Higs = Higgins;

		try{
			if(_.startsWith(msg, '`')){
				if(utils.messageHas(msg, 'end round')){
					Diplomacy.endRound()
				}else if(utils.messageHas(msg, 'add')){
					addPlayer(msg.split(' ')[2]);
				}else if(utils.messageHas(msg, 'actions')){
					Higs.reply(JSON.stringify(Diplomacy.getState().players, null, '  '));
				}else{
					var parts = msg.split(' ');
					Diplomacy.submitMove(parts[1], parts[2], parts[3])
					Higs.reply('Got it! ' + parts[1] + ' ' + parts[2] + ' ' + parts[3])
				}
				return;
			}



			if(info.isDirect){
				if(utils.messageHas(msg, ACTIONS)){
					return parseMove(msg, info.user)
				}
				if(utils.messageHas(msg, ['playing', 'join'])){
					return addPlayer(info.user)
				}
			}else if(utils.messageHas(msg, BOT_NAMES)){
				if(utils.messageHas(msg, ['start'], 'game')){
					return triggerStart(info.user, msg);
				}

				//Check if game is running
				if(!Diplomacy.isRunning()) return Higs.reply(":warning: Sorry, a game isn't running.");


				if(utils.messageHas(msg, ['cmds', 'commands'])){
					return Higs.reply(Print.cmds());
				}
				if(utils.messageHas(msg, ['rule', 'help', 'how'])){
					return Higs.reply(Print.rules());
				}
				if(utils.messageHas(msg, ['playing', 'join'])){
					return addPlayer(info.user)
				}

				if(utils.messageHas(msg, ['end'], 'game')){
					return Diplomacy.endGame(info.user);
				}
				if(utils.messageHas(msg, ['score', 'points', 'players', 'info', 'round'])){
					//return Higs.reply('The current scores are: \n' +
						//Print.scoreboard(Diplomacy.getState()));

					return Higs.reply(Print.roundInfo(Diplomacy.getState()));
				}
			}

		}catch(e){
			Higs.reply(':warning: ' + e.toString())
		}
	},
};
