const Slack = require('pico-slack');
const config = require('pico-conf');
const request = require('superagent');
const cron = require('node-schedule');

const KITCHENER_AVG_PRESSURE = 1016
const PRESSURE_DELTA_TRIGGER = 6;

const getPressure = async ()=>{
	return request.get(`https://api.openweathermap.org/data/2.5/weather?q=Kitchener&appid=${config.get('openweather.api_key')}`)
		.then(({body})=>{
			return body.main.pressure
		})
};

const check = async ()=>{
	const pressure = await getPressure();
	const delta = pressure - KITCHENER_AVG_PRESSURE;

	if(delta >= PRESSURE_DELTA_TRIGGER){
		Slack.send('support', `Heads out Barometer Binches. The barometric pressure is currently ${delta} kPa over the average. If you are feeling off, it might be that.`);
	}
}

cron.scheduleJob(`0 8 * * *`, check);  //Morning check
cron.scheduleJob(`0 13 * * *`, check); //Afternoon check
