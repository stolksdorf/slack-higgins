var _ = require('lodash');

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
	if(!_.includes(msg, 'd')) throw "Oops, your dice string wasn't formatted properly";

	var dice = {
		num : Number(msg.split('d')[0] || 1),
		type : Number(msg.split('d')[1] || 6),
	}
	var rolls = rollDice(dice);

	return {
		text : dice.num + 'd' + dice.type + ': ' + _.sum(rolls),
		rolls : rolls
	}
}

module.exports = function(msg, info, reply){
	var res;
	if(_.includes(msg, 'check') || _.includes(msg, 'throw')){
		res = getCheck(msg);
	}else{
		res = getRoll(msg);
	}

	var response = {
		text : res.text
	};

	if(res.rolls.length > 1){
		response.attachments = [{
			text : 'rolls: ' + JSON.stringify(res.rolls)
		}]
	}

	reply(response);
}
