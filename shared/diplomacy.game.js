var _ = require('lodash');
var Storage = require('slack-helperbot/storage');
var Engine = require('./diplomacy.engine.js');

const KEY = 'diplomacy_game';
const ACTIONS = ['defend', 'attack', 'support', 'invest'];

//const TICK_RATE = 1000 * 60 * 5; //Checks if the round ends every 5min
const TICK_RATE = 1000;

var timer;


//Use to easily retrieve and modify game state
/*
var Game = function(args){
	if(args){
		Storage.set(KEY, _.extend({}, Storage.get(KEY), args));
	}
	return Storage.get(KEY)
};
*/

var temp = {};
var Game = function(args){
	if(args){
		temp = _.extend({}, temp, args);
	}
	return temp
};



var config = {
	startingPoints : 3,
	investStart : 0,
	investFn : function(state){
		return state.investPool + 1
	}
}


var Diplomacy = {
	getState : function(){
		return Game()
	},

	newRoundHandler : function(){},
	endRoundHandler : function(){},
	endGameHandler : function(){},

	/*
	isRunning : function(){
		return !!Storage.get(KEY);
	},
	*/
	isRunning : function(){

		return !_.isEmpty(temp)
	},


	startGame : function(initiator, roundLength, roundCount){
		if(Diplomacy.isRunning()) throw "A game is currently running.";

		var state = {
			investPool : config.investStart,
			currentRound : 0,

			initiator : initiator,
			roundLengthMs : roundLength,
			totalRounds : roundCount,
			roundEndTime : 0,

			players : {},
		};

		Game(state);
		//Diplomacy.startTimer();
		Diplomacy.startRound();
	},

	startRound : function(){
		var state = Game();

		//Reset past results and moves
		_.each(state.players, (player)=>{
			delete player.result;
			delete player.move;
		});
		state.currentRound++;
		state.roundEndTime = (new Date().getTime()) + state.roundLengthMs;
		Diplomacy.newRoundHandler(state);

		Game(state);
	},
	endRound : function(){
		var state = Game();
		state = Engine.calculateRound(state, config);
		Diplomacy.endRoundHandler(state);
		Game(state);
		if(state.currentRound == state.totalRounds){
			Diplomacy.endGame();
		}else{
			Diplomacy.startRound();
		}
	},

	endGame : function(initiator){
		if(!Diplomacy.isRunning()) throw "A game isn't currently running.";
		if(initiator && Game().initiator !== initiator) throw "Only " + Game().initiator + " can end the game early.";
		Diplomacy.endGameHandler(Game());
		clearInterval(timer);
		timer = null;
		Storage.set(KEY, null);
	},

	startTimer : function(){
		if(!timer){
			timer = setInterval(function(){
				if(new Date().getTime() >= Game().roundEndTime){
					Diplomacy.endRound();
				}
			}, TICK_RATE);
		}
	},

	addPlayer : function(name){
		var state = Game();
		if(state.players[name]) throw 'You are already playing!';

		state.players[name] = {
			name : name,
			isMerc : false,
			score : config.startingPoints
		};
		Game(state);
	},
	submitMove : function(name, action, target){
		var state = Game();
		var player = state.players[name];

		if(!player) throw 'There is no player with that name playing';
		if(target && !state.players[target]) throw "That player isn't playing the game";
		if(player.isMerc && action !== 'support') throw "As a mercenary, you can only do the 'support' action";
		if(!_.includes(ACTIONS, action)) throw "That's not a valid action. Options are: " + ACTIONS.join(', ');

		player.move = {
			action : action,
			target : target
		};
		Game(state);
	},
}

//Diplomacy.endGame();


//Server restart timer code
if(Diplomacy.isRunning()){
	Diplomacy.startTimer();
}

module.exports = Diplomacy;

Diplomacy.newRoundHandler = function(state){
	console.log('new round', state);
}
Diplomacy.endRoundHandler = function(state){
	console.log('end round', state);
}
Diplomacy.endGameHandler = function(state){
	console.log('end game', state);
}



Diplomacy.startGame('scott', 15000, 6);
Diplomacy.addPlayer('scott');
Diplomacy.addPlayer('dave');
Diplomacy.submitMove('scott', 'defend');
Diplomacy.submitMove('dave', 'attack', 'scott');
Diplomacy.endRound();
Diplomacy.submitMove('scott', 'defend');
Diplomacy.endGame();





/*



//////////////////////////////


var Moment = require('moment');
Storage.init(function(){
	console.log(Game());


	Diplomacy.newRoundHandler = function(state){
		var temp = Moment(state.roundEndTime);
		console.log('New round', state.currentRound, 'Ending at ' + temp.format('ddd Do HH:mm'));
	}

	if(!Diplomacy.isRunning()){
		Diplomacy.startGame('scott', 10000, 6);
	}else{
		Diplomacy.startTimer();
	}

})
*/

