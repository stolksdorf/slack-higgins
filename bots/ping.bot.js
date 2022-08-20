const Slack = require('../utils/pico-slack');
const request = require('superagent');
const isScott = (msg)=>msg.user == 'scoot' || msg.user == 'scott';

const urls = [
	'http://stolksdorf.com/ping',
	'https://stolksdorf.com/ping',
	'http://www.stolksdorf.com/ping',
	'https://www.stolksdorf.com/ping',
	'https://www.stolksdorf.com/does_not_exist'
];


let lastCheck = {};
urls.map(url=>lastCheck[url] = true);


const checkURL = async (url)=>{
	try{
		await request.get(url).timeout({response: 1000}).send();
		return true;
	}catch(err){
		return false;
	}
};

const checkURLs = async()=>{
	return Promise.all(urls.map(url=>checkURL(url)))
		.then((res)=>res.reduce((acc, x, idx)=>{
			acc[urls[idx]] = x;
			return acc;
		}, {}));
};


const check = async ()=>{
	Object.entries(await checkURLs()).map(([url, status])=>{
		if(lastCheck[url] !== status){
			Slack.send('scott', `${url} is ${status?'up':'down'}`)
		}
		lastCheck[url] = status;
	})
};



const init = ()=>{
	Slack.onMessage(async (msg)=>{
		console.log('here1')
		if(!isScott(msg)) return;
		console.log('here2')
		if(msg.text !== 'ping') return;
		console.log('here3')
		Object.entries(await checkURLs()).map(([url, status])=>{
			Slack.send('scott', `${url} is ${status?'up':'down'}`);
		})
	});

	const MIN = 60 * 1000;
	setInterval(()=>{
		check()
	}, 20 * MIN);
};

init();

