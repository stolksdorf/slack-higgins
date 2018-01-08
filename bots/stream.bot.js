const router = require('express').Router();
const Slack = require('pico-slack');
const config = require('nconf');

const MIN = 1000 * 60;
const COOLDOWN = config.get('streambot:cooldown_minutes') * MIN;

let timers = {};
const check = (name, game='overwatch')=>{
	if(!timers[name]){
		if(game == 'overwatch'){
			Slack.sendAs('streambot', ':overwatch:', 'overwatch',
				`*${name}* just started streaming Overwatch. https://www.twitch.tv/${name}`
			);
		} else{
			Slack.sendAs('streambot', ':video_game:', 'vidya',
				`*${name}* just started streaming ${game}. https://www.twitch.tv/${name}`
			);
		}
	}
	clearTimeout(timers[name]);
	timers[name] = setTimeout(()=>{
		timers[name] = false;
	}, COOLDOWN);
};

router.get('/streambot/:name/:game', (req, res)=>{
	check(req.params.name, req.params.game.trim().toLowerCase());
	return res.send('ok');
});

module.exports = router;
