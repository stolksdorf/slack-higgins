const Slack = require('pico-slack');
const config = require('nconf');
const cron = require('node-schedule');
const request = require('superagent');


const lp = {
	lat : '44.0603803',
	lng : '-79.4646008'
};


const dayForecast = async ()=>{
	return request(`https://api.darksky.net/forecast/${config.get('darksky_api')}/${lp.lat},${lp.lng}`)
		.then((res)=>{
			return {
				summary : res.body.daily.summary,
				rain    : res.body.daily.icon == 'rain',
			}
		})
};

const check = async ()=>{
	const forecast = await dayForecast();
	Slack.log(`Rain status: ${forecast.rain}`);
	if(forecast.rain) request(config.get('rainbot_triggerurl'));
}

Slack.onMessage(async (msg)=>{
	if(!msg.isDirect) return;
	if(!(msg.user == 'scott' || msg.user == 'lp')) return;

	// Diagnostics
	if(msg.text.toLowerCase() == 'rain check'){
		const forecast = await dayForecast();
		Slack.msg(msg.channel, `${forecast.summary}. Rain Status: ${forecast.rain}`);
		request(config.get('rainbot_triggerurl')).send()
			.then((res)=>console.log(res.body))
	}
});


//Setup cronjob at 6:30am every day
cron.scheduleJob('30 6 * * *', check);