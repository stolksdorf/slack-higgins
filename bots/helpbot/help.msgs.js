const Slack = require('pico-slack');
const config = require('./config.js');
const HelpBot = config.bot;

const getLink = (team)=>config.root + config.teams[team].source;

const SendTeam = async (trig, doc, text, reactions)=>{
	const sent = await Slack.sendAs(HelpBot.name, HelpBot.emoji, config.teams[doc.team].channel, text);
	if(reactions){
		Send.Context[sent.ts] = {trig, doc};
		await reactions.reduce((flow, reaction)=>flow.then(()=>Slack.react(sent, reaction)), Promise.resolve());
	}
};
const SendUser = async (trig, doc, text, reactions)=>{
	const sent = await Slack.sendAs(HelpBot.name, HelpBot.emoji, trig.channel, text);
	if(reactions){
		Send.Context[sent.ts] = {trig, doc};
		await reactions.reduce((flow, reaction)=>flow.then(()=>Slack.react(sent, reaction)), Promise.resolve());
	}
};



const Send = {
	Context : {},
	happy : async (trig, doc)=>{
		await SendTeam(trig, doc, `*${trig.user}* just found the _${doc.name}_ entry useful. Good work guys.`);
		await SendUser(trig, doc, `Glad I could help!`);
	},
	needsWork : async (trig, doc)=>{
		await SendTeam(trig, doc, `*${trig.user}* tried asking: \n> ${trig.text}\nI sent them info on *${doc.name}*, but they weren't happy with it. Can someone reach out to them and fix up the <${getLink(doc.team)}|docs>?.`);
		await SendUser(trig, doc, `Oof, sorry about that. I've notified a human and made a note of your feedback. Thanks for helping make me better :)`);
	},
	needsHelp : async (trig, team)=>{
		await SendTeam(trig, {team}, `*${trig.user}* tried asking: \n> ${trig.text} \n But I couldn't find anything related. Can someone reach out to them? And update the docs <${getLink(team)}|here>.`);
		await SendUser(trig, false, `I've given a human on ${config.teams[team].name} a heads up about your question and they'll be reaching out to you shortly.`);
	},

	multiple : async (trig, docs)=>{
		await SendUser(trig, docs, `I found multiple matches to your question. If any of them are a bad match please let the team know by reacting with :${config.emojis.fix}:`);
		await docs.reduce((flow, doc)=>flow.then(()=>Send.found(trig, doc)), Promise.resolve());
	},

	notFound : async (trig)=>{
		const teamText = Object.values(config.teams).map((team)=>`_:${team.emoji}: - ${team.name}_`).join('\n');
		await SendUser(trig, {},
			`Sorry, I couldn't find anything. If you'd like me to reach out to a human, react which team you think would help best with this.\n\n${teamText}`,
			Object.values(config.teams).map((team)=>team.emoji)
		);
	},

	found : async (trig, doc)=>{
		let reactions = [config.emojis.happy, config.emojis.fix];
		const text = `*${doc.name}* - _from ${config.teams[doc.team].name}_\n${doc.text}`;
		let reactionText = `_If this was helpful react with a :${config.emojis.happy}:._\n_If this wasn't accurate or didn't answer your question react with :${config.emojis.fix}:_`;
		if(doc.more){
			reactions.push(config.emojis.more);
			reactionText += `\n_To get more information, react with ${config.emojis.more}._`
		}
		await SendUser(trig, doc,
			`${text}\n\n${reactionText}`,
			reactions
		);
	},
	more : (trig, doc)=>{
		return doc.more;
	}
};

module.exports = Send;
