var _ = require('lodash');
var utils = require('slack-helperbot/utils.js');
var Moment = require('moment');

var Diplomacy = require('diplomacy.game.js');

const ACTIONS = ['defend', 'attack', 'support', 'invest'];
const BOT_NAMES = ['higgins', 'higs', 'diplomacybot'];


var Higs = require('slack-helperbot/botLoader.js').getBotContext({
	name : 'diplomacybot',
	icon : ':passport_control:'
},{
	channel : 'diplomacy'
});



//TODO: Add start game message
//TODO: Add rules message
//TODO: Add end game message
//TODO: Add messaging for when the next action needs to be in by

// Add start game processing, Round length and round cpount
// ONly person who started game can end it
// Get bot context from lib (should be working now)
// Make invest go up by multiples? mayve 2x?
// make an external constant file, for things like higgins names
//







/*
var HandleDebugCommands = function(msg, info){
	//Debug Commands
	if(utils.messageHas(msg, 'start')){

		Diplomacy.startGame();

		testMoves();

		//Diplomacy.addPlayer('scott');
		//Diplomacy.addPlayer('lp');

		var roundResults = Diplomacy.calculateRound()

		Higs.reply(JSON.stringify(roundResults, null, '  '));
		Higs.reply(printEndRound(roundResults));


		Diplomacy.endGame();



	}

	if(utils.messageHas(msg, 'actions')){
		Higs.reply(JSON.stringify(Diplomacy.getState().submittedMoves, null, '  '));
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

		if(!_.includes(Diplomacy.getState().players, player)){
			Diplomacy.addPlayer(player);
			Higs.reply(player + ' has joined the game!', 'diplomacy');
		}

		Diplomacy.submitMove(player, action, target);
		Higs.reply('got it!')
	}


}
*/

//Provide a state to get deltas
var printScoreboard = function(state){
	var sortedScores = _.fromPairs(_.sortBy(_.toPairs(Diplomacy.getState().scores), (pair)=>{
		return 999999 - pair[1];
	}));

	return _.map(sortedScores, (score, player)=>{
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
			if(res.isSuccessful === true){
				return ':shield: *' + player + '* sucessfully defends attack from *' + res.target + '*' +
					(res.supporters.length ? ' _(with support from ' + res.supporters.join(', ') +')_' : '');
			}else if(res.isSuccessful === false){
				return ':waving_white_flag: *' + player + '* fails to defend from *' + res.target + '*' +
					(res.loss ? ' losing ' + res.loss : '');
			}else{
				return ':shield: *' + player + '* defended';
			}
		}
	}).join('\n');
}

var printEndRound = function(state){

	return "END ROUND";

	var msg = 'End of round ' +
		Diplomacy.getState().currentRound + '/' + Diplomacy.getState().config.totalRounds + '!!\n';

	msg += '\n' + printMoveResults(state) + '\n\n The new scores are: \n' + printScoreboard(state);

	return msg
};



Diplomacy.newRoundHandler = function(state){
	console.log('new round');
	var temp = Moment(state.roundEndTime);
	console.log('New round', state.currentRound, 'Ending at ' + temp.format('ddd Do HH:mm'));
}

Diplomacy.endRoundHandler = function(state){
	Higs.reply(printEndRound(state))
}
Diplomacy.endGameHandler = function(state){
	console.log('END GAME');
}


var parseMove = function(msg, playerName){
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

	//check if new player
	if(!Diplomacy.getState().players[playerName]) addPlayer(playerName);

	try{
		Diplomacy.submitMove(playerName, action, target);
		Higs.reply('Got it! You are *' + action + 'ing* ' + (target || '') + ' this round.', playerName);
	}catch(e){
		Higs.reply(':warning: ' + e.toString(), playerName);
	}
}



var addPlayer = function(playerName){
	try{
		Diplomacy.addPlayer(playerName)
		Higs.reply(playerName + ' has joined the game!', 'diplomacy');
	}catch(e){
		Higs.reply(':warning: ' + e.toString(), playerName)
	}
}
var triggerStartGame = function(username){
	try{
		Higs.reply('Start Game!')
		Diplomacy.startGame(username, 15000, 6)
	}catch(e){
		Higs.reply(':warning: ' + e.toString())
	}
}
var triggerEndGame = function(username){
	try{
		Diplomacy.endGame(username)
	}catch(e){
		Higs.reply(':warning: ' + e.toString())
	}
}



module.exports = {
	name : 'diplomacybot',
	icon : ':passport_control:',

	listenIn : ['diplomacy', 'direct'],
	listenFor : ['message'],
	response : function(msg, info, Higgins){

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
				return triggerStartGame(info.user);
			}
			if(utils.messageHas(msg, ['end'], 'game')){
				return triggerEndGame(info.user);
			}
			if(utils.messageHas(msg, ['score', 'points', 'players'])){
				return Higs.reply('The current scores are: \n' + printScoreboard());
			}
		}

	}
}
