const _ = require('lodash');

/*
var exampleState = {
	currentRound : 2,
	investPool : 3,
	players : {
		bob : {
			name : 'bob',
			isMerc : false,
			score : 1,
			move : {
				action : 'attack',
				target : 'agatha'
			},
		},
		agatha : {
			name : 'agatha',
			isMerc : false,
			score : 2,
			move : {
				action : 'support',
				target : 'bob'
			}
		}
		...
	}
}
*/


const getPlayersByAction = function(state, actionType){
	return _.reduce(state.players, (r, player, playerName)=>{
		if(player.move.action == actionType) r.push(player);
		return r;
	}, []);
};
const getSupportersFor = function(state, targetName){
	return _.reduce(state.players, (r, player)=>{
		if(player.move.action == 'support' && player.move.target == targetName) r.push(player.name);
		return r;
	}, []);
};
const getDefenseValue = function(state, playerName){
	const player = state.players[playerName];
	if(player.move.action == 'invest') return 0;
	if(player.move.action == 'attack') return 1;
	if(player.move.action == 'support') return 1;
	if(player.move.action == 'defend') return player.result.supporters.length + 1;
};
const getAttackValue = function(state, playerName){
	const player = state.players[playerName];
	if(player.move.action == 'invest') return 0;
	if(player.move.action == 'defend') return 0;
	if(player.move.action == 'support') return 0;
	if(player.move.action == 'attack') return player.result.supporters.length + 1;
};




var Engine = {
	calculateRound : function(state, config){
		let newState = _.cloneDeep(state);
		//Setup a default config object
		const newConfig = _.assign({
			investFn    : function(state){ return state.investPool;},
			investStart : 0
		}, config);

		newState = _.flow(
			Engine.initPlayers,
			Engine.calculateInvests,
			Engine.calculateAttacks,
			Engine.calculateScoreDeltas,
			Engine.updateScores,
			Engine.assignMercs
		)(newState);

		newState = Engine.updateInvestPool(newState, newConfig);
		return newState;
	},

	initPlayers : function(state){
		_.each(state.players, (player)=>{
			player.result = {};
			if(!player.move) player.move = {};
			if(!player.isMerc && !player.move.action) player.move.action = 'defend';
		});
		//figure out the supporters after default actiosn have been set
		_.each(state.players, (player)=>{
			let supporters = getSupportersFor(state, player.name);

			//If a player is attacking someone who is supporting them, remove them from their supporters
			if(player.move.action == 'attack'){
				supporters = _.without(supporters, player.move.target);
			}

			player.result.supporters = supporters;
		});
		return state;
	},

	calculateInvests : function(state){
		const investPlayers = getPlayersByAction(state, 'invest');
		_.each(investPlayers, (player)=>{
			player.result.invest = Math.floor(state.investPool/investPlayers.length);
			player.result.isSuccessful = true;
		});
		return state;
	},

	calculateAttacks : function(state){
		const attackPlayers = getPlayersByAction(state, 'attack');
		_.each(attackPlayers, (atkPlayer)=>{
			const targetName = atkPlayer.move.target;
			const attackerWins = (getAttackValue(state, atkPlayer.name) > getDefenseValue(state, targetName));

			atkPlayer.result.isSuccessful = attackerWins;
			state.players[targetName].result.isSuccessful = !attackerWins;
		});
		return state;
	},

	calculateScoreDeltas : function(state){
		//Make a list of successful attackers keyed by target
		const atkList = _.reduce(getPlayersByAction(state, 'attack'), (r, attacker)=>{
			if(attacker.result.isSuccessful){
				if(!r[attacker.move.target]) r[attacker.move.target] = [];
				r[attacker.move.target].push(attacker);
			}
			return r;
		}, {});

		_.each(atkList, (attackers, targetName)=>{
			const lossValue = attackers.length;
			const target = state.players[targetName];

			target.result.loss = lossValue;
			_.each(attackers, (attacker)=>{
				attacker.result.spoils = 1;
			});

			//Steal investment if they were investing
			if(target.move.action == 'invest'){
				const investValue = target.result.invest;
				target.result.invest = 0;
				target.result.isSuccessful = false;

				//Split invest evenly between attackerNames
				_.each(attackers, (attacker)=>{
					attacker.result.stole = Math.floor(investValue/attackers.length);
				});
			}
		});
		return state;
	},

	assignMercs : function(state){
		_.each(state.players, (player)=>{
			if(player.score <= 0){
				player.score = 0;
				player.isMerc = true;
				player.result.becameMerc = true;
			}
		});
		return state;
	},

	updateScores : function(state){
		_.each(state.players, (player)=>{
			const res = player.result;
			player.result.delta = 0;
			player.result.delta += (res.spoils || 0) + (res.stole || 0) + (res.invest || 0);
			player.result.delta -= (res.loss || 0);
			player.score += player.result.delta;
		});
		return state;
	},

	updateInvestPool : function(state, config){
		const investPlayers = getPlayersByAction(state, 'invest');
		if(investPlayers.length){
			state.investPool = config.investStart; //Reset the pool
		} else {
			state.investPool = config.investFn(state);
		}
		return state;
	},
};

module.exports = Engine;
