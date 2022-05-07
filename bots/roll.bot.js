const Slack = require('../utils/pico-slack');
const _ = require('lodash');


const rollDice = (dice)=>_.times(dice.num, ()=>_.random(1, dice.type));

const hasAdvantage = function(msg){
	return _.includes(msg, 'adv') || _.includes(msg, 'inspiration');
};
const hasDisadvantage = function(msg){
	return _.includes(msg, 'dis');
};
const parseDice = function(msg){
	const dNotation = msg.match(/\s([\d]*)d([\d]+)/);
	if(dNotation === null) throw 'Oops, your dice string wasn\'t formatted properly';
	return {
		num  : Number(dNotation[1] || 1),
		type : Number(dNotation[2] || 6),
	};
};

const getBear = function(){
	const description = _.sample(['rookie', 'washed-up', 'retired', 'unhinged', 'slick', 'incompetent']);
	const bear = _.sample([
		'Grizzly bear, who is terrifying',
		'Polar bear, who is amazing at swimming',
		'Panda bear, who will eat anything that looks like bamboo',
		'Black bear, who can climb anything',
		'Sun bear, who can sense honey',
		'Honey Badger, who is pure carnage'
	]);
	const role = _.sample(['muscle', 'brains', 'driver', 'hacker', 'thief', 'face']);

	return {
		text  : `You are a ${description} ${bear}. You are the ${role} of the group.`,
		rolls : []
	};
};

const getCheck = function(msg){
	let numOfDice = 1;
	if(hasDisadvantage(msg) || hasAdvantage(msg)){
		numOfDice = 2;
	}
	const rolls = rollDice({
		num  : numOfDice,
		type : 20
	});

	let result = rolls[0];
	if(hasDisadvantage(msg)){
		result = _.min(rolls);
	} else if(hasAdvantage(msg)){
		result = _.max(rolls);
	}

	if(result == 20) result = 'CRIT!';
	if(result == 1) result = 'FAIL!';

	return {
		text  : result,
		rolls : rolls
	};
};

const getRoll = function(msg){
	const dice = parseDice(msg);
	const rolls = rollDice(dice);

	return {
		text  : `${dice.num}d${dice.type}: ${_.sum(rolls)}`,
		rolls : rolls
	};
};

const getFudge = function(){
	const rolls = _.times(4, function(){
		return _.sample([-1, -1, 0, 0, 1, 1]);
	});
	const sum = _.sum(rolls);

	return {
		text  : sum + (sum == -4 ? ':grimacing:' : '') + (sum == 4 ? ':tada:' : ''),
		rolls : rolls
	};
};


const {addDays, format} = require('date-fns');
const pluck = (arr)=>arr[Math.floor(Math.random()*arr.length)];


const pickRandomDate = ()=>{
	const res = addDays(Date.now(), Math.floor(Math.random()*365));
	return pluck([
		()=>`Your date is ${format(res, 'dddd MMM Do, YYYY')}`,
		()=>`Your date is ${format(res, 'dddd MMM Do')}, In the year of Our Lord ${format(res, 'YYYY')}`,
		()=>`I heard ${format(res, 'dddd MMM Do, YYYY')} is going to be a great day`,
		()=>`Between you and me? ${format(res, 'dddd MMM Do, YYYY')} is gunna slap`,
		()=>`Mark ${format(res, 'dddd MMM Do, YYYY')} on your calendars ev'rybody`,
		()=>`I gotchu, ${format(res, 'dddd MMM Do, YYYY')}`,
		()=>`𝓓𝓞 𝓝𝓞𝓣 𝓕𝓔𝓐𝓡 𝓜𝓨 𝓒𝓗𝓘𝓛𝓓, 𝓣𝓗𝓔 𝓓𝓐𝓨 𝓞𝓕 𝓡𝓔𝓒𝓚𝓞𝓝𝓘𝓝𝓖 𝓢𝓗𝓐𝓛𝓛 𝓞𝓒𝓒𝓤𝓡 𝓞𝓝 ${format(res, 'dddd MMM Do, YYYY')}`
	])()
};


Slack.onMessage((msg)=>{
	// Avoids matching "roll" in undesired words like "controlling".
	if(!/(?:^|\s)roll/i.test(msg.text)) return;

	let res;
	try {
		if(Slack.has(msg.text, ['check', 'throw', 'save'])){
			res = getCheck(msg.text);
		} else if(Slack.has(msg.text, 'fudge')){
			res = getFudge();
		} else if(Slack.has(msg.text, 'bear')){
			res = getBear();
		} else if(Slack.has(msg.text, ['date', 'day'])){
			res = {
				text  : pickRandomDate(),
				rolls : []
			};
		} else {
			res = getRoll(msg.text);
		}
	} catch (e){
		//return Slack.error(e);
	}
	if(!res) return;

	let response = res.text;
	if(res.rolls.length > 1){
		response += `\n> ${JSON.stringify(res.rolls)}`;
	}

	Slack.send(msg.channel, response, {
		username:   'rollbot',
		icon_emoji: ':game_die:'
	});
});
