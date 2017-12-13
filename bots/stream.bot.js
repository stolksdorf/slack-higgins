const router = require('express').Router();
const Slack = require('pico-slack');
router.get('/streambot/:name', (req, res)=>{
	Slack.sendAs('streambot', ':overwatch:', 'overwatch', `*${req.params.name}* just started streaming. https://www.twitch.tv/${req.params.name}`);
	return res.send('ok');
})
module.exports = router;