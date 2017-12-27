const _ = require('lodash');
const Slack = require('pico-slack');
const Guide = require('./backstory.js');

console.log(Slack);

const makePeep = (info, title)=>{
	const result = {
		fallback: Guide.description(info),
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
		makePeep(family.mother, 'Mother'),
		makePeep(family.father, 'Father')
	];
	_.each(family.siblings, (sibling)=>{
		const relation = (sibling.gender == 'Male' ? 'Brother' : 'Sister');
		attachments.push(makePeep(sibling, `${sibling.birthOrder} ${relation}`))
	});


	return Slack.api('chat.postMessage', {
			channel    : 'dnd',
			text : `*Your Family*\nYou were born in ${family.birthplace} into a ${family.lifestyle} family. You were raised by ${family.raisedBy}, and your childhood home was a ${family.home}. What you remember about growing up: "_${family.memory}_"`,
			attachments: JSON.stringify(attachments)
		}).catch(()=>{})
};

const sendNPC = (npc)=>{
	return Slack.api('chat.postMessage', {
		channel    : 'dnd',
		attachments: JSON.stringify([
			makePeep(npc)
		])
	}).catch(()=>{})
}


Slack.onMessage((msg)=>{
	if(msg.channel != 'dnd') return;
	if(!Slack.msgHas(msg, ['higs', 'higgins', 'backstorybot', Slack.bot.id])) return;

	let race = _.find(Guide.races, (race)=>Slack.msgHas(msg, race));
	let gender = _.find(['Female', 'Male'], (gender)=>Slack.msgHas(msg, gender));

	if(Slack.msgHas(msg, 'family')){
		const family = Guide.family(race);
		return sendFamily(family);
	}

	if(Slack.msgHas(msg, 'npc')){
		return sendNPC(Guide.npc(race, gender));
	}


})