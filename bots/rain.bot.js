const Slack = require('pico-slack');
const config = require('nconf');
const cron = require('node-schedule');
const request = require('superagent');


/** Setup **/
/*
1. On IFTTT setup the 'Webhooks' and 'Meross' services
2. Make two new applets:
	- one with the event `rain_light_on` that turns on your rain light
	- one with the event `rain_light_off` that turns your rain light off
3. Go here, https://ifttt.com/services/maker_webhooks/settings, and add the last part of the URL to higgins config
*/


const lp = {
	lat : '44.0603803',
	lng : '-79.4646008'
};


const dayForecast = async ()=>{
	return request(`https://api.darksky.net/forecast/${config.get('darksky_api')}/${lp.lat},${lp.lng}`)
		.then((res)=>{
			return {
				summary : res.body.hourly.summary,
				rain    : res.body.hourly.icon == 'rain' || res.body.hourly.icon == 'thunderstorm',
			}
		})
};

const turnLightOn  = async ()=>request(`https://maker.ifttt.com/trigger/rain_light_on/with/key/${config.get('ifttt_webhook_key')}`);
const turnLightOff = async ()=>request(`https://maker.ifttt.com/trigger/rain_light_off/with/key/${config.get('ifttt_webhook_key')}`);


const checkForRain = async ()=>{
	const forecast = await dayForecast();
	Slack.log(`Rain status: ${forecast.rain}`);
	if(forecast.rain) await turnLightOn();
};

Slack.onMessage(async (msg)=>{
	if(!msg.isDirect) return;
	if(!(msg.user == 'scott' || msg.user == 'lp')) return;

	// Diagnostics
	if(msg.text.toLowerCase() == 'rain check'){
		const forecast = await dayForecast();
		Slack.msg(msg.channel, `${forecast.summary}. Rain Status: ${forecast.rain}`);
		turnLightOn()
			.then((res)=>console.log(res.body))
	}
	if(msg.text.toLowerCase() == 'light off'){
		turnLightOff();
	}
});


// //Setup cronjob to check for rain at 6:30am every day
cron.scheduleJob('30 6 * * *', checkForRain);

// //Turns off light everyday at 10:30
cron.scheduleJob('30 10 * * *', turnLightOff);