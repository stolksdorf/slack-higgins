const _ = require('lodash');
const Slack = require('pico-slack');


const Guide = require('./backstory.js');

const getAttachment = (info, title)=>{
	const result = {
		fallback: Guide.People.description(info),
		color: {
			Hostile : 'danger',
			Friendly : 'good',
			Indifferent : ''
		}[info.relationship],
		author_name: title,
		title: `${info.name} ${info.familyName}`,
		text: `A ${info.gender} ${info.race} ${info.occupation}. ${info.status}.`,
		fields: [
			{
				title: 'Alignment',
				value: info.alignment,
				short: true
			},
			{
				title: 'Relationship',
				value: info.relationship,
				short: true
			}
		]
	};
	if(info.event){
		result.fields.push({
			title: 'Notable Life Event',
			value: info.event,
			short: false
		})
	}
	return result;
};

const sendFamily = (family)=>{
	const attachments = [
		getAttachment(family.mother, 'Mother'),
		getAttachment(family.father, 'Father')
	];
	_.each(family.siblings, (sibling)=>{
		const relation = (sibling.gender == 'Male' ? 'Brother' : 'Sister');
		attachments.push(getAttachment(sibling, `${sibling.birthOrder} ${relation}`))
	});


	return Slack.api('chat.postMessage', {
			channel    : 'dnd',
			text : `*Your Family*\nYou were born in ${family.birthplace} into a ${family.lifestyle} family. You were raised by ${family.raisedBy}, and your childhood home was a ${family.home}. What you remember about growing up: "_${family.memory}_"`,
			attachments: JSON.stringify(attachments)
		}).catch(()=>{})
};

const sendMessage = (msg, text='', attachments=[])=>{
	return Slack.api('chat.postMessage', {
		channel    : msg.channel,
		text,
		attachments: JSON.stringify(attachments)
	}).catch((err)=>Slack.error(err));
}

const sendNPC = (npc)=>{
	return Slack.api('chat.postMessage', {
		channel    : 'dnd',
		attachments: JSON.stringify([
			getAttachment(npc)
		])
	}).catch(()=>{})
}


Slack.onMessage((msg)=>{
	if(msg.channel != 'dnd') return;
	if(!Slack.msgHas(msg, ['higs', 'higgins', 'backstorybot', Slack.bot.id])) return;

	let race = _.find(Guide.Supplements.races, (race)=>Slack.msgHas(msg, race));
	let gender = _.find(['Female', 'Male'], (gender)=>Slack.msgHas(msg, gender));

	if(Slack.msgHas(msg, 'family')){
		const family = Guide.People.family(race);
		return sendFamily(family);
	}

	if(Slack.msgHas(msg, 'npc')){
		return sendNPC(Guide.npc(race, gender));
	}

	if(Slack.msgHas(msg, 'event')){
		return Slack.send(msg.channel, Guide.Life.event())
	}


})
