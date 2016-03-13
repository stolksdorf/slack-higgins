var _ = require('lodash');
var request = require('superagent');
var Storage = require('../helperbot/storage');
var utils = require('../helperbot/utils');
var markov = require('markov');

var scottChain;

var filterMessages = function(obj){
	return _.reduce(obj.messages.matches, (r, msg)=>{
		if(msg.channel && msg.channel.name != 'diagnostics'){
			r.push(msg.text)
		}
		return r;
	},[]);
}

var getScottMessagesFromSlack = function(cb){
	request.get('https://slack.com/api/search.messages')
		.query({
			token : 'xoxp-19237672322-19237672338-22373161312-288780caec',//BotInstance.token,
			query : 'from:scott',
			count : 500
		})
		.send()
		.end(function(err, res){
			if(err) return console.log(err);
			return cb(filterMessages(res.body));
		})
}

var buildChain = function(){
	scottChain = markov(4);
	Storage.get('scottbot_msgs', function(msgs){
		_.each(msgs, (m)=>{
			scottChain.seed(m);
		});
	});
}


buildChain();

module.exports = {
	icon : ':scott:',
	name : "scottbot",

	listenFor : ['message'],
	response : function(msg, info, Higgins, BotInstance){
		if(utils.messageHas(msg, 'scottbot', 'rebuild') && info.user == 'scott'){
			getScottMessagesFromSlack(function(msgs){
				Storage.set('scottbot_msgs', msgs);
				buildChain();
				Higgins.reply('Built!');
			});

		}else if(utils.messageHas(msg, 'scottbot')){
			if(!scottChain) return Higgins.reply('I need a rebuild!');
			Higgins.reply(scottChain.respond(msg).join(' '));
		}
	}
}