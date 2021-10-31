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


function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

const getComics = (arr, count=3)=>{
	let result = [];
	shuffle(Object.keys(arr)).map(idx=>{
		if(arr[idx].shared == false || arr[idx].shared == 'false'){
			result.push(idx)
		}
	})
	return result.slice(0,count);
}


Slack.onMessage(async (msg)=>{
	try{
		if(msg.text.startsWith('comic:')){
			const match = msg.text.match(/<(.+)\|.*>/);
			if(match){
				const link = match[1];
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
		}

		if(Slack.has(msg, 'test', 'comic')){
			SendWebcomics();
		}
	}catch(err){
		console.log(err)
	}
});


const SendWebcomics = async ()=>{
	try{
		let webcomics = await Gist.get(GistId).then(({webcomics})=>webcomics);
		const comics = getComics(webcomics, 3);

		if(comics.length === 0){
			return Slack.send(CHANNEL, 'Sorry guys, no comics this week. Remember to submit comics by DMing higgins with `comic: [link]`.')
		}

		await Slack.send(CHANNEL, `Time for Sunday Morning Comics!`);
		comics.map((idx)=>{
			webcomics[idx].shared = true;
			Slack.send(CHANNEL, `Submitted by ${webcomics[idx].user}: ${webcomics[idx].link}`);
		});
		await Gist.update(GistId, {webcomics});
	}catch(err){
		console.log(err)
	}
}



//Sunday morning at 10am
cron.scheduleJob(`0 10 * * 7`, SendWebcomics);
