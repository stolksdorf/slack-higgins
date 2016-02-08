require('app-module-path').addPath('./shared');
var _ = require('lodash');

var Logbot = require('logbot');


var cmds = require('fs').readdirSync('./commands');

var targetCmd = process.argv[2];
var text = process.argv[3] || '';


var reply_callback = function(response){
	console.log(response);
}
var err_callback = function(err){
	if(_.isString(err)){
		return console.log('[whisper]', err);
	}
	return Logbot.error('Command Dev Error : ' + targetCmd, err);
}


try{
	var cmd = require('./commands/' + targetCmd);
}catch(err){
	return Logbot.error('Command Load Error : ' + targetCmd, err);
}

try{
	cmd(text, {}, reply_callback, err_callback)
}catch(err){
	Logbot.error('Command Run Error : ' + targetCmd, err);
}


