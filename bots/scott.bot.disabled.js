var _ = require('lodash');
var request = require('superagent');
var Storage = require('slack-microbots/storage').create('scottbot');
var utils = require('slack-microbots/utils');
var markov = require('markov');

var MSG_THRESHOLD = 1200;

var scottChain;

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
				query : 'from:scott',
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
	scottChain = markov(3);
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
	channel : '*',
	handle : function(msg, info, Higgins){
		if(utils.messageHas(msg, 'scottbot', 'rebuild') && info.user == 'scott'){
			getScottMessagesFromSlack(function(msgs){
				Storage.set('scottbot_msgs', msgs);
				buildChain();
				Higgins.reply('Built with ' + msgs.length + ' scott messages!');
			});
		}else if(utils.messageHas(msg, 'scottbot')){
			if(!scottChain){
				buildChain();
				return Higgins.reply('Recalibrating... sorry try again!');
			}
			Higgins.reply(scottChain.respond(msg).join(' '));
		}
	}
}
