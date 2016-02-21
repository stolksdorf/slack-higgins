var _ = require('lodash');
var SlackBot = require('slackbots');
var Logbot = require('logbot');

var TOKEN = process.env.SLACK_BOT_TOKEN;

var Channels = {};
var Users = {}
var Bots = [];

var higginsInfo = {
	icon_emoji : ':tophat:',
	username : 'higgins'
};

var Higgins = new SlackBot({
	token: TOKEN,
	name: 'higgins'
});


Higgins.getChannels().then(function(res){
	Channels = _.mapKeys(res.channels, function(channel) {
		return channel.id;
	});
	Channels = _.mapValues(Channels, function(channel) {
		return channel.name;
	});
});

Higgins.getUsers().then(function(res){
	Users = _.mapKeys(res.members, function(member) {
		return member.id;
	});
	Users = _.mapValues(Users, function(member) {
		return member.name;
	});
});


Higgins.on('start', function() {
	Higgins.postMessageToChannel('diagnostics', 'Booting up sir', higginsInfo);
});


Higgins.on('message', function(data) {
	if(data.username == 'higgins') return;

	data.channelId = data.channel;
	data.userId = data.user;

	if(data.channel) data.channel = Channels[data.channelId];
	if(data.user) data.user = Users[data.userId];

	console.log(data);

	_.each(Bots, (bot)=>{
		if(_.includes(bot.listenFor, data.type)){
			var reply = function(msg, target){
				Higgins.postTo(target || data.channel, msg, _.extend(higginsInfo, {
					icon_emoji : bot.icon || higginsInfo.icon_emoji,
					username : bot.name || higginsInfo.username
				}))
			};

			try{
				bot.response(data.text, data, reply, Higgins);
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

