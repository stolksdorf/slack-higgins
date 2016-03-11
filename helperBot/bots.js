var _ = require('lodash');
var SlackBot = require('slackbots');
var Logbot = require('./logbot');

var TOKEN = process.env.SLACK_BOT_TOKEN;

var Channels = {};
var Users = {}
var Bots = [];

var responseMapping = {}


var BotInstance = {};
var BotInfo = {
	icon_emoji : ':robot_face:',
	username : 'helperbot'
}


var createBotInContext = function(eventData){
	return {
		reply : function(msg, target){
			target = target || eventData.channel;
			return BotInstance.postTo(target, msg, BotInfo)
		},
		react : function(emoji){
			return BotInstance._api('reactions.add', {
				name : emoji,
				channel : eventData.channelId,
				timestamp : eventData.ts
			});
		},
		whipser : function(msg, target){
			//Create ephemeral message to user
		}
	}
}


var shouldRespond = function(eventData){

}



var handleEvent = function(data) {


	console.log(data);

	console.log("----------");

	return


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

		//Create a wrapper around the BotInstance for Higgins
		var Higgins = {
			reply : function(msg, target){
				target = target || data.channel;
				return BotInstance.postTo(target, msg, {
					icon_emoji : bot.icon || higginsInfo.icon_emoji,
					username : bot.name || higginsInfo.username
				})
			},
			react : function(emoji){
				return BotInstance._api('reactions.add', {
					name : emoji,
					channel : data.channelId,
					timestamp : data.ts
				});
			},
		}

		try{
			bot.response(data.text, data, Higgins, BotInstance);
		}catch(err){
			Logbot.error('Bot Run Error : ' + bot.path, err);
		}
	});
};



module.exports = {
	getBots : function(){
		return Bots;
	},

	start : function(botInfo){
		BotInstance = new SlackBot({
			token: botInfo.token,
			name: botInfo.name
		});
		BotInfo = _.extend(BotInfo, {
			icon_emoji : botInfo.icon,
			username : botInfo.name
		});

		//Populate channels and users
		BotInstance.getChannels().then(function(res){
			Channels = _.chain(res.channels)
				.map((channel)=>{ return [channel.id, channel.name] })
				.fromPairs().value();
		});
		BotInstance.getUsers().then(function(res){
			Users = _.chain(res.members)
				.map((member)=>{ return [member.id, member.name] })
				.fromPairs().value();
		});

		BotInstance.on('message', handleEvent);
	},

	load : function(botList){
		var loadResults ={
			success : [],
			error : []
		};

		Bots = _.map(botList, function(botPath){
			try{
				var bot = require('../bots/' + botPath);
				bot.path = botPath;
				loadResults.success.push(botPath);
				//Add defaults
				bot = _.extend({listenFor:[], response:function(){}}, bot)
				return bot;
			}catch(err){
				Logbot.error('Bot Load Error : ' + botPath, err);
				loadResults.error.push(botPath);
				return;
			}
		});

		//Create object that maps message types to which bot triggers it
		_.each(Bots, function(bot){



			_.each(bot.listenFor, function(trigger){
				if(!responseMapping[trigger]) responseMapping[trigger] = [];
				responseMapping[trigger].push(bot);
			})
		});

		return loadResults;
	}
}

