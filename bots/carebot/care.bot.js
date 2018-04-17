const Slack = require('pico-slack');
const yaml = require('js-yaml');
const fs = require('fs');

const Care = {
	docsSource : 'https://prose.io/#stolksdorf/slack-higgins/edit/master/bots/carebot/care.docs.yaml',
	channel : 'care-test',
	reps : [
		'scott',
		'mark'
	]
};

const Docs = yaml.safeLoad(fs.readFileSync('./bots/carebot/care.docs.yaml', 'utf8'));
const CareSend = (channel, msg)=>Slack.sendAs('carebot', ':heart:', channel, msg);

let Memory = {};

const Send = {
	happy : (msg, doc)=>{
		CareSend(msg.channel, `:tada: Glad i could help!`);
		CareSend(Care.channel, `*${msg.user}* just found the _${doc.name}_ entry useful. Good work guys.`);
	},
	notFound : (msg)=>{
		CareSend(msg.channel, `Sorry, I couldn't find anything. I've given a care-human a heads up about your question and they'll be reaching out to you shortly.`);
		CareSend(Care.channel, `*${msg.user}* tried asking: \n> ${msg.text} \n But I couldn't find anything related. Can someone reach out to them? And possibly update the docs here: ${Care.docsSource}`);
	},
	notHappy : (msg, doc)=>{
		CareSend(msg.channel, `Oof, sorry about that. I've notified a care-human and made a note of your feedback. Thanks for helping make me better :)`);
		CareSend(Care.channel, `looks like *${msg.user}* tried asking: \n> ${msg.text}\nI sent them info on *${doc.name}*, but they weren't happy with it. Can someone reach out to them and fix up the docs? ${Care.docsSource}. Thxbb.`);
	},
	found : async (msg, doc)=>{
		let text = `*${doc.name}*\n${doc.text}`;
		text = `${text}\n\n_If this was helpful react with a :heart:._\n_If this wasn't accurate or didn't answer your question react with :no_entry:_`;
		const sent = await CareSend(msg.channel,text);
		await Slack.react(sent, 'heart');
		await Slack.react(sent, 'no_entry');
		Memory[sent.ts] = {
			msg,
			doc
		};
	}
};

Slack.onReact((msg)=>{
	const mem = Memory[msg.item.ts];
	if(mem){
		if(msg.reaction == 'heart') Send.happy(mem.msg, mem.doc);
		if(msg.reaction == 'no_entry') Send.notHappy(mem.msg, mem.doc);
	}
});

Slack.onMessage((msg)=>{
	const isCareRep = Care.reps.includes(msg.user);
	const isShortMessage = msg.text.split(' ').length<4;
	const isCareChannel = msg.channel == Care.channel;

	// console.log('isCareRep', isCareRep);
	// console.log('isShortMessage', isShortMessage);
	// console.log('isCareChannel', isCareChannel);

	if(msg.isDirect && isCareRep){
		const doc = Docs.find((doc)=>Slack.msgHas(msg.text, ...doc.tags));
		if(!doc){
			Send.notFound(msg);
		}else{
			Send.found(msg, doc);
		}
	}
})