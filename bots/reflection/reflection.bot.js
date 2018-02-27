const _ = require('lodash');
const Slack = require('pico-slack');
const cron = require('node-schedule');
const fs = require('fs');
const MINS = 60 * 1000;

const MorningMsgs = fs.readFileSync(`${__dirname}/morning.msgs.txt`, 'utf8').split('\n');
const ReflectionMsgs = fs.readFileSync(`${__dirname}/reflection.msgs.txt`, 'utf8').split('\n');

const peeps = [
	'scott',
	'katie',
	'rebabybay',
	'meggeroni'
];

const send = (target, msg)=>Slack.sendAs('reflectionbot', ':seedling:', target, msg);

const sendMorningMessage = ()=>{
	peeps.map((peep)=>{
		send(peep, _.sample(MorningMsgs));
	});
};

const sendReflectionMessage = ()=>{
	_.sampleSize(peeps, Math.ceil(peeps.length * 0.8)).map((peep)=>{
		setTimeout(()=>{
			send(peep, _.sample(ReflectionMsgs));
		}, _.random(0, 100 * mins));
	})
}


cron.scheduleJob('0 9 * * 1-5', sendMorningMessage);
cron.scheduleJob('0 15 * * 1-5', sendReflectionMessage);
