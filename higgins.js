const _ = require('lodash');
const MicroBots = require('slack-microbots');
const glob = require('glob');
const express = require('express');
const app = express();

const config = require('nconf');
config.argv()
	.env({ lowerCase: true })
	.file('environment', { file: 'config/local.json' })
	.file('defaults', { file: 'config/default.json' });
config.env('__');

const logbot = require('slack-microbots/logbot.js');
logbot.setupWebhook(config.get('diagnostics_webhook'));


const Higgins = MicroBots(config.get('slack_bot_token'), {
	name : 'Higgins',
	icon : ':tophat:'
});


/* Load Bots */
glob('./bots/**/*.bot.js', {}, (err, files) => {
	if(err) return logbot.error(err);
	var bots = _.reduce(files, (r, botFile)=>{
		try{
			r.push(require(botFile));
			console.log(`Loaded ${botFile}`);
		}catch(e){
			logbot.error(e, 'Bot Load Error');
		}
		return r;
	}, []);
	Higgins.loadBots(bots);
});

/* Load Cmds */
glob('./cmds/**/*.cmd.js', {}, (err, files) => {
	if(err) return logbot.error(err);
	var cmds = _.reduce(files, (r, cmdFile)=>{
		try{
			r.push(require(cmdFile));
			console.log(`Loaded ${cmdFile}`);
		}catch(e){
			logbot.error(e, 'Command Load Error');
		}
		return r;
	}, []);
	Higgins.loadCmds(app, cmds);
});


var port = process.env.PORT || 8000;

app.listen(port);
console.log('running bot server at localhost:8000');
