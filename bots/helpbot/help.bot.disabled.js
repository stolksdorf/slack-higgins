const Slack = require('pico-slack');
const yaml  = require('js-yaml');
const fs    = require('fs');

const config = require('./config.js');

const TeamDocs = Object.keys(config.teams).reduce((acc, teamName)=>{
	acc[teamName] = yaml.safeLoad(fs.readFileSync(`.${config.teams[teamName].source}`, 'utf8')).map((doc)=>{
		doc.team=teamName;
		return doc;
	});
	return acc;
}, {});

const HelpBot = config.bot;
const Send = require('./help.msgs.js');


const findDocs = (text)=>{
	return Object.values(TeamDocs).reduce((acc, docs)=>{
		return acc.concat(docs.filter((doc)=>Slack.msgHas(text, ...doc.tags)));
	}, []);
};


Slack.onReact((trig)=>{
	const cxt = Send.Context[trig.item.ts];
	if(!cxt) return;

	if(trig.reaction == config.emojis.happy) Send.happy(cxt.trig, cxt.doc);
	if(trig.reaction == config.emojis.fix)   Send.needsWork(cxt.trig, cxt.doc);
	if(trig.reaction == config.emojis.more)  Send.more(cxt.trig, cxt.doc);

	Object.keys(config.teams).map((teamId)=>{
		if(trig.reaction == config.teams[teamId].emoji) Send.needsHelp(cxt.trig, teamId);
	});
});

Slack.onMessage((trig)=>{
	const isShortMessage = trig.text.split(' ').length<4;

	const isTeamChannel = !!Object.values(config.teams).find((team)=>trig.channel == team.channel);
	const forHelpBot = Slack.msgHas(trig.text, HelpBot.name) || trig.isDirect;

	//Just for testing
	if(trig.user !== 'scott') return;

	if(forHelpBot && !isTeamChannel){
		const docs = findDocs(trig.text);
		if(docs.length == 0) Send.notFound(trig);
		if(docs.length == 1) Send.found(trig, docs[0]);
		if(docs.length > 1)  Send.multiple(trig, docs);
	}
})