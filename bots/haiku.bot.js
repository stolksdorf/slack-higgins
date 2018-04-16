const Slack = require('pico-slack');
const syllable = require('syllable');

const getSentences = (str)=>str.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);

let stored = {};
const add = (sentence, channel)=>{
	if(!stored[channel]) stored[channel] = [];

	const syl = syllable(sentence);
	const count = stored[channel].length;

	if(syl == 7 && count == 1){
		stored[channel].push(sentence);
	}else if(syl == 5 && count == 2){
		const res = stored[channel].concat(sentence);
		stored[channel] = [];
		return res;
	}else{
		stored[channel] = [];
	}

	if(syl == 5 && stored[channel].length == 0){
		stored[channel].push(sentence);
	}
};

Slack.onMessage((msg)=>{
	const sentences = msg.text.split('\n').map(getSentences).reduce((acc, t)=>acc.concat(t), []);
	sentences.map((sentence)=>{
		if(!sentence) return;
		const haiku = add(sentence.trim(), msg.channel);
		if(haiku){
			Slack.sendAs('haikubot', ':cherry_blossom:', msg.channel, haiku.map((line)=>`_${line}_`).join('\n'));
		}
	});
})