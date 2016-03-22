var fs = require('fs');
var _ = require('lodash');



var actions = ['defend', 'attack', 'support', 'invest'];
var STARTING_POINTS = 100;


var players = [];
var scores = {}
var submittedMoves = {};

var investEarnings = {};

var investPool = 25;


var dip = {
	startGame : function(roundLength, roundCount){
		game = {
			players : [],
			investPool : 0,
			scores : {},
			submittedMoves : {},


			investEarnings : [],

		}

	},

	startRound : function(){
		//increase pool
		//start timer
	},



	addPlayer : function(name){
		players.push(name);
		scores[name] = STARTING_POINTS
	},
	submitMove : function(name, action, target){
		submittedMoves[name] = {
			action : action,
			target : target
		};
	},




	///////

	getPlayersByAction : function(actionType){
		return _.reduce(submittedMoves, (r, move, player)=>{
			if(move.action == actionType) r.push(player);
			return r;
		}, []);
	},

	getSupporterCount : function(player){
		return dip.getSupporters(player).length;
	},
	getSupporters : function(player){
		return _.reduce(submittedMoves, (r, move, supportingPlayer)=>{
			if(move.action == 'support' && move.target == player) r.push(supportingPlayer);
			return r;
		}, []);
	},
	getDefense : function(player){
		var move = submittedMoves[player];
		if(move.action == 'invest') return 0;
		if(move.action == 'attack') return 1;
		if(move.action == 'support') return 1;
		if(move.action == 'defend') return dip.getSupporterCount(player) + 1;
	},
	getAttack : function(player){
		var move = submittedMoves[player];
		if(move.action == 'invest') return 0;
		if(move.action == 'defend') return 0;
		if(move.action == 'support') return 0;
		if(move.action == 'attack') return dip.getSupporterCount(player) + 1;
	},


/**/


	calculateRound : function(){
		dip.calculateInvests();
		dip.calculateAttacks();

		//clean up invests
		_.each(investEarnings, (value, player)=>{
			console.log('invest', player, value);
			scores[player] += value;
		});


		console.log(scores);

	},


	/////

	calculateInvests : function(){
		var investPlayers = dip.getPlayersByAction('invest');

		//Split pool evenly
		_.each(investPlayers, (player)=>{
			investEarnings[player] = Math.floor(investPool/investPlayers.length);
		});

		//reset the pool
		investPool = 0;

		return investEarnings;
	},

	calculateAttacks : function(){
		var attackPlayers = dip.getPlayersByAction('attack');

		var successfulAttacks = _.reduce(attackPlayers, (r, atkPlayer)=>{
			var target = submittedMoves[atkPlayer].target;
			if(dip.getAttack(atkPlayer) > dip.getDefense(target)){
				if(!r[target]) r[target] = [];
				r[target].push(atkPlayer);
			}
			return r;
		}, {})


		console.log('sa', successfulAttacks);

		_.each(successfulAttacks, (attackers, target)=>{
			var val = Math.floor(scores[target]/2);

			//reduce target's points
			scores[target] -= val;

			//Split the reward for each successful attacker
			_.each(attackers, (attacker)=>{
				scores[attacker] += Math.floor(val/attackers.length);
			});

			//If the target was investing, split up there investment
			if(submittedMoves[target].action == 'invest'){
				console.log('stole the invest!');
				_.each(attackers, (attacker)=>{
					scores[attacker] += Math.floor(investEarnings[target]/attackers.length);
				});
				investEarnings[target] = 0;
			}
		})
	},



}


dip.addPlayer('Agatha');
dip.addPlayer('Bathalsar');
dip.addPlayer('Cain');
dip.addPlayer('Dahlia');

dip.submitMove('Bathalsar', 'support', 'Agatha');
dip.submitMove('Agatha', 'attack', 'Dahlia');
dip.submitMove('Cain', 'attack', 'Dahlia');
dip.submitMove('Dahlia', 'invest');


//dip.submitMove('Cain', 'invest');
//dip.submitMove('Dahlia', 'support', 'Cain');


console.log(dip.calculateRound());

console.log(investEarnings);

//console.log('Defense', dip.calculateDefenses());
//console.log('Attack', dip.calculateAttack());
