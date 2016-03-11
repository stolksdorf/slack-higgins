require('app-module-path').addPath('./shared');

var fs = require('fs');
var _ = require('lodash');
var express = require('express');
var app = express();

/* Setup CONFIG */
var fs = require('fs');
if(fs.existsSync('./config.json')){
	var config;
	try{
		//try loading a local config
		config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
	}catch(e){
		console.log('ERROR', e);
	}
	process.env = _.extend(config, process.env);
}


//Boot up helperbot
require('./helperbot')({
	expressApp : app,
	diagnosticsWebhook : process.env.DIAGNOSTICS_WEBHOOK,
	local : !process.env.PRODUCTION,

	cmdList : fs.readdirSync('./commands'),
	botList : fs.readdirSync('./bots'),

	botInfo : {
		icon : ':tophat:',
		name : 'higgins',
		token : process.env.SLACK_BOT_TOKEN
	}
})




var port = process.env.PORT || 8000;

app.listen(port);
console.log('running bot server at localhost:8000');