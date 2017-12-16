const router = require('express').Router();
const Slack = require('pico-slack');

const MIN = 1000 * 60;

let timers = {};
const check = (name)=>{
	if(!timers[name]){
		Slack.sendAs('streambot', ':overwatch:', 'overwatch', 
			`*${name}* just started streaming. https://www.twitch.tv/${name}`
		);
	}
	clearTimeout(timers[name]);
	timers[name] = setTimeout(()=>{
		timers[name] = false;
	}, 45 * MIN);
};

router.get('/streambot/:name', (req, res)=>{
	check(req.params.name);
	return res.send('ok');
});

module.exports = router;
