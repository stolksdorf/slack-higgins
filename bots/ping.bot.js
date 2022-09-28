const Slack = require('../utils/pico-slack');
const request = require('superagent');
const isScott = (msg)=>msg.user == 'scoot' || msg.user == 'scott';

const urls = [
	'http://stolksdorf.com/ping',
	'https://stolksdorf.com/ping',
	'http://www.stolksdorf.com/ping',
	'https://www.stolksdorf.com/ping'
];


let lastCheck = {};
urls.map(url=>lastCheck[url] = true);


const loop = async (func)=>{
	let timeout = await func();
	setTimeout(async ()=>{
		loop(func);
	}, timeout);
};


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



const MIN = 60 * 1000;
// const check = async ()=>{
// 	let allGood = true;

// 	Object.entries(await checkURLs()).map(([url, status])=>{
// 		if(lastCheck[url] !== status){
// 			Slack.send('scott', `${url} is ${status?'up':'down'}`);
// 		}
// 		lastCheck[url] = status;
// 		if(!status) allGood = false;
// 	});


// 	return allGood ? 20 * MIN : 0.1 * MIN;
// };



const init = ()=>{
	Slack.onMessage(async (msg)=>{
		if(!isScott(msg)) return;
		if(msg.text !== 'ping') return;
		Object.entries(await checkURLs()).map(([url, status])=>{
			Slack.send('scott', `${url} is ${status?'up':'down'}`);
		})
	});
	//loop(check);
};

init();

