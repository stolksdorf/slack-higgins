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


var print = {
	endGame : function(state){

	},
	endRound : function(state){

	},

	//TODO: Double check that diplomacy.interface can still load as a bot

	//TODO : Fix for new state structure, add in Merc section
	scoreboard : function(state){

		console.log(state);


		var sortedScores = _.sortBy(state.players, (player)=>{
			return 999999 - player.score
		});

		console.log(sortedScores);


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
	},

	//TODO : Handle with new state structure
	actions : function(state){
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
	},
}


///
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
	//TODO: Check if game is running
	if(!Diplomacy.getState().players[playerName]) addPlayer(playerName);

	//try{
		Diplomacy.submitMove(playerName, action, target);
		Higs.reply('Got it! You are *' + action + 'ing* ' + (target || '') + ' this round.', playerName);
	//}catch(e){
	//	Higs.reply(':warning: ' + e.toString(), playerName);
	//}

};
var addPlayer = function(playerName){
	Diplomacy.addPlayer(playerName)
	Higs.reply(playerName + ' has joined the game!', 'diplomacy');
};
var triggerStart = function(username){
	Diplomacy.startGame(username, 1000, 6);
	Higs.reply('Start Game!');
};
var triggerEnd  = function(username){
	Diplomacy.endGame(username)
};





Diplomacy.newRoundHandler = function(state){
	//console.log('new round');
	//var temp = Moment(state.roundEndTime);
	//console.log('New round', state.currentRound, 'Ending at ' + temp.format('ddd Do HH:mm'));
}

Diplomacy.endRoundHandler = function(state){
	Higs.reply(print.endRound(state))
}
Diplomacy.endGameHandler = function(state){
	Higs.reply(print.endGame(state));
}





module.exports = {
	name : 'diplomacybot',
	icon : ':passport_control:',

	listenIn : ['diplomacy', 'direct'],
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		Higs = Higgins;

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
					return Higs.reply('The current scores are: \n' +
						print.scoreboard(Diplomacy.getState()));
				}
			}

		}catch(e){
			Higs.reply(':warning: ' + e.toString())
		}
	},

	//STATE : Diplomacy.getState
}