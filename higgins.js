const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.json());

const config = require('./config')

const Slack = require('pico-slack');
const BotLoader = require('pico-slack/bot-loader.js');

const Redis = require('pico-redis');


try {
	Redis.connect();
	Redis.raw.on('error', function(err) {
		Redis.raw.quit();
		console.error('Error connecting to redis', err);
	});
} catch (e){

}


const DB = require('./db.js');
try {
	DB.connect(config.get('database_url'), config.get('db', true));
} catch (err) {
	console.error('Error connecting to postgres', err);
}





Slack.bot.name = 'higgins';
Slack.bot.icon = 'tophat';
Slack.emitter.setMaxListeners(100);

const loadCmds = require('./cmd.loader.js');
const loadActions = require('./action.loader.js');


const loadBots = async ()=>{
	isRouter = (obj)=>obj && Object.getPrototypeOf(obj) == express.Router;
	const bots = await BotLoader();
	return bots.map((bot)=>{
		if(bot.error) return;
		console.log('loaded bot ->', bot.name);
		if(isRouter(bot.result)) app.use(bot.result);
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
	.then(()=>Slack.log('Rebooted!'))
	.then(()=>Slack.onEvent('reconnect', ()=>Slack.log('Reconnected!')))
	.then(()=>Slack.onError((err)=>Slack.error(`Slack socket error: ${err}`, err)))
	.catch(Slack.error);
