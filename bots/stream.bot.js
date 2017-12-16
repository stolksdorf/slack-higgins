const router = require('express').Router();
const Slack = require('pico-slack');

let alreadySent = {};

const isPlaying = (name)=>{
	if(alreadySent[name]) return;
	alreadySent[name] = true;
	setTimeout(()=>alreadySent[name] = false, 1000 * 60 * 60);
	Slack.sendAs('streambot', ':overwatch:', 'overwatch', 
		     `*${name}* just started streaming. https://www.twitch.tv/${name}`
	);
};
router.get('/streambot/:name', (req, res)=>{
	isPlaying(req.params.name);	
	return res.send('ok');
});

module.exports = router;
