var _ = require('lodash');
var utils = require('slack-microbots/utils');

var errorResponse = function(){};


var rollDice = function(dice){
	return _.times(dice.num, function(){
		return _.random(1, dice.type);
	});
};
var hasAdvantage = function(msg){
	return _.includes(msg, 'adv') || _.includes(msg, 'inspiration');
};
var hasDisadvantage = function(msg){
	return _.includes(msg, 'dis')
};
var parseDice = function(msg){
	var dNotation = msg.match(/([\d]*)d([\d]+)/);
	if(dNotation === null) throw "Oops, your dice string wasn't formatted properly";
	return {
		num : Number(dNotation[1] || 1),
		type : Number(dNotation[2] || 6),
	};
};

var getCheck = function(msg){
	var numOfDice = 1
	if(hasDisadvantage(msg) || hasAdvantage(msg)){
		numOfDice = 2;
	}
	var rolls = rollDice({
		num : numOfDice,
		type : 20
	});

	var result = rolls[0];
	if(hasDisadvantage(msg)){
		result = _.min(rolls);
	}else if(hasAdvantage(msg)){
		result = _.max(rolls);
	}

	if(result == 20) result = 'CRIT!';
	if(result == 1) result = 'FAIL!';

	return {
		text : result,
		rolls : rolls
	}
}

var getRoll = function(msg){
	var dice = parseDice(msg);
	var rolls = rollDice(dice);

	return {
		text : dice.num + 'd' + dice.type + ': ' + _.sum(rolls),
		rolls : rolls
	}
}

module.exports = {
	name : 'rollbot',
	icon : ':game_die:',
	channel : '*',
	handle : function(msg, info, Higgins){
		if(!utils.messageHas(msg, 'roll')) return;
		var res;
		try{
			if(_.includes(msg, 'check') || _.includes(msg, 'throw') || _.includes(msg, 'save')){
				res = getCheck(msg);
			}else{
				res = getRoll(msg);
			}
		}catch(e){
			return Higgins.reply(e.toString());
		}

		var response = res.text;

		if(res.rolls.length > 1){
			response += '\n > rolls: ' + JSON.stringify(res.rolls)
		}

		Higgins.reply(response);
	}
}
