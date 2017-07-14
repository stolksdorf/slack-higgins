const Slack = require('pico-slack');
const config = require('nconf');
const _ = require('lodash');

let files = [];
let msgId = false;

let storage = {};



const MAX_SIZE = 5;
const MAX_AGE = 60;

Slack.onMessage((msg)=>{
	if(!Slack.msgHas(msg.text, 'higgins', 'clean', 'house')) return;
	Slack.msg(msg.channel, '_Sure, give me a sec_');
	getAllFiles(msg.user_id)
		.then(({files, size})=>{
			storage[msg.user] = {
				files,
				size
			}
			return Slack.msg(msg.channel,
				`Alright ${msg.user}, I looked for your files larger than ${MAX_SIZE}mb and older than ${MAX_AGE} days. ` +
				`I found ${files.length} files, totaling ${size}mb. ${msg.user}, react with :boom: to let me know you want _your files_ removed.`)
				.then((res)=>{
					storage[msg.user].ts = res.message.ts;
				})
		})
		.catch((err)=>{
			Slack.log(err);
			Slack.msg(msg.channel, `I got all jacked up`);
		})
})

Slack.onReact((msg)=>{
	if(!storage[msg.user]) return;
	if(msg.item.ts == storage[msg.user].ts && msg.reaction == 'boom'){
		Slack.msg(msg.channel, '_Got it, This might take a while..._');
		Promise.all(_.map(storage[msg.user].files, (file)=>deleteFile(file)))
			.then(()=>{
				Slack.msg(msg.channel, `Whew, all done! ${storage[msg.user].files.length} deleted!`);
				delete storage[msg.user];
			});
	}
})

const deleteFile = (fileId)=>{
	return new Promise((resolve, reject)=>{
		Slack.api('files.delete', {token : config.get('command_token'), file:fileId})
			.then(()=>{
				setTimeout(()=>resolve(), 100);
			})
			.catch(()=>resolve())
	});
}

const MEGABYTE = 1000000;
const DAY = 1000 * 60 * 60 * 24;
const getAllFiles = (userID)=>{

	const getFiles = (page=1, result=[])=>{
		Slack.log(`loooking at page ${page}`);
		return Slack.api('files.list', {
				token : config.get('command_token'),
				page:page,
				user: userID,
				count:1000,
				ts_to : Math.floor((_.now() - MAX_AGE* DAY) / 1000)
			})
			.then((res)=>{
				result = _.concat(result, _.filter(res.files, (file)=>{
					return file.size > MAX_SIZE * MEGABYTE;
				}))
				if(res.paging.pages > page) return getFiles(page + 1, result);
				return result;
			})
	}
	return getFiles()
		.then((files)=>{
			return {
				files : _.map(files, (file)=>file.id),
				size : _.sumBy(files, (file)=>file.size) / MEGABYTE
			}
		})
}