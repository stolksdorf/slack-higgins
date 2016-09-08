var _ = require('lodash');
var request = require('superagent');
var Storage = require('slack-helperbot/storage');
var utils = require('slack-helperbot/utils');
var markov = require('markov');

var MSG_THRESHOLD = 1200;

var megChain;

var filterMessages = function(obj){
	return _.reduce(obj.messages.matches, (r, msg)=>{
		if(msg.channel && msg.channel.name != 'diagnostics' && msg.channel.id[0] == 'C'){
			r.push(msg.text)
		}
		return r;
	},[]);
}

var getScottMessagesFromSlack = function(cb){
	var page = 1;
	var messages = [];

	var fetch = function(){
		console.log('fetching page ', page);
		request.get('https://slack.com/api/search.messages')
			.query({
				token : 'xoxp-19237672322-19237672338-22373161312-288780caec',//BotInstance.token,
				query : 'from:meggeroni',
				sort : 'timestamp',
				page : page,
				count : 800
			})
			.send()
			.end(function(err, res){
				if(err) return console.log(err);

				messages = _.union(messages, filterMessages(res.body));

				if(messages.length > MSG_THRESHOLD || res.body.messages.matches.length == 0){
					cb(messages)
				}else{
					page++;
					fetch();
				}
			})
	}

	fetch();

}

var buildChain = function(){
	megChain = markov(3);
	Storage.get('megbot_msgs', function(msgs){
		_.each(msgs, (m)=>{
			megChain.seed(m);
		});
	});
}


buildChain();

module.exports = {
	icon : ':meg:',
	name : "megbot",

	channel : '*',
	handle : function(msg, info, Higgins){
		if(utils.messageHas(msg, 'megbot', 'rebuild') && info.user == 'scott'){
			getScottMessagesFromSlack(function(msgs){
				Storage.set('megbot_msgs', msgs);
				buildChain();
				Higgins.reply('Built with ' + msgs.length + ' meg messages!');
			});
		}else if(utils.messageHas(msg, 'megbot')){
			if(!megChain){
				buildChain();
				return Higgins.reply('Recalibrating... sorry try again!');
			}
			Higgins.reply(megChain.respond(msg).join(' '));
		}
	}
}