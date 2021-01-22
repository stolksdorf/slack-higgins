const Slack = require('pico-slack');
const request = require('superagent');
const config = require('pico-conf');


const Gist = require('pico-gist')(config.get('github_token'));
const GistId = '';

const SMMRY_API_KEY = config.get('smmry:api_key');


//https://www.youtube.com/watch?v=snHKEpCv0Hk


const execAll = (rgx, str)=>{let m,r=[]; while (m=rgx.exec(str)){r.push(m[1]);}; return r;};
const getUrls = (text)=>{
	const regexURL = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
	return execAll(regexURL, text)
		.filter((url)=>true) //Filter out common urls
};

const getSummary = async (url)=>{
	try{
		const res = await request.get(`https://api.smmry.com`)
			.query({
				//SM_LENGTH        : 7,
				SM_KEYWORD_COUNT : 3,
				SM_API_KEY       : SMMRY_API_KEY,
				SM_URL           : url,
			});

		console.log(res.body.sm_api_limitation);
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

		//Slack.error(err);
		console.log(err);
		return false;
	}
};

const createMessage = (summary, msg)=>{
	let top = '';
	if(msg) top =`_${msg.user} shared this in #${msg.channel} on ${(new Date()).toLocaleString()}\n\n`

	return `${top}*Title*: ${summary.title}
		*Keywords*: ${summary.keywords.join(', ')}
		*url*: ${summary.url}

		${summary.content}`;
};

const saveToGist = (msg)=>{

}


//getSummary('https://www.youtube.com/watch?v=snHKEpCv0Hk')


// console.clear()

// getSummary(`https://emergencemagazine.org/story/the-serviceberry`)
// 	.then((res)=>{
// 		console.log('yo')
// 		console.log(res)
// 	})
// 	.catch((err)=>{
// 		console.log(err)
// 	})

//const addSummaryToThread = (msg, )


Slack.onMessage(async (msg)=>{

	if(msg.text.startsWith('article:')){
		const url = msg.text.replace('article:', '').trim();

		try{
			const summary = await getSummary(url, msg);

			const reply = createMessage(summary, msg);
			Slack.send(msg.channel, reply);
			saveToGist(reply);
		}catch(err){
			return Slack.send(msg.channel, `Sorry I could not summarize that URL: ${err}`);
		}
	}


})


// If in special channel
	// If msg has an url, react

// If starts with 'article:'
	// cut out url - run function

// if someone reacts with "writing"
  // Look at root message and extract url

/*
function


*/

