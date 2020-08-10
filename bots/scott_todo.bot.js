const Slack = require('pico-slack');
const config = require('pico-conf');
const S3 = require('../utils/s3.js');

const isScott = (msg)=>msg.user == 'scoot' || msg.user == 'scott';

const getTodo = async ()=>{
	return await S3.fetch(
		config.get('scott_todo_bot:bucket'),
		config.get('scott_todo_bot:name')
	);
};

const addItemTodo = async (item)=>{
	const todo = await getTodo();
	return await S3.upload(
		config.get('scott_todo_bot:bucket'),
		config.get('scott_todo_bot:name'),
		todo + `\n- ${item}`
	);
};

const msgTodo = async (user)=>{
	Slack.send(user, await getTodo());
}

Slack.onMessage(async (msg)=>{
	if(!isScott(msg)) return;
	try{
		if(msg.text === 'list' || msg.text === 'todo'){
			await msgTodo(msg.user);
			return
		}
		if(msg.text.startsWith('add ')){
			const item = msg.text.replace('add ', '');
			await addItemTodo(item);
			await await msgTodo(msg.user);
			return
		}
	}catch(err){
		console.log(err)
	}
});