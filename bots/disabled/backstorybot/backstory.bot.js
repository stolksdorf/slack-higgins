const _ = require('lodash');
const Slack = require('pico-slack');

const Guide = require('./backstory.js');


const makePersonAttachment = (info, title)=>{
	const result = {
		mrkdwn_in : ['text'],
		fallback  : Guide.People.description(info),
		color     : {
			Hostile     : 'danger',
			Friendly    : 'good',
			Indifferent : '#333'
		}[info.relationship],
		author_name : title,
		title       : `${info.name} ${info.familyName}`,
		text        : `A ${info.gender} ${info.race} ${info.occupation}. ${info.status}.`,
		fields      : [
			{
				title : 'Alignment',
				value : info.alignment,
				short : true
			},
			{
				title : 'Relationship',
				value : info.relationship,
				short : true
			}
		]
	};
	if(info.event){
		result.fields.push({
			title : 'Notable Life Event',
			value : info.event,
			short : false
		});
	}
	return result;
};

const getFamily = (family)=>{
	const attachments = [
		{
			color     : '#f1c40f',
			mrkdwn_in : ['text'],
			title     : 'Your Family',
			text      : `You were born in ${family.birthplace} into a ${family.lifestyle} family. ` +
					`You were raised by ${family.raisedBy}, and your childhood home was a ${family.home}. ` +
					`What you remember about growing up: _"${family.memory}"_`
		},
		makePersonAttachment(family.mother, 'Mother'),
		makePersonAttachment(family.father, 'Father')
	];
	_.each(family.siblings, (sibling)=>{
		const relation = (sibling.gender == 'Male' ? 'Brother' : 'Sister');
		attachments.push(makePersonAttachment(sibling, `${sibling.birthOrder} ${relation}`));
	});

	return attachments;
};

const getNPC = (race, gender)=>{
	return [makePersonAttachment(Guide.npc(race, gender))];
};

const getEvent = ()=>{
	return {text: Guide.Life.event()};
};

const getCharacter = (race, gender, _cls, bg)=>{
	let results = [];
	const char = Guide.character({race, gender, class: _cls, bg});

	results.push({
		color       : '#1abc9c',
		author_name : `${char.name} ${char.familyName}`,
		text        : `A ${char.gender} ${char.race} ${char.background.name} ${char.class.name}`,
		fields      : [
			{
				title : 'Age',
				value : char.age,
				short : true
			},
			{
				title : 'Alignment',
				value : char.alignment,
				short : true
			},
			{
				title : 'Notable Life Events',
				value : char.events.join ('\n\n')
			}
		]
	});

	const cls = char.class;
	results.push({
		color     : '#9b59b6',
		mrkdwn_in : ['text'],
		title     : `${_.capitalize(cls.name)} - ${cls.subclass}`,
		text      : `${cls.origin}\n${
			_.map(cls.details, (text, tag)=>`*Your ${_.capitalize(tag)}*: ${text}`).join('\n')}`,
	});

	const background = char.background;
	results.push({
		color     : '#e67e22',
		mrkdwn_in : ['text'],
		title     : `${_.capitalize(background.name)} background`,
		text      : `${background.origin}\n${
			_.map(background.details, (text, tag)=>`*${_.capitalize(tag)}*: ${text}`).join('\n')}\n` +
			`*Traits*: ${background.traits.join('\n')}\n` +
			`*Ideal*: ${background.ideal}\n` +
			`*Bond*: ${background.bond}\n` +
			`*Flaw*: ${background.flaw}`,
	});
	results = results.concat(getFamily(char.family));
	return results;
};


// const char = getCharacter();
// Slack.api('chat.postMessage', {
// 	channel    : 'dnd',
// 	text : '',
// 	attachments: JSON.stringify(char)
// })



Slack.onMessage((msg)=>{
	if(msg.channel !== 'dnd') return;
	if(!Slack.msgHas(msg, ['higs', 'higgins', 'backstorybot', Slack.bot.id])) return;

	const race   = _.find(Guide.Supplement.races, (race)=>Slack.msgHas(msg, race));
	const gender = _.find(['Female', 'Male'], (gender)=>Slack.msgHas(msg, gender));
	const cls    = _.find(Guide.Class.list(), (cls)=>Slack.msgHas(msg, cls));
	const bg     = _.find(Guide.Background.list(), (bg)=>Slack.msgHas(msg, bg));

	console.log({race, gender, cls, bg});

	const send = (text='', attachments=[])=>{
		return Slack.api('chat.postMessage', {
			channel     : msg.channel,
			text,
			attachments : JSON.stringify(attachments),
		}).catch((err)=>Slack.error(err));
	};


	if(Slack.msgHas(msg, 'family')){
		console.log('here');
		const family = Guide.People.family(race);
		return send('', getFamily(family));
	}

	if(Slack.msgHas(msg, 'npc')){
		return send('', getNPC(race, gender));
	}

	if(Slack.msgHas(msg, 'event')){
		return Slack.send(msg.channel, Guide.Life.event());
	}
	if(Slack.msgHas(msg, 'character')){
		return send('', getCharacter(race, gender, cls, bg));
	}


});
