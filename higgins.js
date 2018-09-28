const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
//app.use(bodyParser.json());

const config = require('pico-conf')
	.argv()
	.env()
	.file(`config/${process.env.NODE_ENV}.js`)
	.defaults(require('./config/default.js'))

const Slack = require('pico-slack');
const Redis = require('pico-redis');
const DB = require('./db.js');

process.on('unhandledRejection', Slack.error);

try {
	Redis.connect();
	Redis.raw.on('error', function(err) {
		Redis.raw.quit();
		console.error('Error connecting to redis', err);
	});
} catch (e){

}

try {
	DB.connect(config.get('database_url'), config.get('db', true));
} catch (err) {
	console.error('Error connecting to postgres', err);
}

Slack.setInfo('higgins', ':tophat:');
Slack.emitter.setMaxListeners(25);

const loadCmds = require('./cmd.loader.js');
const loadActions = require('./action.loader.js');


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
	.then(()=>loadActions('./actions')).then((actionRouter)=>app.use(actionRouter))
	.then(()=>app.listen(process.env.PORT || 8000))
	.then(()=>Slack.debug('Rebooted!'))
	.catch((err)=>Slack.error(err));
