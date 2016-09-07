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

let Bots = [];
let Cmds = [];

/* Load Bots */
glob('./bots/**/*.bot.js', {}, (err, files) => {
	if(err) return logbot.error(err);
	Bots = _.reduce(files, (r, botFile)=>{
		try{
			r.push(require(botFile));
			console.log(`Loaded ${botFile}`);
		}catch(e){
			logbot.error(e, 'Bot Load Error');
		}
		return r;
	}, []);
	Higgins.loadBots(Bots);
});

/* Load Cmds */
glob('./cmds/**/*.cmd.js', {}, (err, files) => {
	if(err) return logbot.error(err);
	Cmds = _.reduce(files, (r, cmdFile)=>{
		try{
			r.push(require(cmdFile));
			console.log(`Loaded ${cmdFile}`);
		}catch(e){
			logbot.error(e, 'Command Load Error');
		}
		return r;
	}, []);
	Higgins.loadCmds(app, Cmds);
	//test.load(app, Cmds);
});









const formatResponse = (response) => {
	if(_.isString(response)){
		return { text : response };
	}else if(!_.isPlainObject(response)){
		return { text : JSON.stringify(response) };
	}else{
		return response;
	}
};

var test = {
	load : function(expressInstance, cmds){
		_.each(cmds, (cmd) => {
			if(!cmd.url){
				console.error('URL not set for command');
				return;
			}

			console.log('adding', cmd.url);

			expressInstance.all(`${cmd.url}`, (req, res) => {
				console.log('processing endpoint');
				const input = _.assign({}, req.query, req.body);
				try{
					cmd.handle(
						input.text,
						input,
						(response) => {
							return res.status(200).send(_.assign({
								'response_type': 'in_channel',
							}, formatResponse(response)));
						},
						(error) => {
							return res.status(200).send(_.assign({
								'response_type': 'ephemeral',
							}, formatResponse(err)));
						}
					);
				}catch(err){
					console.error(`Command Run Error : ${err}`);
					return res.status(200).send();
				}
			})
		});
		return expressInstance;
	}
}




















app.get('/', (req, res)=>{
	return res.status(200).json({
		bots : Bots,
		cmds : Cmds,
	})
})



var port = process.env.PORT || 8000;

app.listen(port);
console.log('running bot server at localhost:8000');
