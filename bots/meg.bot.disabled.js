const _ = require('lodash');
const request = require('superagent');
const Storage = require('slack-helperbot/storage');
const utils = require('slack-helperbot/utils');
const markov = require('markov');

const MSG_THRESHOLD = 1200;

let megChain;

const filterMessages = function(obj){
	return _.reduce(obj.messages.matches, (r, msg)=>{
		if(msg.channel && msg.channel.name != 'diagnostics' && msg.channel.id[0] == 'C'){
			r.push(msg.text);
		}
		return r;
	}, []);
};

const getScottMessagesFromSlack = function(cb){
	let page = 1;
	let messages = [];

	var fetch = function(){
		console.log('fetching page ', page);
		request.get('https://slack.com/api/search.messages')
			.query({
				token : 'xoxp-19237672322-19237672338-22373161312-288780caec', //BotInstance.token,
				query : 'from:meggeroni',
				sort  : 'timestamp',
				page  : page,
				count : 800
			})
			.send()
			.end(function(err, res){
				if(err) return console.log(err);

				messages = _.union(messages, filterMessages(res.body));

				if(messages.length > MSG_THRESHOLD || res.body.messages.matches.length == 0){
					cb(messages);
				} else {
					page++;
					fetch();
				}
			});
	};

	fetch();

};

const buildChain = function(){
	megChain = markov(3);
	Storage.get('megbot_msgs', function(msgs){
		_.each(msgs, (m)=>{
			megChain.seed(m);
		});
	});
};


buildChain();

module.exports = {
	icon : ':meg:',
	name : 'megbot',

	channel : '*',
	handle  : function(msg, info, Higgins){
		if(utils.messageHas(msg, 'megbot', 'rebuild') && info.user == 'scott'){
			getScottMessagesFromSlack(function(msgs){
				Storage.set('megbot_msgs', msgs);
				buildChain();
				Higgins.reply(`Built with ${msgs.length} meg messages!`);
			});
		} else if(utils.messageHas(msg, 'megbot')){
			if(!megChain){
				buildChain();
				return Higgins.reply('Recalibrating... sorry try again!');
			}
			Higgins.reply(megChain.respond(msg).join(' '));
		}
	}
};