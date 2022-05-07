const router = require('express').Router();
const Slack = require('../utils/pico-slack');

const MIN = 1000 * 60;

const timers = {};
const check = (name, game='overwatch')=>{
	if(!timers[name]){
		if(game == 'overwatch'){
			Slack.alias('streambot', ':overwatch:').send('overwatch',
				`*${name}* just started streaming Overwatch. https://www.twitch.tv/${name}`
			);
		} else {
			Slack.alias('streambot', ':video_game:').send('vidya',
				`*${name}* just started streaming ${game}. https://www.twitch.tv/${name}`
			);
		}
	}
	clearTimeout(timers[name]);
	timers[name] = setTimeout(()=>{
		timers[name] = false;
	}, 30 * MIN);
};

router.get('/streambot/:name/:game', (req, res)=>{
	check(req.params.name, req.params.game.trim().toLowerCase());
	return res.send('ok');
});

module.exports = router;
