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

const Days= { Mon : 1, Tue : 2, Wed : 3, Thu : 4, Fri : 5, Sat : 6, Sun : 7 };

const pluck = (arr)=>arr[Math.floor(Math.random()*arr.length)];

const Slack = require('pico-slack');
const cron = require('node-schedule');

const DelegateEmoji = 'no_good'

const Peeps = [
	{ name: `jenny`, public: false },
	{ name: `sarahellen.w`, public: false },
	{ name: `scott`, public: true },
	{ name: `jogadora.calenso`, public: false },
	{ name: `tskoops`, public: false },
	{ name: `ross`, public: false },
	{ name: `meggeroni`, public: false },
	{ name: `chris`, public: false },
	{ name: `evelyn`, public: false },
	{ name: `david`, public: false },
	{ name: `mark`, public: false },
	{ name: `rebaybay`, public: false },
	{ name: `simon`, public: false },
	{ name: `jared`, public: false },
	{ name: `christiefelker993`, public: false },
	{ name: `katie`, public: false },
	{ name: `rhenderson1993`, public: false },
	{ name: `gleaver`, public: false },
	{ name: `christian`, public: false },
	{ name: `kellen`, public: false },
	{ name: `carlygrayy`, public: false },
	{ name: `ryan`, public: false },
	{ name: `thomas`, public: false },
	{ name: `kclairebrown`, public: false },
	{ name: `lp`, public: false },
];


//const getId = (target_name)=>(Object.entries(Slack.dms).find(([name, id])=>target_name == name)||[])[1];


// const mention = (user)=>{
// 	const userId = Object.entries(Slack.users).reduce((acc, [id, name])=>{
// 		return (name===user) ? id : acc;
// 	}, null);
// 	if (!userId) return user;
// 	return `<@${userId}>`;
// };


// Slack.onMessage((msg)=>{
// 	if(msg.channel !== 'happiness-and-cheer') return;
// 	if(!msg.mentionsBot) return;
// });


let delegateEvt, lastPeep;
Slack.onReact((evt)=>{
	if(evt.reaction == DelegateEmoji && evt.item.ts == delegateEvt.ts){
		Slack.log(`${lastPeep} has delegated`);
		Slack.send(lastPeep, `You got it! Delegating to someone else.`)
		sendReminder();
	}
})

const sendReminder = async (peep=pluck(Peeps), attempts=0)=>{
	try{
		lastPeep = peep.name;
		Slack.log(`Sent H&C reminder to ${lastPeep}`);
		delegateEvt = await Slack.send(peep.name, `Reminder that you will be picking the #happiness-and-cheer theme today. If you don't want to just click the :${DelegateEmoji}: emoji below and I'll pick someone else.`);
		Slack.react(delegateEvt, DelegateEmoji);
	}catch(err){
		Slack.log(`Error with sending H&C reminder to ${peep.name}`);
		if(attempts < 4) await sendReminder(pluck(Peeps), attempts+1);
	}
}


[
	Days.Mon,
	//Days.Tue,
	Days.Wed,
	//Days.Thu,
	Days.Fri,
	//Days.Sat,
	//Days.Sun
].map(day=>{
	cron.scheduleJob({hour: 8, minute : 4, dayOfWeek: day}, ()=>{
		sendReminder();
	});
})



/** Testing **/
Slack.onMessage((msg)=>{
	if(msg.isDirect && msg.text == 'hc_ping'){
		Peeps.map(peep=>{

			Slack.send(peep.name, `This is a test message to ensure that direct message for happiness and cheer are working.

				If you have already received this message, you don't have to let Scott know. DMs aren't working for a few people in Slack and he's trying to figure out why and who`)
			.then(()=>Slack.log(`Success with ${peep.name}`))
			.catch(()=>Slack.log(`Fail with ${peep.name}`))
		})
	}
	if(msg.isDirect && msg.text == 'hc_trigger'){
		sendReminder();
	}
});