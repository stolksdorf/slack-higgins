var _ = require('lodash');


const INVEST_START = 10;
var INVEST_FN = function(state){
	return state.investPool + 1;
}

var getPlayersByAction = function(state, actionType){
	return _.reduce(state.players, (r, player, playerName)=>{
		if(player.move.action == actionType) r.push(player);
		return r;
	}, []);
};
var getSupportersFor = function(state, targetName){
	return _.reduce(state.players, (r, player)=>{
		if(player.move.action == 'support' && player.move.target == targetName) r.push(player.name);
		return r;
	}, []);
};
var getDefenseValue = function(state, playerName){
	var move = state.players[playerName].move;
	if(move.action == 'invest') return 0;
	if(move.action == 'attack') return 1;
	if(move.action == 'support') return 1;
	if(move.action == 'defend') return getSupportersFor(state, playerName).length + 1;
};
var getAttackValue = function(state, playerName){
	var move = state.players[playerName].move;
	if(move.action == 'invest') return 0;
	if(move.action == 'defend') return 0;
	if(move.action == 'support') return 0;
	if(move.action == 'attack') return getSupportersFor(state, playerName).length + 1;
};




var Engine = {

	calculateRound : function(state, configs){
		var newState = _.cloneDeep(state);

		//TODO: Try using a Monad?
		// maybe use _.flow()
		newState = Engine.setDefaultActions(newState)
		newState = Engine.calculateInvests(newState);
		newState = Engine.calculateAttacks(newState);
		newState = Engine.calculateScoreDeltas(newState);
		newState = Engine.updateScores(newState);
		newState = Engine.assignMercs(newState);

/*
		return _.flow(
			Engine.setDefaultActions,
			Engine.calculateInvests,
			Engine.calculateAttacks,
			Engine.calculateScoreDeltas,
			Engine.updateScores,
			Engine.assignMercs
		)(newState)
*/

		return newState;
	},




	setDefaultActions : function(state){
		_.each(state.players, (player)=>{
			player.result = {};
			player.result.supporters = getSupportersFor(player.name);
			if(!player.move) player.move = {};
			if(!player.isMerc && !player.move.action){
				player.move.action = 'defend'
			}
		});
		return state;
	},


	calculateInvests : function(state){
		var investPlayers = getPlayersByAction(state, 'invest');
		_.each(investPlayers, (player)=>{
			player.result.invest = Math.floor(state.investPool/investPlayers.length);
			player.result.isSuccessful = true;
		});
		if(investPlayers.length){
			state.investPool = INVEST_START; //Reset the pool
		}else{
			state.investPool = INVEST_FN(state);
		}
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
				attacker.result.gain = 1;
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
			var res = player.result;
			player.score += (res.gain || 0) + (res.stole || 0) + (res.invest || 0);
			player.score -= (res.loss || 0);
		})
		return state
	},
}







module.exports = Engine;




var exampleState = {
	//currentRound
	investPool : 3,

	players : {
		bob : {
			name : 'bob',
			isMerc : false,
			score : 3,
			move : {
				action : 'attack',
				target : 'agatha'
			},
			result : {
				supporters : [],
				invest : 0,
				isSuccessful : false
			}
		},
		agatha : {
			name : 'agatha',
			isMerc : false,
			score : 2,
			move : {
				action : 'attack',
				target : 'bob'
			}
		},
		jim : {
			name : 'jim',
			isMerc : false,
			score : 0,
			move : {
				action : 'attack',
				target : 'agatha'
			}
		}
		/*...*/
	}
}



var state = Engine.setDefaultActions(exampleState)

state = Engine.calculateInvests(state);
state = Engine.calculateAttacks(state);

state = Engine.calculateScoreDeltas(state);
state = Engine.updateScores(state);
state = Engine.assignMercs(state);


console.log(JSON.stringify(
	state
	, null, '  '
));






