var _ = require('lodash');
var Storage = require('slack-microbots/storage').create('diplomacy');
var Engine = require('./diplomacy.engine.js');

const TICK_RATE = 500; //1000 * 60 * 5

const KEY = 'diplomacy_game';
const ACTIONS = ['defend', 'attack', 'support', 'invest'];
var timer;


//Use to easily retrieve and modify game state
var Game = function(args){
	if(args){
		Storage.set(KEY, _.extend({}, Storage.get(KEY), args));
	}
	return Storage.get(KEY)
};

var config = {
	startingPoints : 3,
	investStart : 0,
	investFn : function(state){
		return state.investPool + 1
	}
}

var noGameCheck = function(){
	if(!Diplomacy.isRunning()) throw "A game isn't currently running.";
}

var Diplomacy = {
	getState : function(){
		return Game()
	},

	startGameHandler : function(){},
	newRoundHandler : function(){},
	endRoundHandler : function(){},
	endGameHandler : function(){},

	isRunning : function(){
		return !!Storage.get(KEY);
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
		Diplomacy.startGameHandler(state);
		Diplomacy.startTimer();
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
		noGameCheck();
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
		noGameCheck();
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
		noGameCheck();
		var state = Game();
		var player = state.players[name];


		if(!player) throw 'There is no player with that name playing';
		if(target && !state.players[target]) throw "That player isn't playing the game";
		if(player.isMerc && action !== 'support') throw "When you have 0 points, you can only do the 'support' action";
		if(!_.includes(ACTIONS, action)) throw "That's not a valid action. Options are: " + ACTIONS.join(', ');

		player.move = {
			action : action,
			target : target
		};
		Game(state);
	},
}

//Server restart timer code
if(Diplomacy.isRunning()){
	Diplomacy.startTimer();
}


module.exports = Diplomacy;
