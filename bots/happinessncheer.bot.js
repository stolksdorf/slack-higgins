const Slack = require('pico-slack');
const cron = require('node-schedule');
const {differenceInCalendarDays} = require('date-fns');


const peeps = [
	`rebaybay`,
	`christian`,
	`evelyn`,
	`lp`,
	`scott`,
	`rhenderson1993`,
	`thomas`,
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
	`ryan`,
	`ross`,
	`christiefelker993`,
	`sarahellen.w`,
	`kclairebrown`,
];


const getSuggester = (offset=0, now=new Date()) =>{
	const yearStart = new Date(now.getFullYear(), 0, 0);
	const delta = differenceInCalendarDays(now, yearStart);
	return peeps[(delta + offset) % peeps.length];
};

const calculateOffset = (targetPeep, targetDate)=>{
	let offset = 0;
	while(offset < peeps.length){
		if(targetPeep == getSuggester(offset, targetDate)) break;
		offset+=1;
	}
	return offset;
};


// REMINDER: Update this whenever you change the above list
let PeepOffset = calculateOffset('thomas', new Date('2020-12-14T00:00:00'));


const mention = (user)=>{
	const userId = Object.entries(Slack.users).reduce((acc, [id, name])=>{
		return (name===user) ? id : acc;
	}, null);
	if (!userId) return user;
	return `<@${userId}>`;
};



cron.scheduleJob(`0 22 * * *`, ()=>{
	const nextUp = getSuggester(PeepOffset + 1);
	Slack.send('happiness-and-cheer', `Reminder: ${mention(nextUp)} will be picking theme for tomorrow.`);
});

cron.scheduleJob(`0 9 * * *`, ()=>{
	const theChoosenOne = getSuggester(PeepOffset);
	Slack.send('happiness-and-cheer', `Reminder: ${mention(theChoosenOne)} which theme will you bless us with today?`);
});
