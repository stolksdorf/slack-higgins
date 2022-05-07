const Slack = require('../utils/pico-slack');
const request = require('superagent');
const cron = require('node-schedule');


const findBetween = (str, open, close)=>{
	let start = str.indexOf(open);
	if(start == -1) return '';
	close = str.indexOf(close, start);
	return str.slice(start + open.length, close);
}

const fetchApolloEvents = async ()=>{
	const res = await request.get('https://apollocinema.ca/schedule/');
	const rawData = findBetween(res.text, `events: [`, `],\n        eventTimeFormat`);
	const events = eval(`(()=>{ return [` + rawData + `]})()`)
		.map(evt=>{ return {...evt, start: new Date(evt.start)} });

	return events;
	//require('fs').writeFileSync('./temp_apollo_events.json', JSON.stringify(events, null, '\t'), 'utf8');
};


// const fetchApolloEvents2 = ()=>JSON.parse(require('fs').readFileSync('./temp_apollo_events.json', 'utf8'))
// 	.map(evt=>{ return {...evt, start: new Date(evt.start)}})



const filterEventsByWeeksOut = (events, numOfWeeks=1)=>{
	const hour = 1000 * 60 * 60;
	const day = 24*hour
	const week = day*7;
	return events.filter(evt=>evt.start < (Date.now() + week * numOfWeeks));
};

const groupEventsByMovie = (events)=>{
	let result = {};
	events.map(({title, start, url})=>{
		if(!result[title]){
			result[title] = { title, url, showtimes : []}
		}
		result[title].showtimes.push(start.toLocaleString("en-US", {
			weekday : 'short',
			month   : 'short',
			day     : 'numeric',
			hour    : 'numeric',
			minute  : '2-digit',
			hour12  : false
		}))
	});
	return Object.values(result);
};

const makeSlackMessage = (events)=>{
	return `Here are the upcoming showtimes for the <https://apollocinema.ca/schedule|Apollo Theater>\n\n`
		+ events.map(evt=>{
			return `*<${evt.url}|${evt.title}>* \n${evt.showtimes.join('\n')}`
		}).join('\n\n')
};




const run = async ()=>{
	let events = await fetchApolloEvents();
	events = filterEventsByWeeksOut(events, 1);
	events = groupEventsByMovie(events);

	Slack.send('events', makeSlackMessage(events));
};

Slack.onChannelMessage('events', (msg)=>{
	if(Slack.has(msg.text, 'apollo', ['events', 'shows', 'showtimes', 'playing'])){
		run();
	}
});

//Every week on Monday
cron.scheduleJob('10 15 * * 1', run);