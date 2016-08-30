var _ = require('lodash');

module.exports = {
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(info.user == 'scott'){
			var projects = ['KCAA', 'KLOUD', 'TIMS', 'TLWEB'];

      var projectRegex = new RegExp('((' + projects.join('|') + ')-([0-9]{1,4}))', 'ig');
      Higgins.reply('`' + JSON.stringify(msg.match(projectRegex)) + '`');
		}
	},
};
