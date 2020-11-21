const Slack = require('pico-slack');
const config = require('pico-conf');
const request = require('superagent');
const cron = require('node-schedule');

const datefns = require('date-fns');

const Gist = require('pico-gist')(config.get('github_token'));
const GistId = 'da33c5e5a5b00c103ef11687458b47f8';


const CHANNEL = 'barometer-binches';
const KITCHENER_AVG_PRESSURE = 1016;
const WEEK_THRESHOLD = 6;
const DAY_THRESHOLD = 6;



const getRealtimePressure = async ()=>{
	return request.get(`https://api.openweathermap.org/data/2.5/weather?q=Kitchener&appid=${config.get('openweather.api_key')}`)
		.then(({body})=>body.main.pressure)
};

const getHistoricPressures = async ()=>{
	return Gist.get(GistId)
		.then(({barometer_history})=>{
			return barometer_history;
		});
};

const recordCurrentPressure = async ()=>{
	return await Gist.append(GistId, {
		barometer_history : [{
			pressure : await getRealtimePressure(),
			ts       : (new Date()).toISOString()
		}]
	});
};


/////////////////////////////////////////////////


const d = (val)=>`${val>0?'+':''}${val.toFixed(1)}`;


const filterByDaysAgo = (pressures, daysAgo)=>{
	return pressures.filter(({pressure, ts})=>{
		return datefns.differenceInDays(new Date(), new Date(ts)) < daysAgo;
	});
};


const getDayDelta = (pressures, currPressure)=>{
	return filterByDaysAgo(pressures, 1).reduce((acc, val)=>{
		if(!acc || Math.abs(acc) < Math.abs(currPressure-val.pressure)) return currPressure-val.pressure
		return acc;
	}, false);
};

const getWeekDelta = (pressures, currPressure)=>{
	const avgPressure = (pressures)=>{
		return pressures.reduce((acc, {pressure})=>{
			return acc + Number(pressure)
		}, 0) / pressures.length;
	};
	return currPressure - avgPressure(filterByDaysAgo(pressures, 7))
};


const genMsg = (currPressure, dayDelta, weekDelta)=>{
	return `The barometric pressure is currently ${currPressure} hPa :wind_blowing_face:

:clock2: We're seeing a ${d(weekDelta)} hPa delta within the last 24hrs.
:calendar: The current pressure is ${d(dayDelta)} hPa relative to the weekly average.
:cityscape: ${d(currPressure - KITCHENER_AVG_PRESSURE)} hPa to Kitchener's yearly average.
	`
}


////////////////////



const check = async ()=>{
	try{
		const currPressure = await getRealtimePressure();
		const history = await getHistoricPressures();

		const weekDelta = getWeekDelta(history, currPressure);
		const dayDelta = getDayDelta(history, currPressure);

		console.log(weekDelta, WEEK_THRESHOLD)
		console.log(dayDelta, DAY_THRESHOLD)

		if(Math.abs(weekDelta) < WEEK_THRESHOLD) return;
		if(Math.abs(dayDelta) < DAY_THRESHOLD) return;

		Slack.send(CHANNEL, `* :warning: HEADS UP BAROMETER BINCHES :warning: *
			${genMsg(currPressure, dayDelta, weekDelta)}
		`);
	}catch(err){
		console.log(err)
	}
};


Slack.onMessage(async (msg)=>{
	if(msg.mentionsBot && Slack.has(msg, ['pressure', 'barometric', 'barometer'])){
		const currPressure = await getRealtimePressure();
		const history = await getHistoricPressures();

		const weekDelta = getWeekDelta(history, currPressure);
		const dayDelta = getDayDelta(history, currPressure);

		Slack.send(msg.channel, genMsg(currPressure, dayDelta, weekDelta));
	}

	if(Slack.has(msg, 'test', 'pressure')){

		check();

	}
});

////////////////

cron.scheduleJob(`0 8 * * *`, check);  //Morning check
cron.scheduleJob(`0 13 * * *`, check); //Afternoon check
cron.scheduleJob(`0 18 * * *`, check); //Evening check


cron.scheduleJob(`0 7 * * *`, recordCurrentPressure);
cron.scheduleJob(`0 12 * * *`, recordCurrentPressure);
cron.scheduleJob(`0 17 * * *`, recordCurrentPressure);