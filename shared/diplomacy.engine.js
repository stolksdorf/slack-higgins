var _ = require('lodash');

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


var getPlayersByAction = function(state, actionType){
	return _.reduce(state.players, (r, player, playerName)=>{
		if(player.move.action == actionType) r.push(player);
		return r;
	}, []);
};
var getSupportersFor = function(state, targetName){
	return _.reduce(state.players, (r, player)=>{
		//console.log(player, targetName);
		if(player.move.action == 'support' && player.move.target == targetName) r.push(player.name);
		return r;
	}, []);
};
var getDefenseValue = function(state, playerName){
	var player = state.players[playerName];
	if(player.move.action == 'invest') return 0;
	if(player.move.action == 'attack') return 1;
	if(player.move.action == 'support') return 1;
	if(player.move.action == 'defend') return player.result.supporters.length + 1;
};
var getAttackValue = function(state, playerName){
	var player = state.players[playerName];
	if(player.move.action == 'invest') return 0;
	if(player.move.action == 'defend') return 0;
	if(player.move.action == 'support') return 0;
	if(player.move.action == 'attack') return player.result.supporters.length + 1;
};




var Engine = {
	calculateRound : function(state, config){
		var newState = _.cloneDeep(state);
		//Setup a default config object
		var newConfig = _.assign({
			investFn : function(state){ return state.investPool;},
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
			player.result.supporters = getSupportersFor(state, player.name);
			if(!player.move) player.move = {};
			if(!player.isMerc && !player.move.action){
				player.move.action = 'defend'
			}
			//console.log('init', player);
		});
		return state;
	},

	calculateInvests : function(state){
		var investPlayers = getPlayersByAction(state, 'invest');
		_.each(investPlayers, (player)=>{
			player.result.invest = Math.floor(state.investPool/investPlayers.length);
			player.result.isSuccessful = true;
		});
		return state;
	},

	calculateAttacks : function(state){
		var attackPlayers = getPlayersByAction(state, 'attack');
		_.each(attackPlayers, (atkPlayer)=>{
			var targetName = atkPlayer.move.target;
			var attackerWins = (getAttackValue(state, atkPlayer.name) > getDefenseValue(state, targetName));

			atkPlayer.result.isSuccessful = attackerWins;
			state.players[targetName].result.isSuccessful = !attackerWins;
		});
		return state;
	},

	calculateScoreDeltas : function(state){
		//Make a list of successful attackers keyed by target
		var atkList = _.reduce(getPlayersByAction(state, 'attack'), (r, attacker)=>{
			if(attacker.result.isSuccessful){
				if(!r[attacker.move.target]) r[attacker.move.target] = [];
				r[attacker.move.target].push(attacker)
			}
			return r;
		}, {});

		_.each(atkList, (attackers, targetName)=>{
			var lossValue = attackers.length;
			var target = state.players[targetName];

			target.result.loss = lossValue;
			_.each(attackers, (attacker)=>{
				attacker.result.spoils = 1;
			});

			//Steal investment if they were investing
			if(target.move.action == 'invest'){
				var investValue = target.result.invest;
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
		})
		return state;
	},

	updateScores : function(state){
		_.each(state.players, (player)=>{
			var res = player.result
			player.result.delta = 0;
			player.result.delta += (res.spoils || 0) + (res.stole || 0) + (res.invest || 0);
			player.result.delta -= (res.loss || 0);
			player.score += player.result.delta;
		})
		return state
	},

	updateInvestPool : function(state, config){
		var investPlayers = getPlayersByAction(state, 'invest');
		if(investPlayers.length){
			state.investPool = config.investStart; //Reset the pool
		}else{
			state.investPool = config.investFn(state);
		}
		return state;
	},
};

module.exports = Engine;



/* TESTS


var exampleState = {
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
		},
		jim : {
			name : 'jim',
			isMerc : false,
			score : 4,
			move : {
				action : 'invest',
				target : 'agatha'
			}
		}
	}
}


var state = Engine.calculateRound(exampleState, {
	investStart : 10,
	investFn : function(state){
		return state.investPool * 2
	}
})


console.log(JSON.stringify(
	state
	, null, '  '
));


*/



