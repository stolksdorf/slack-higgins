const _ = require('lodash');
const fs = require('fs');
const Slack = require('pico-slack');

const quotes = fs.readFileSync('./bots/departurebot/departure.quotes.txt', 'utf8').split('\n');

Slack.onEvent('member_left_channel', (data)=>{
	Slack.msg(data, `_${_.sample(quotes)}_`);
});
