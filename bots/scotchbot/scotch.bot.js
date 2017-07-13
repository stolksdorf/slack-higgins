const _ = require('lodash');
const Slack = require('pico-slack');

const ScotchAPI = require('./scotch.api.js');
const Formatter = require('./scotch.formatter.js');

Slack.onMessage((msg)=>{
	//if(!Slack.msgHas(msg.text, 'scotchbot')) return;


//	const result = Formatter.info(_.sample(ScotchAPI.list))


	let result = ScotchAPI.find(msg.text)

	if(!result){
		result = "can not find";
	}else{
		result = Formatter.info(result);
	}






	Slack.msgAs('scotchbot', ':wine_glass:', msg.channel, result);
});





const result = ScotchAPI.find('junk')

console.log(result);




/* User Stories */
/*
- generally conversationalif no match
- Ask it for help,

- Recommend a scotch,
	- price, cheap, expensive
	- based on your collection?
	- name a soctch a similar scotch
	-

- info abut a scotch
- loosey goosey scotch name parsing

- Maintain a scotch collection,
	- redis
	- list, add, and remove
	-


*/