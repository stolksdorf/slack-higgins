var logbot = require('./logbot');
var cmds = require('./cmds');
var bots = require('./bots');



module.exports = function(configObj){
	logbot.setUrl(configObj.diagnosticsWebhook);
	var cmdLoadResult = cmds.load(configObj.expressApp, configObj.cmdList)

	bots.start(configObj.botInfo, configObj.local, configObj.debug);
	var botLoadResult = bots.load(configObj.botList);

	//Separate message for local testing
	if(configObj.local){
		return logbot.info('Local Development Connected',
			'Local version of ' + configObj.botInfo.name + ' has successfully connected to slack.');
	}

	if(cmdLoadResult.error.length || botLoadResult.error.length){
		return logbot.error('Server Failed Restart', 'There were some issues restarting the server, check logbot.');
	}

	logbot.info('Server Restart', 'Successfully rebooted!');

}