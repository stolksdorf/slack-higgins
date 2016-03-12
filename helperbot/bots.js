var _ = require('lodash');
var SlackBot = require('slackbots');
var Logbot = require('./logbot');

var DEBUG = false;
var LOCAL = false;

var Channels = {};
var Users = {}
var Bots = [];

var botEventMapping = {}

var BotInstance = {};
var BotInfo = {
	icon : ':robot_face:',
	name : 'helperbot'
}


var getBotInContext = function(bot, eventData){
	var botInfo = {
		icon_emoji : bot.icon || BotInfo.icon,
		username : bot.name || BotInfo.name
	}

	return {
		reply : function(msg, target){
			target = target || eventData.channel || eventData.user;
			return BotInstance.postTo(target, msg, botInfo)
		},
		react : function(emoji){
			return BotInstance._api('reactions.add', {
				name : emoji,
				channel : eventData.channelId,
				timestamp : eventData.ts
			});
		},
		whisper : function(msg, target){
			target = target || eventData.user;
			BotInstance.postTo(target, msg, botInfo);
		}
	}
}


var shouldHelperRespond = function(eventData){
	//Don't listen to yourself
	if(eventData.user == BotInfo.name) return false;

	//Don't ever listen to logbot
	if(eventData.user == 'logbot') return false;

	//if locally developing, only listen to #diagnostics
	if(LOCAL && eventData.channel != 'diagnostics') return false;

	//if in production, never listen to #diagnostics
	if(!LOCAL && eventData.channel == 'diagnostics') return false;

	return true;
}

var shouldBotRespond = function(eventData, bot){
	//Don't listen to yourself
	if(eventData.user == bot.name) return false;

	//Unless locally developing, check if the bot is only supposed to listen in one channel
	if(_.isString(bot.listenIn) && !LOCAL){
		if(eventData.channel == bot.listenIn) return true;
		return false;
	}

	return true;
}

//Cleans up the event object slack gives us
var enhanceEventData = function(eventData){
	eventData.channelId = eventData.channel;
	eventData.userId = eventData.user;

	//For reactions
	if(eventData.item && eventData.item.channel) eventData.channelId = eventData.item.channel;

	if(eventData.channelId) eventData.channel = Channels[eventData.channelId];
	if(eventData.userId) eventData.user = Users[eventData.userId];
	if(eventData.username) eventData.user = eventData.username;
	if(eventData.channelId && eventData.channelId[0] == 'D') eventData.isDirect = true;

	return eventData;
}


var handleEvent = function(data) {
	data = enhanceEventData(data);
	if(!shouldHelperRespond(data)) return;

	//if locally developing and you want full debugging, it console logs every event
	if(LOCAL && DEBUG){console.log(data);console.log('---');}

	_.each(botEventMapping[data.type], (bot)=>{
		if(shouldBotRespond(data, bot)){
			try{
				bot.response(data.text, data, getBotInContext(bot, data), BotInstance);
			}catch(err){
				//Truncate the stack to just the bot file
				err.stack = err.stack.substring(0, err.stack.indexOf(')')+1);
				Logbot.error('Bot Run Error : ' + bot.path, err);
			}
		}
	});
};


module.exports = {
	getBots : function(){
		return Bots;
	},

	start : function(botInfo, isLocal, isDebug){
		LOCAL = isLocal;
		DEBUG = isDebug;

		BotInstance = new SlackBot({
			token : botInfo.token,
			name  : botInfo.name
		});
		BotInfo = _.extend(BotInfo, botInfo);

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

		var dummyBot = ()=>{return {listenFor:[], response:function(){}}};

		Bots = _.map(botList, function(botPath){
			try{
				var bot = require('../bots/' + botPath);
				bot.path = botPath;
				loadResults.success.push(botPath);
				bot = _.extend(dummyBot(), bot); //Add defaults
				return bot;
			}catch(err){
				Logbot.error('Bot Load Error : ' + botPath, err);
				loadResults.error.push(botPath);
				return dummyBot();
			}
		});

		//Create object that maps message types to which bot triggers it
		_.each(Bots, function(bot){
			_.each(bot.listenFor, function(trigger){
				if(!botEventMapping[trigger]) botEventMapping[trigger] = [];
				botEventMapping[trigger].push(bot);
			})
		});

		return loadResults;
	}
}

