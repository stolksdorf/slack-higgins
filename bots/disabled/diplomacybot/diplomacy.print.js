const _ = require('lodash');
const Moment = require('moment');



var print = {
	cmds : function(){
		return ['> The commands for Diplomacy are:',
			'> - `higgins start game with X rounds lasting XX [min/hr/days]`',
			'> - `higgins end the game`',
			'> - `higgins scores plz`',
			'> - `higgins join the game`',
			'> - `higgins what are the rules?`',
			'',
			'> Debug Commands',
			'> - `~ add player1`',
			'> - `~ player1 action player2`',
			'> - `~ end round`'
		].join('\n');
	},
	rules : function(){
		//If you attack someone who is supporting you, they will be removed from your supporters

		return 'PUT RULES HERE';
	},
	timeLeft : function(state){
		return `This round will end at *${Moment(state.roundEndTime).format('ddd Do HH:mm')}*`;
	},
	investPool : function(state){
		return `The invest pool is currently at *${state.investPool} points*`;
	},
	roundInfo : function(state){
		return [
			'The current scores are: ',
			print.scoreboard(state),
			'',
			print.investPool(state),
			print.timeLeft(state)

		].join('\n');
		//scoreboard
		//timeleft
		//invest pool
	},
	scoreboard : function(state){
		const sortedScores = _.sortBy(state.players, (player)=>{
			return -player.score;
		});
		return _.map(sortedScores, (player)=>{
			let delta = '';
			if(player.result){
				if(player.result.delta < 0){
					delta = ` _(${player.result.delta})_`;
				} else {
					delta = ` _(+${player.result.delta})_`;
				}
			}
			if(player.score < 1){
				return `~:${player.name}: has ${player.score} points${delta}~`;
			}
			return `:${player.name}: has ${player.score} points${delta}`;
		}).join('\n');
	},

	actions : function(state){
		return _.map(state.players, (player)=>{
			const res = player.result;
			const move = player.move;
			if(move.action == 'invest'){
				if(res.isSuccessful){
					return `:moneybag: *${player.name}* invests, earning ${res.invest}`;
				} else {
					return `:money_with_wings: *${player.name}* invests, but it's stolen!`;
				}
			} else if(move.action == 'support'){
				return `:heart: *${player.name}* supports *${move.target}*`;
			} else if(move.action == 'attack'){
				if(res.isSuccessful){
					return `:crossed_swords: *${player.name}* sucessfully attacks *${move.target}*${
						res.supporters.length ? ` _(with support from ${res.supporters.join(', ')})_` : ''
					}, gaining ${res.spoils
					}${res.stole ? ` and stealing ${res.stole}` :''}`;
				} else {
					return `:grimacing: *${player.name}* fails to attack *${move.target}*`;
				}
			} else if(move.action == 'defend'){
				if(res.isSuccessful === true){
					return `:shield: *${player.name}* sucessfully defends${
						res.supporters.length ? ` _(with support from ${res.supporters.join(', ')})_` : ''}`;
				} else if(res.isSuccessful === false){
					return `:waving_white_flag: *${player.name}* fails to defend${
						res.loss ? `, losing ${res.loss}` : ''}`;
				} else {
					return `:shield: *${player.name}* defended`;
				}
			}
		}).join('\n');
	},
};



module.exports = print;