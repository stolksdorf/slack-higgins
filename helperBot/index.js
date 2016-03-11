var logbot = require('./logbot');
var cmds = require('./cmds');
var bots = require('./bots');



module.exports = function(configObj){
	logbot.setUrl(configObj.diagnosticsWebhook);

	//var cmdLoadResult = cmds.load(configObj.expressApp, configObj.cmdList)

	//console.log(cmdLoadResult);



	bots.start(configObj.botInfo);

	var botLoadResult = bots.load(configObj.botList);


	console.log(botLoadResult);


	//TODO: Separate message for local testing

	if(configObj.local){
		return logbot.info('Local Development Connected',
			'Local version of ' + configObj.botInfo.name + ' has successfully connected to slack.');
	}

	logbot.info('Server Restart', 'Server restarted and everything looking good!');

}