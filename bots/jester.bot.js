const Slack = require('pico-slack');

const ohHai = (msg)=>{
	if(Slack.msgHas(msg, ['higgins', 'higgs', 'higgs boson', 'higgerino'], ['hi', 'hello', 'wut up', 'mmm', 'ye'])){
		Slack.send(msg, `Up yours ${msg.user}`);
	}
}

