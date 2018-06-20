const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
//app.use(bodyParser.json());

process.once('unhandledRejection', (err)=>console.error(err));

const config = require('nconf')
	.argv()
	.env({lowerCase: true})
	.file('environment', {file: `config/${process.env.NODE_ENV}.json`})
	.file('defaults', {file: 'config/default.json'});

const Slack = require('pico-slack');
const Redis = require('pico-redis');

try {
	Redis.connect();
	Redis.raw.on('error', function(err) {
		Redis.raw.quit();
		console.error('Error connecting to redis', err);
	});
} catch (e){

}

Slack.setInfo('higgins', ':tophat:');
Slack.emitter.setMaxListeners(25);

const loadCmds = require('./cmd.loader.js');


const loadBots = ()=>{
	return new Promise((resolve, reject)=>{
		glob('./bots/**/*.bot.js', {}, (err, files)=>{
			if(err) return reject(err);
			return resolve(files);
		});
	})
		.then((bots)=>{
			_.each(bots, (botpath)=>{
				try {
					const router = require(botpath);
					console.log('loaded', botpath);
					if(router && !_.isEmpty(router)) app.use(router);
				} catch (err){
					console.log(err);
					Slack.error('Bot Load Error', botpath, err);
				}
			});
		})
};



app.get('/', (req, res)=>{
	Slack.log('Web Ping');
	res.send('ping');
});

Slack.connect(config.get('slack_bot_token'))
	.then(()=>loadBots())
	.then(()=>loadCmds('./cmds')).then((cmdRouter)=>app.use(cmdRouter))
	.then(()=>app.listen(process.env.PORT || 8000))
	.then(()=>Slack.debug('Rebooted!'))
	.catch((err)=>Slack.error(err));
