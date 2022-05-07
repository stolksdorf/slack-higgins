const Slack = require('../utils/pico-slack');
const NSAPI = require('./nationstates.api.js');
const cron = require('node-schedule');
const _ = require('lodash');
const Nations = require('./nations.js');

const send = (text)=>Slack.sendAs('nationbot', 'earth_africa', 'nation-states', text);

const colors = ["#d35400", "#16a085", "#8e44ad", 'good', 'bad'];
const nums = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const timeout = ()=>new Promise((resolve, reject)=>setTimeout(resolve, 500));
const addNumVotesToMsg = (evt, opts)=>{
	return opts.reduce((flow, opt, idx)=>{
		return flow.then(()=>Slack.react(evt, nums[idx])).then(()=>timeout());
	}, Promise.resolve()).then(()=>evt);
};


// Every day around 3-6, get the activity of the day. filter for new legislation, and print it
// https://www.nationstates.net/page=activity/view=region.the_coolsville_commonwealth

// shuffle all users, then every few hours pick the next user in order and fetch their next issue
// Get flag url???

const higginsNames = ()=>{
	return [
		Slack.bot.id,
		'higgins', 'hizzle', 'h-dawg', 'higs', 'higgs', 'boson', 'good sir',
		'higgles', 'higgers', 'old chap', 'old boy', 'higgings', 'higgidy'
	];
}

const getIssue = (user)=>{
	NSAPI.fetchIssues(user)
		.then((issues)=>{
			if(issues.length == 0) return Send.caughtUp(user);
			Send.issue(user, issues[0]);
		})
		.catch(Send.error)
}



let memory = {};

const Send = {
	caughtUp : (user)=>{
		send(`${user} has no available issues`);
	},
	issue : (user, issue)=>{
		const nation = Nations[user];
		const userId = _.findKey(Slack.users, _.matches(user));

		return send({
			text : `A new issue on the docket! <@${userId}>`,
			attachments: [
				{
					fallback    : issue.title,
					color       : "#bdc3c7",
					title       : issue.title,
					title_link  : issue.link,
					text        : issue.text,
					thumb_url   : nation.flag_url,
					footer      : nation.nation,
					footer_icon : nation.flag_url
				}
			].concat(issue.options.map((opt, idx)=>{
				return {
					color : colors[idx],
					title : `:${nums[idx]}:`,
					text  : opt.text
				}
			}))
		})
			.then((evt)=>addNumVotesToMsg(evt, issue.options))
			.then((evt)=>{
				memory[evt.message.ts] = {
					issueId : issue.id,
					options : issue.options,
					user
				};
			})
			.catch(Send.error)
	},
	success : (result, headlines)=>{
		send(`The Talking Point: ${result}.`);
	},
	error : (err)=>{
		Slack.error(err);
		send('Something went wrong. Let scott know.');
	}
}


Slack.onMessage((msg)=>{
	if(msg.channel !== 'nation-states') return;

	if(Slack.has(msg.text, higginsNames(), ['issue', 'issues', 'nation', 'docket', 'people'])){
		getIssue(msg.user)
	}

	if(msg.text.toLowerCase() == 'proc'){
		procRandomNation();
	}
});

Slack.onReact((evt)=>{
	if(!memory[evt.item.ts] || memory[evt.item.ts].user !== evt.user) return;
	const entry = memory[evt.item.ts];
	const idx = nums.findIndex((num)=>num==evt.reaction);

	if(idx == -1) return;
	NSAPI.respondToIssue(entry.user, entry.issueId, entry.options[idx].id)
		.then((res)=>{
			Send.success(res.result, res.headlines);
		})
		.catch(Send.error)
	delete memory[evt.item.ts];
});


const randomNations = _.shuffle(Nations);
let index = 0;

const procRandomNation = ()=>{
	index = (index + 1) % randomNations.length;
	const nation = randomNations[index];
	Slack.log(nation);
	if(!nation.password) return procRandomNation();
	getIssue(nation.ruler);
};

// cron.scheduleJob('0 11 * * *', procRandomNation);
// cron.scheduleJob('30 13 * * *', procRandomNation);
// cron.scheduleJob('0 16 * * *', procRandomNation);
// cron.scheduleJob('30 20 * * *', procRandomNation);


