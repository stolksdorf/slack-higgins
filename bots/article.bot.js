const Slack = require('pico-slack');
const request = require('superagent');
const config = require('pico-conf');

const SMMRY_API_KEY = config.get('smmry:api_key');

const Gist = require('pico-gist')(config.get('github_token'));
const GistId = 'e7cb2ee49d7c2cadd12ced85bb4dc994';

const TriggerEmoji = 'memo';
const Channels = new Set(['provoking-thoughts', 'politics-and-news']);

const cleanUrl = (url)=>url.replace('<','').replace('>','').split('|')[0]

const getUrls = (text)=>{
	const regexURL = /<(http[^>]*)>/g
	return [...text.matchAll(regexURL)].map(x=>{
		return cleanUrl(x[1])
	});
};

const getSummary = async (url)=>{
	url = cleanUrl(url)

	try{
		const res = await request.get(`https://api.smmry.com`)
			.query({
				SM_KEYWORD_COUNT : 5,
				SM_API_KEY       : SMMRY_API_KEY,
				SM_URL           : url,
			});

		Slack.log('smmry requests remaining: ', res.body.sm_api_limitation);
		return {
			title    : res.body.sm_api_title,
			content  : res.body.sm_api_content,
			keywords : res.body.sm_api_keyword_array,
			redcued  : res.body.sm_api_content_reduced,
			url
		}
	}catch(err){
		err = (err.response && err.response.body.sm_api_message) || err;
		throw err;
	}
};

const createMessage = (summary, msg)=>{
	let top = '', bottom='';
	if(msg) top =`_${msg.user} shared this in #${msg.channel} on ${(new Date()).toLocaleString()}_\n\n`;

	return `${top}- *Title*: ${summary.title || `[Could Not Extract]`}
- *Keywords*: ${summary.keywords.join(', ')}
- *url*: ${summary.url}

*Summary*: ${summary.content}`;
};

const saveToGist = async (msg)=>{
	await Gist.append(GistId, { articles : msg + '\n\n---\n\n' });
};


let Cache = {};

Slack.onMessage(async (msg)=>{
	if(msg.text.startsWith('article:')){
		const url = msg.text.replace('article:', '').trim();
		try{
			const summary = await getSummary(url);
			const reply = createMessage(summary, msg);

			Slack.send(msg.channel, reply
				+ `\n\n_View the other summarized articles <https://gist.github.com/stolksdorf/${GistId}|here.>_`);

			saveToGist(reply);
		}catch(err){
			return Slack.send(msg.channel, `Sorry I could not summarize that URL: ${err.toLowerCase()}`);
		}
	}

	if(Channels.has(msg.channel)){
		const urls = getUrls(msg.text);
		if(urls.length!==0){
			Slack.react(msg, TriggerEmoji);
			Cache[msg.ts] = {
				user    : msg.user,
				channel : msg.channel,
				urls
			};
		}
	}


})

Slack.onReact((evt)=>{
	if(evt.reaction !== TriggerEmoji || !Cache[evt.item.ts]) return;
	Cache[evt.item.ts].urls.map(async (url)=>{
		try{
			const summary = await getSummary(url);
			const reply = createMessage(summary, Cache[evt.item.ts]);

			Slack.thread(evt.item, reply
				+ `\n\n_View the other summarized articles <https://gist.github.com/stolksdorf/${GistId}|here.>_`);

			saveToGist(reply);
		}catch(err){
			return Slack.thread(evt.item, `Sorry I could not summarize that URL: ${err.toLowerCase()}`);
		}
	});
	delete Cache[evt.item.ts];
})