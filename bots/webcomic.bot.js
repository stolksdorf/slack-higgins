const Slack = require('pico-slack');
const config = require('pico-conf');
const cron = require('node-schedule');

const Gist = require('pico-gist')(config.get('github_token'));
const GistId = 'efb76b6399f29aba75642ff70464570e';

const CHANNEL = 'wobbly-web-comics';

const sample = (arr, count=1, r=new Set())=>{
	r.add(Math.floor(arr.length*Math.random()));
	return (r.size == count || r.size == arr.length) ? Array.from(r) : sample(arr, count, r);
};


Slack.onMessage(async (msg)=>{
	try{
		if(msg.isDirect && msg.text.startsWith('comic:')){
			const link = msg.text.split('comic:')[1].trim().replace('<', '').replace('>', '');

			await Gist.append(GistId, {
				webcomics : [{
					date: (new Date()).toISOString(),
					link,
					user : msg.user,
					shared : false
				}]
			})
			Slack.send(msg.channel, 'Webcomic saved!');
		}

		if(Slack.has(msg, ['test', 'comic'])){
			SendWebcomics();

		}
	}catch(err){
		console.log(err)
	}
});


const SendWebcomics = async ()=>{
	try{
		let webcomics = await Gist.get(GistId).then(({webcomics})=>webcomics);
		const notShared = webcomics.filter(({shared})=>!shared || shared==='false');

		if(notShared.length === 0){
			return Slack.send(CHANNEL, 'Sorry guys, no comics this week. Remember to submit comics by DMing higgins with `comic: [link]`.')
		}

		const list = sample(notShared, 1);
		await Slack.send(CHANNEL, `Time for Sunday Morning Comics!`);
		list.map((idx)=>{
			webcomics[idx].shared = true;
			Slack.send(CHANNEL, `Submitted by ${webcomics[idx].user}: ${webcomics[idx].link}`);
		});
		await Gist.update(GistId, {webcomics});
	}catch(err){
		console.log(err)
	}
}



//Sunday morning at 10am
cron.scheduleJob(`0 10 * * * 7`, SendWebcomics);
