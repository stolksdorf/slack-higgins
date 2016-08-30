var _ = require('lodash');

module.exports = {
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(info.user == 'scott'){
			var projects = ['KCAA', 'KLOUD', 'TIMS', 'TLWEB'];

			var projectRegex = new RegExp('((' + projects.join('|') + ')-([0-9]{1,4}))', 'ig');
			var matches = msg.match(projectRegex);
			if(matches){
				_.each(matches, (match) => {
					msg = msg.replace(match, `https://jira.thalmiclabs.com/browse/${match.toUpperCase()}`)
				});
				Higgins.reply(msg);
			}
		}
	},
};
