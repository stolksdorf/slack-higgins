var _ = require('lodash');
var SlackBot = require('slackbots');
var Logbot = require('./logbot');

var TOKEN = process.env.SLACK_BOT_TOKEN;

var Channels = {};
var Users = {}
var Bots = [];

var botResponseMapping = {}


var BotInstance = {};
var BotInfo = {
	icon_emoji : ':robot_face:',
	username : 'helperbot'
}


var getBotInContext = function(eventData){
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


var shouldFrameworkRespond = function(eventData){
	//Don't listen to yourself
	if(eventData.user == BotInfo.username) return false;

	//Don't ever listen to logbot
	if(eventData.user == 'logbot') return false;


	//if locally developing, only listen to #diagnostics

	//if in production, never listen to #diagnostics

	return true;
}

var shouldBotRespond = function(eventData, bot){


	return true;
}

//Cleans up the event object slack gives us
var enhanceEventData = function(eventData){
	eventData.channelId = eventData.channel;
	eventData.userId = eventData.user;
	if(eventData.channel) eventData.channel = Channels[eventData.channelId];
	if(eventData.user) eventData.user = Users[eventData.userId];
	if(eventData.username) eventData.user = eventData.username;
	return eventData;
}


var handleEvent = function(data) {
	data = enhanceEventData(data);
	if(!shouldFrameworkRespond(data)) return;

	if()


	if(!botResponseMapping[data.type]) return;
	_.each(botResponseMapping[data.type], (bot)=>{
		try{
			bot.response(data.text, data, getBotInContext(data), BotInstance);
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
				bot.name = botPath;
				loadResults.success.push(botPath);
				bot = _.extend({listenFor:[], response:function(){}}, bot); //Add defaults
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
				if(!botResponseMapping[trigger]) botResponseMapping[trigger] = [];
				botResponseMapping[trigger].push(bot);
			})
		});

		console.log(botResponseMapping);

		return loadResults;
	}
}

