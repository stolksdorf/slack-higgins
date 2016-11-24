const _ = require('lodash');
const MicroBots = require('slack-microbots');
const glob = require('glob');
const path = require('path');
const bodyParser = require('body-parser')
const express = require('express');
const app = express();
app.use(express.static(__dirname + '/build'));
app.use(bodyParser.json());

const config = require('nconf');
config.argv()
	.env({ lowerCase: true })
	.file('environment', { file: 'config/local.json' })
	.file('defaults', { file: 'config/default.json' });
config.env('__');

//DB
require('mongoose')
	.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/naturalcrit')
	.connection.on('error', () => { console.log(">>>ERROR: Run Mongodb.exe ya goof!") });


const PinModel = require('./bots/pinbot/pin.model.js').model;


const logbot = require('slack-microbots/logbot.js');
logbot.setupWebhook(config.get('diagnostics_webhook'));

const Storage = require('slack-microbots/storage')


const Higgins = MicroBots(config.get('slack_bot_token'), {
	name : 'Higgins',
	icon : ':tophat:'
});

let Bots = [];
let Cmds = [];


Storage.init(() => {

	/* Load Bots */
	glob('./bots/**/*.bot.js', {}, (err, files) => {
		if(err) return logbot.error(err);
		const bots = _.reduce(files, (r, botFile)=>{
			try{
				r.push(require(botFile));
				console.log(`Loaded ${botFile}`);
				Bots.push(path.basename(botFile));
			}catch(e){
				logbot.error(e, 'Bot Load Error');
			}
			return r;
		}, []);
		Higgins.loadBots(bots);
		logbot.msg('Successful restart!');
	});

	/* Load Cmds */
	glob('./cmds/**/*.cmd.js', {}, (err, files) => {
		if(err) return logbot.error(err);
		const cmds = _.reduce(files, (r, cmdFile)=>{
			try{
				r.push(require(cmdFile));
				console.log(`Loaded ${cmdFile}`);
				Cmds.push(path.basename(cmdFile));
			}catch(e){
				logbot.error(e, 'Command Load Error');
			}
			return r;
		}, []);
		Higgins.loadCmds(app, cmds);
	});
});


const vitreumRender = require('vitreum/render');
app.get('/pins*', (req, res)=>{
	PinModel.find({}, (err, pins) => {
		//return res.json(pins);
		vitreumRender({
			page: './build/pins/bundle.dot',
			globals: {},
			prerenderWith : './client/pins/pins.jsx',
			initialProps: {
				url: req.originalUrl,
				pins : pins
			},
			clearRequireCache : !process.env.PRODUCTION,
		}, (err, page) => {
			return res.send(page)
		});
	});
});


app.get('/', (req, res)=>{
	return res.status(200).json({
		bots : Bots,
		cmds : Cmds,
	})
});


var port = process.env.PORT || 8000;

app.listen(port);
console.log('running bot server at localhost:8000');
