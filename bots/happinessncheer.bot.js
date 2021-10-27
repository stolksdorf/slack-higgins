/*
Ideas:

- Add option to be called out publicly or privately
- Turn user list into a more robust object
	- public or private notifcations
	- backup crew
	- nicknames?


- Store user list on a gist, remembers when it has triggered for each person
-


- Add a delegate emoji trigger: randomly assigns theme to another person

- Add emoji trigger to record current theme to a gist
	- Should use whoever says "theme" in happiness-and-cheer


- Add test to send a test message out to each person with their settings


*/


const Slack = require('pico-slack');
const cron = require('node-schedule');
const {differenceInCalendarDays} = require('date-fns');


const peeps = [
	`jenny`,
	`sarahellen.w`,
	`scott`,
	`jogadora.calenso`,
	`tskoops`,
	`ross`,
	`meggeroni`,
	`chris`,
	`evelyn`,
	`david`,
	`mark`,
	`rebaybay`,
	`simon`,
	`jared`,
	`christiefelker993`,
	`katie`,
	`rhenderson1993`,
	`gleaver`,
	`christian`,
	`kellen`,
	`carlygrayy`,
	`ryan`,
	`thomas`,
	`kclairebrown`,
	`lp`,
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
//let PeepOffset = calculateOffset('thomas', new Date('2020-12-14T00:00:00'));
//let PeepOffset = calculateOffset('kclairebrown', new Date('2021-01-01T00:00:00'));
let PeepOffset = calculateOffset('carlygrayy', new Date('2021-04-03T00:00:00'));



const mention = (user)=>{
	const userId = Object.entries(Slack.users).reduce((acc, [id, name])=>{
		return (name===user) ? id : acc;
	}, null);
	if (!userId) return user;
	return `<@${userId}>`;
};


Slack.onMessage((msg)=>{
	if(msg.channel !== 'happiness-and-cheer') return;
	if(!msg.mentionsBot) return;


	if(Slack.has(msg.text, ['who', 'which'], ['up', 'theme'])){
		const nextUp = getSuggester(PeepOffset + 1);
		const theChoosenOne = getSuggester(PeepOffset);
		Slack.send(msg.channel, `${mention(theChoosenOne)} is picking theme for today, and ${mention(nextUp)} will be picking for tomorrow.`)
	}

});


// cron.scheduleJob(`0 22 * * *`, ()=>{
// 	const nextUp = getSuggester(PeepOffset + 1);
// 	Slack.send('happiness-and-cheer', `Reminder: ${mention(nextUp)} will be picking theme for tomorrow.`);
// });

// cron.scheduleJob(`0 9 * * *`, ()=>{
// 	const theChoosenOne = getSuggester(PeepOffset);
// 	Slack.send('happiness-and-cheer', `Reminder: ${mention(theChoosenOne)} which theme will you bless us with today?`);
// });


//Monday, Wednesday, Friday
//[1,3,5]

const Days= {
	//Sun : 0,
	Mon : 1,
	Tue : 2,
	Wed : 3,
	Thu : 4,
	Fri : 5,
	Sat : 6,
	Sun : 7
};


[
	Days.Mon,
	Days.Tue,
	Days.Wed,
	Days.Thu,
	Days.Fri,
	Days.Sat,
	Days.Sun
].map(day=>{

	cron.scheduleJob({hour: 22, minute : 16, dayOfWeek: day-1}, ()=>{
		const nextUp = getSuggester(PeepOffset + 1);
		Slack.send(nextUp, `Reminder: ${mention(nextUp)} will be picking theme for tomorrow.`);

		//Slack.send('scott', `Reminder: ${mention(nextUp)} will be picking theme for tomorrow.`);
		Slack.log('reminder fire');
	});


	cron.scheduleJob({hour: 8, minute : 4, dayOfWeek: day}, ()=>{
		const theChoosenOne = getSuggester(PeepOffset);
		Slack.send(theChoosenOne, `Reminder: ${mention(theChoosenOne)} which theme will you bless us with today?`);

		//Slack.send('scott', `Reminder: ${mention(theChoosenOne)} which theme will you bless us with today?`);
		Slack.log('fire');
	});
})
