require('app-module-path').addPath('./shared');

var _ = require('lodash');
var express = require('express');
var app = express();

var Logbot = require('logbot');


Logbot.info('Server Restart', 'Server restarted and everything looking good!');


/* Setup CONFIG */
var fs = require('fs');
if(fs.existsSync('./config.json')){
	var config;
	try{
		config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
	}catch(e){}
	process.env = _.extend(config, process.env);
}


var Cmds = require('./server/cmds.js')
//var Bots = require('./server/bots.js')

Cmds.loadCmds(app);
//Bots.loadBots();

var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');
