const Slack = require('pico-slack');

const ohHai = (msg)=>{
	if(Slack.msgHas(msg, 'wadsworth', ['hi', 'hello', 'wut up', 'mmm', 'ye'])){
		Slack.send(msg, `Up yours ${msg.user}`);
	}
}

