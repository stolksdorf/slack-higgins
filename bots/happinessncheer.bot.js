const Slack = require('pico-slack');
const cron = require('node-schedule');
const config = require('pico-conf');
const {differenceInCalendarDays} = require('date-fns');

const peeps = [
	`Rbb`,
	`Christian`,
	`Evelyn`,
	`LP`,
	`Scott`,
	`Rachel`,
	`Tina`,
	`David`,
	`Katie`,
	`Meg`,
	`Greg`,
	`Kellen`,
	`Cathleen`,
	`Chris`,
	`Simon`,
	`Carly`,
	`Jared`,
	`Mark`,
	`Jenny`,
	`Conrad`,
	`Ross`,
	`Ryan`,
	'Christie',
	'Sarah',
];

const PeepOffset = Number(config.get('happinessandcheerbot:peep_offset')); //So whatever date it is we land on the right person

const getSuggester = (offset=0) =>{
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 0);
	const delta = differenceInCalendarDays(now, yearStart)
	return peeps[(delta + offset + PeepOffset) % peeps.length];
}

cron.scheduleJob(`0 22 * * *`, ()=>{
	const nextUp = getSuggester(1);
	Slack.send('happiness-and-cheer', `Reminder: ${nextUp} will be picking theme for tomorrow.`);
});

cron.scheduleJob(`0 9 * * *`, ()=>{
	const theChoosenOne = getSuggester(0);
	Slack.send('happiness-and-cheer', `Reminder: ${theChoosenOne} which theme will you bless us with today?`);
});


console.log(getSuggester(1))