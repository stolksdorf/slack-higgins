const Slack = require('pico-slack');

const request = require('superagent');
const config = require('pico-conf');


const memeTemplates = require('./popular_meme_templates.js');

const pluck = (arr)=>arr[Math.floor(Math.random()*arr.length)];


const getLastTwoMsgs = async (channelId)=>{
	return Slack.api('conversations.history', {
		channel : channelId,
		limit : 3
	}).then((res)=>{
		return res.messages.map((x=>x.text)).slice(1).reverse()
	})
}

const makeMeme = async (memeId, text0, text1)=>{
	return request.post('https://api.imgflip.com/caption_image')
		.set('Accept', 'application/json')
		.query({
			template_id : memeId,
			username : 'stolksdorf',
			password : config.get('memegen:imgflip_pwd'),
			text0, text1
		})
		.then(({body})=>body.data.url)
};

const getMemeId = (text)=>{
	//text = text.replace('memeit ', '');

	//memeTemplates.filter(())


	return pluck(Object.keys(memeTemplates));
}



Slack.onMessage((evt)=>{
	if(Slack.has(evt, 'memeit')){
		getLastTwoMsgs(evt.channel_id)
			.then(([msg1, msg2])=>{
				return makeMeme(getMemeId(), msg1, msg2)
			})
			.then((memeUrl)=>{
				Slack.alias('memebot', 'robot_face').send(evt.channel, memeUrl)
			})
			.catch((err)=>{
				Slack.send(evt.channel, 'Oops, something went wrong\n' + err)
			})
	}
});



