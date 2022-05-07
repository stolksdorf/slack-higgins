const config = require('pico-conf');
const Slack = require('../utils/pico-slack').alias('haikubot', ':cherry_blossom:')
const syllable = require('syllable');
const Gist = require('pico-gist')(config.get('github_token'));
const GistId = 'a6ceae1ba9192e372a6682d214665b56';


const isURL = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const isEmoji = /(:[\w]+:)/g


const cleanSentence = (str)=>{
	str = str.replace(isEmoji, '')
	str = str.replace(isURL, 'null')
	return str;
}
const getSyllableCount = (str)=>syllable(cleanSentence(str));


const test = ()=>{
	const test = `> Me? Raspberry bush.
> Sweet, bright, and a wee bit wild
> Also, I'm a https://www.youtube.com/watch?v=xPSJtzvSxEY :dave_dancing: :raspberry:`

	console.log(test.split('\n').map(cleanSentence).map(syllable));
	console.log(syllable(`hey there <@U0VKSFTB6>`))
};



let stored = {};
const add = (sentence, channel)=>{
	if(!stored[channel]) stored[channel] = [];

	const syllableCount = getSyllableCount(sentence);
	const count = stored[channel].length;

	if(syllableCount == 7 && count == 1){
		stored[channel].push(sentence);
	}else if(syllableCount == 5 && count == 2){
		const res = stored[channel].concat(sentence);
		stored[channel] = [];
		return res;
	}else{
		stored[channel] = [];
	}

	if(syllableCount == 5 && stored[channel].length == 0){
		stored[channel].push(sentence);
	}
};



Slack.onMessage((msg)=>{
	if(msg.isDirect) return;

	const sentences = msg.text.split('\n');
	sentences.map((sentence)=>{
		if(!sentence) return;
		const haiku = add(sentence.trim(), msg.channel);
		if(haiku){
			Slack.send(msg.channel, haiku.map((line)=>`_${line}_`).join('\n'));
			Gist.append(GistId, {
				haikus : `\n\n\`[in #${msg.channel} on ${(new Date()).toLocaleDateString()} at ${(new Date()).toLocaleTimeString()}]\`\n`
					+ haiku.map((line)=>`> _${line}_`).join('\n>\n')
			})
		}
	});
});