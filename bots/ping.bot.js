const Slack = require('../utils/pico-slack');
const request = require('request');
const isScott = (msg)=>msg.user == 'scoot' || msg.user == 'scott';

const urls = [
	'http://stolksdorf.com/ping',
	'https://stolksdorf.com/ping',
	'http://www.stolksdorf.com/ping',
	'https://www.stolksdorf.com/ping'
];


let lastCheck = {};
const check = async (url)=>{
	let res;
	try{
		await request(url);
		res = true;
	}catch(err){
		res = false;
	}

	if(lastCheck[url] !== res){
		lastCheck[url] = res;
		Slack.send('scott', `${url} is ${res?'up':'down'}.`);
		//Slack.send('scoot', `${url} is ${res?'up':'down'}.`);
	}
}

Slack.onMessage(async (msg)=>{
	if(!isScott(msg)) return;
	if(msg.text !== 'ping') return ;
	const ping = async (url)=>{
		try{
			const res = await request(url);
			Slack.send(msg.user, `${url}\nSuccess.`)
		}catch(err){
			Slack.send(msg.user, `${url}\n${err.toString()}`)
		}
	}

	urls.map(ping);
});


const MIN = 60 * 1000;
setInterval(()=>{
	urls.map(check);
}, 20 * MIN);