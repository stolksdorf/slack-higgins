const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const bodyParser = require('body-parser')
const express = require('express');
const app = express();
app.use(bodyParser.json());

const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

const Slack = require('pico-slack');
const Redis = require('pico-redis');

try{
	Redis.connect();
	Redis.raw.on("error", function(err) {
		Redis.raw.quit();
		console.error("Error connecting to redis", err);
	});
}catch(e){

}

Slack.setInfo('higgins', ':tophat:');

const loadCmds = require('./cmd.loader.js');


const loadBots = ()=>{
	return new Promise((resolve, reject)=>{
		glob('./bots/**/*.bot.js', {}, (err, files) => {
			if(err) return reject(err);
			return resolve(files);
		})
	})
	.then((bots)=>{
		_.each(bots, (botpath)=>{
			try{
				require(botpath);
				console.log('loaded', botpath);
			}catch(e){
				Slack.error('Bot Load Error', e);
			}
		})
	})
};


Slack.connect(config.get('slack_bot_token'))
	.then(()=>loadBots())
	.then(()=>loadCmds('./cmds'))
	.then((cmdRouter)=>app.use(cmdRouter))
	.then(()=>app.listen(process.env.PORT || 8000))
	.then(()=>Slack.debug('Rebooted!'))
	.catch((err)=>Slack.error(err));