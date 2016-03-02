var _ = require('lodash');
var SlackBot = require('slackbots');
var Logbot = require('logbot');

var TOKEN = process.env.SLACK_BOT_TOKEN;

var Channels = {};
var Users = {}
var Bots = [];

var responseMapping = {}


//TODO:
// - Wrap Higgens and return him alone
// - Add a reaction and reply fucntiosn on him
// - Map the listenFors to an object

var higginsInfo = {
	icon_emoji : ':tophat:',
	username : 'higgins'
};

var BotRTM = new SlackBot({
	token: TOKEN,
	name: 'higgins'
});


BotRTM.getChannels().then(function(res){
	Channels = _.mapKeys(res.channels, function(channel) {
		return channel.id;
	});
	Channels = _.mapValues(Channels, function(channel) {
		return channel.name;
	});
});

BotRTM.getUsers().then(function(res){
	Users = _.mapKeys(res.members, function(member) {
		return member.id;
	});
	Users = _.mapValues(Users, function(member) {
		return member.name;
	});
});


BotRTM.on('start', function() {
	//BotRTM.postMessageToChannel('diagnostics', 'Booting up sir', higginsInfo);
});


BotRTM.on('message', function(data) {
	//TODO : Add protection for other bot names
	if(data.username == 'higgins' || data.username == 'LogBot' || data.username == 'meowbot') return;

	data.channelId = data.channel;
	data.userId = data.user;

	if(data.channel) data.channel = Channels[data.channelId];
	if(data.user) data.user = Users[data.userId];

	//If we are locally testing, only received messages from the diagnostics channel
	if(process.env.LOCAL && data.channel !== 'diagnostics') return;


	console.log(data);


	if(!responseMapping[data.type]) return;

	_.each(responseMapping[data.type], (bot)=>{

		//Create a wrapper around the botRTM for Higgins
		var Higgins = {
			reply : function(msg, target){
				target = target || data.channel;
				return BotRTM.postTo(target, msg, {
					icon_emoji : bot.icon || higginsInfo.icon_emoji,
					username : bot.name || higginsInfo.username
				})
			},
			react : function(emoji){
				return BotRTM._api('reactions.add', {
					name : emoji,
					channel : data.channelId,
					timestamp : data.ts
				});
			},
		}

		try{
			bot.response(data.text, data, Higgins, BotRTM);
		}catch(err){
			Logbot.error('Bot Run Error : ' + bot.path, err);
		}
	});
});



module.exports = {
	loadBots : function(){
		var bots = require('fs').readdirSync('./bots');
		Bots = _.map(bots, function(botPath){
			try{
				var bot = require('../bots/' + botPath);
				bot.path = botPath;
				return bot;
			}catch(err){
				Logbot.error('Bot Load Error : ' + botPath, err);
				return;
			}
		});

		//Create object that maps message types to which bot triggers it
		_.each(Bots, function(bot){
			_.each(bot.listenFor, function(trigger){
				if(!responseMapping[trigger]) responseMapping[trigger] = [];
				responseMapping[trigger].push(bot);
			})
		})
	}
}

