const Slack = require('pico-slack');
const cron = require('node-schedule');
const config = require('../config');
const {differenceInCalendarDays} = require('date-fns');

const mention = (user)=>{
	const userId = Object.entries(Slack.users).reduce((acc, [id, name])=>{
		return (name===user) ? id : acc;
	}, null);
	if (!userId) return user;
	return `<@${userId}>`;
};

const peeps = [
	`rebaybay`,
	`christian`,
	`evelyn`,
	`lp`,
	`scott`,
	`rhenderson1993`,
	`tskoops`,
	`david`,
	`katie`,
	`meggeroni`,
	`gleaver`,
	`kellen`,
	`cathleen`,
	`chris`,
	`simon`,
	`carlygrayy`,
	`jared`,
	`mark`,
	`jenny`,
	`conradtwchow`,
	`ross`,
	`ryan`,
	`christiefelker993`,
	`sarahellen.w`,
	`kclairebrown`,
].map(mention);

const PeepOffset = Number(config.get('happinessandcheerbot:peep_offset', true)); //So whatever date it is we land on the right person

const getSuggester = (offset=0) =>{
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 0);
	const delta = differenceInCalendarDays(now, yearStart);
	const targetIdx = (delta + offset) % peeps.length
	return peeps[(targetIdx + PeepOffset) % peeps.length];
};

cron.scheduleJob(`0 22 * * *`, ()=>{
	const nextUp = getSuggester(1);
	Slack.send('happiness-and-cheer', `Reminder: ${nextUp} will be picking theme for tomorrow.`);
});

cron.scheduleJob(`0 9 * * *`, ()=>{
	const theChoosenOne = getSuggester(0);
	Slack.send('happiness-and-cheer', `Reminder: ${theChoosenOne} which theme will you bless us with today?`);
});

//console.log(getSuggester(0))
