const _ = require('lodash');
const Slack = require('pico-slack');
const MarkovService = require('./markov.service.js');


const formatNumber = (num)=>num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

//const Populate = require('./populate.script.js')

//Bump these to config files

const aliases = {
	dave  : 'david',
	meg   : 'meggeroni',
	scoot : 'scott',
	brock : 'brockdusome',
	greg  : 'gleaver',
	goog  : 'gleaver',
	'jennifer.czekus' : 'jenny',
	tina  : 'tskoops',
	jenaynay : 'jenny',
	rebabybay : 'rebaybay',
	rebecca  : 'rebaybay',
	sarah : 'sarahellen.w',
};
const iconAliases = {
	brockdusome : 'broccoli',
	slackbot : 'slack',
	david : 'mariachi_dave',
	'sarahellen.w' : 'sarah',
};

const blacklist = ['trivia-time'];

const botSend = async (channel, user, msg='')=>{
	const icon = iconAliases[user] || user;
	if(!msg) msg = await MarkovService.getNewMessage(user);
	Slack.api('chat.postMessage', {
		channel     : channel,
		username    : `${user}bot`,
		icon_emoji  : `:${icon}:`,
		attachments : [{
			pretext   : msg.text,
			mrkdwn_in : ['pretext'],
			footer    : `built with ${formatNumber(msg.msgs)} messages, using ${formatNumber(msg.letters)} letters.`
		}]
	});
};


const newBotSend = async (channel, user)=>{
	const msg = await service.generateMessage(user);
	Slack.api('chat.postMessage', {
		channel     : channel,
		username    : `${user}bot`,
		icon_emoji  : `:${iconAliases[user] || user}:`,
		attachments : [{
			pretext   : msg.text,
			mrkdwn_in : ['pretext'],
			footer    : `built with ${formatNumber(msg.msgCount)} messages, using ${formatNumber(msg.letterCount)} letters.`
		}]
	});
};


const service = require('./new stuff/service.js');

//migrate('scott').then(()=>Slack.msg('scott', 'done!'));

service.startTimedBackup(3 * 60 * 1000);


Slack.onMessage((msg)=>{
	if(blacklist.some((channel)=>channel==msg.channel)) return;

	////// TESTING

	if(Slack.msgHas(msg.text, `scottbot`)){
		return service.generateMessage('scott')
			.then((genMessage)=>{
				newBotSend(msg.channel, 'scott')
			});
	}

	if(msg.user == 'scott'){
		if(msg.isDirect){
			if(msg.text == 'populate') return service.migrate('scott').then(()=>Slack.msg('scott', 'done!'));
			if(msg.text == 'backup') return service.backup();
		}
		return service.encodeMessage('scott', msg.text);
	}

	////////////


	if(msg.isDirect && msg.text == 'populate' && msg.user == 'scott'){
		return service.migrate('scott').then(()=>Slack.msg('scott', 'done!'));
	}
	if(msg.isDirect && msg.text == 'test' && msg.user == 'scott'){
		return service.generateMessage('scott').then((message)=>Slack.msg('scott', message));
	}

	if(!msg.isDirect && !blacklist.includes(msg.channel)){
		MarkovService.addMessage(msg.user, msg.text);
	}

	//Bump out to another file
	_.map(Slack.users, (user)=>{
		if(Slack.msgHas(msg.text, `${user}bot`)) botSend(msg.channel, user);
	});
	_.map(aliases, (realName, alias)=>{
		if(Slack.msgHas(msg.text, `${alias}bot`)) botSend(msg.channel, realName);
	});
});

/** Random Proc **/
let populatedUsers = false;
const getRandomUser = async ()=>{
	if(Array.isArray(populatedUsers)) return _.sample(populatedUsers);
	populatedUsers = [];
	await Promise.all(_.map(Slack.users, async (name)=>{
		const count = await MarkovService.getMessageCount(name);
		if(count > 25) populatedUsers.push(name);
	}));
	return _.sample(populatedUsers);
};

const HOURS = 1000 * 60 * 60;
const sendRandomMessage = async ()=>{
	const randomUser = await getRandomUser();
	if(!randomUser) return;
	const msg = await MarkovService.getNewMessage(randomUser);
	if(msg) botSend('bottin-around', randomUser, msg);
	setTimeout(sendRandomMessage, _.random(5, 10) * HOURS);
};
setTimeout(sendRandomMessage, _.random(5, 10) * HOURS);
