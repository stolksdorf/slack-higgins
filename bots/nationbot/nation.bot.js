const Slack = require('pico-slack');
const NSAPI = require('./nationstates.api.js');

const Nations = require('./nations.js');

const send = (text)=>Slack.sendAs('nationbot', 'earth_africa', 'nation-states', text);

console.log(Nations);

const nums = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const timeout = ()=>new Promise((resolve, reject)=>setTimeout(resolve, 500));
const addNumVotesToMsg = (evt, opts)=>{
	return opts.reduce((flow, opt, idx)=>{
		console.log(opt, idx);
		return flow.then(()=>Slack.react(evt, nums[idx])).then(()=>timeout());
	}, Promise.resolve()).then(()=>evt);
};


// Every day around 3-6, get the activity of the day. filter for new legislation, and print it
// https://www.nationstates.net/page=activity/view=region.the_coolsville_commonwealth

// shuffle all users, then every few hours pick the next user in order and fetch their next issue
// Get flag url???

let memory = {};



const Send = {
	caughtUp : (user)=>{
		send(`${user} has no available issues`);
	},
	issue : (user, issue)=>{
		return send(issue.title)
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
	success : ()=>{
		send('Your decree has been sent!');
	},
	error : (err)=>{
		Slack.error(err);
		send('Something went wrong. Let scott know.');
	}
}


Slack.onMessage((msg)=>{
	if(msg.channel !== 'nation-states') return;
	Send.issue('scott', {
		id : 'temp',
		title : 'oh hello',
		options : [
			{ temp : 6},
			{ temp : 6}
		]
	})
	.catch(console.log);
});

Slack.onReact((evt)=>{
	if(!memory[evt.item.ts] || memory[evt.item.ts].user !== evt.user) return;
	const entry = memory[evt.item.ts];

	const idx = nums.findIndex((num)=>num==evt.reaction);

	if(idx == -1) return;
	NSAPI.respondToIssue(entry.user, entry.issueId, entry.options[idx].id)
		.then((res)=>{
			Send.success();
		})
		.catch(Send.error)
	delete memory[evt.item.ts];
});


const getIssue = (user)=>{
	NSAPI.fetchIssues(user)
		.then((issues)=>{
			if(issues.length == 0) return Send.caughtUp(user);

			Send.issue()
		})

}


