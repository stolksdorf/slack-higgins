var logbot = require('./logbot');
var cmds = require('./cmds');
var bots = require('./bots');



module.exports = function(configObj){
	logbot.setUrl(configObj.diagnosticsWebhook);

	//var cmdLoadResult = cmds.load(configObj.expressApp, configObj.cmdList)

	//console.log(cmdLoadResult);


	var botLoadResult = bots.load(configObj.botList);


	console.log(botLoadResult);



	logbot.info('Server Restart', 'Server restarted and everything looking good!');

}