const Slack = require('./pico-slack.js');
const glob = require('glob');
const path = require('path');

process.on('unhandledRejection', (err)=>{
	Slack.utils.log([err], { footer : 'Unhandled rejection within promise', color : 'danger', logger : console.error });
});
process.on('uncaughtException', (err)=>Slack.error(err));

const defaultOpts = {
	pattern : '**/*.bot.js',
	ignore : '**/disabled/**'
}

const loadBots = async (opts={})=>{
	opts = Object.assign(defaultOpts, opts);
	return new Promise((resolve, reject)=>{
		glob(opts.pattern, opts, (err, files)=>err ? reject(err) : resolve(files));
	})
	.then((botPaths)=>{
		return botPaths.map((botPath)=>{
			const bot = {
				name : path.basename(botPath),
				path : path.resolve(botPath),
			};
			try {
				bot.result = require(bot.path);
				if(typeof bot.result === 'object' && Object.keys(bot.result).length === 0){
					delete bot.result;
				}
			} catch (err){
				Slack.error(err);
				bot.error = err;
			}
			return bot;
		});
	})
}

module.exports = loadBots;
