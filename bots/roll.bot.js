const Slack = require('pico-slack');
const _ = require('lodash');


const rollDice = (dice)=>_.times(dice.num, ()=>_.random(1, dice.type));

const hasAdvantage = function(msg){
	return _.includes(msg, 'adv') || _.includes(msg, 'inspiration');
};
const hasDisadvantage = function(msg){
	return _.includes(msg, 'dis')
};
const parseDice = function(msg){
	const dNotation = msg.match(/([\d]*)d([\d]+)/);
	if(dNotation === null) throw "Oops, your dice string wasn't formatted properly";
	return {
		num : Number(dNotation[1] || 1),
		type : Number(dNotation[2] || 6),
	};
};

var getBear = function(){
	var description = _.sample(['rookie', 'washed-up', 'retired', 'unhinged', 'slick', 'incompetent']);
	var bear = _.sample([
		'Grizzly bear, who is terrifiying',
		'Polar bear, who is amazing at swimming',
		'Panda bear, who will eat anything that looks like bamboo',
		'Black bear, who can climb anything',
		'Sun bear, who can sense honey',
		'Honey Badger, who is pure carnage'
	]);
	var role = _.sample(['muscle', 'brains', 'driver', 'hacker', 'thief', 'face']);

	return {
		text : `You are a ${description} ${bear}. You are the ${role} of the group.`,
		rolls : []
	}
}

const getCheck = function(msg){
	let numOfDice = 1
	if(hasDisadvantage(msg) || hasAdvantage(msg)){
		numOfDice = 2;
	}
	const rolls = rollDice({
		num : numOfDice,
		type : 20
	});

	let result = rolls[0];
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

const getRoll = function(msg){
	const dice = parseDice(msg);
	const rolls = rollDice(dice);

	return {
		text : dice.num + 'd' + dice.type + ': ' + _.sum(rolls),
		rolls : rolls
	}
}

var getFudge = function(){
	var rolls = _.times(4, function(){
		return _.sample([-1,-1,0,0,1,1]);
	});
	var sum = _.sum(rolls);

	return {
		text : sum + (sum == -4 ? ':grimacing:' : '') + (sum == 4 ? ':tada:' : ''),
		rolls : rolls
	};
}


Slack.onMessage((msg)=>{
	if(!Slack.msgHas(msg.text, 'roll')) return;

	let res;
	try{
		if(Slack.msgHas(msg.text, ['check','throw','save'])){
			res = getCheck(msg.text);
		}else if(Slack.msgHas(msg.text, 'fudge')){
			res = getFudge();
		}else if(Slack.msgHas(msg.text, 'bear')){
			res = getBear();
		}else{
			res = getRoll(msg.text);
		}
	}catch(e){
		return Slack.error(e);
	}

	let response = res.text;
	if(res.rolls.length > 1){
		response += '\n> ' + JSON.stringify(res.rolls)
	}

	Slack.msgAs('rollbot', ':game_die:', msg.channel, response);
});