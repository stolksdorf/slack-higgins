const { processPollMessage, getHelpMessage, getMessage } = require('../bots/pollbot/poll.utils.js');

global.pollRequests = {};

/***
Slack Slash Command Configuration:






***/

module.exports = {
	url    : '/poll',
	handle : function(msg, info, reply, error){
		const {question, options} = processPollMessage(msg);
		console.log(question, options);
		if(!question || !options || options.length < 2){
			return error(getHelpMessage());
		}

		const pollMsg = getMessage(question, options);
		global.pollRequests[pollMsg] = options;
		reply(pollMsg)
	}
};