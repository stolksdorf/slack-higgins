

/*
You can attempt to tag someone only if
- no one is it
- you are it

if you attempt to tag it will respond in channel and DM the person a notice
- they have 5-10min to reply with a dodge message (either dm or in channel)
- if they do the tag doesn't work
- if they don't, they become it (get a notification)

If the person who is it does not attempt to tag someone in X hrs, it resets to no one being it
*/


const Slack = require('../../utils/pico-slack').alias('tagbot', '');

const request = require('superagent');
const config = require('pico-conf');


let whoIsIt = null;


Slack.onMessage((msg)=>{

	if(Slack.has(msg, ['who', `who's`], 'it')){
		return Slack.send(msg.channel,
			whoIsIt
				? `${whoIsIt} is currently IT!`
				: `No one is currently IT. Go and tag someone!`
		)
	}


	if(Slack.has(msg, ['tag'])){
		const user = msg.text.replace('tag').trim();

	}


});