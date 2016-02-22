var _ = require('lodash');
var SlackBot = require('slackbots');
var Logbot = require('logbot');

var TOKEN = process.env.SLACK_BOT_TOKEN;

var Channels = {};
var Users = {}
var Bots = [];


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
	BotRTM.postMessageToChannel('diagnostics', 'Booting up sir', higginsInfo);
});


BotRTM.on('message', function(data) {
	//TODO : Add protection for other bot names
	if(data.username == 'higgins' || data.username == 'meowbot') return;

	data.channelId = data.channel;
	data.userId = data.user;

	if(data.channel) data.channel = Channels[data.channelId];
	if(data.user) data.user = Users[data.userId];

	//console.log(data);

	_.each(Bots, (bot)=>{
		if(_.includes(bot.listenFor, data.type)){
			var reply = function(msg, target){
				BotRTM.postTo(target || data.channel, msg, _.extend(higginsInfo, {
					icon_emoji : bot.icon || higginsInfo.icon_emoji,
					username : bot.name || higginsInfo.username
				}))
			};

			try{
				bot.response(data.text, data, reply, BotRTM);
			}catch(err){
				Logbot.error('Bot Run Error : ' + bot.path, err);
			}
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

		console.log(Bots);
	}
}

