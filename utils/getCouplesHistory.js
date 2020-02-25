const config = require('../config');
const fs = require('fs');
const datefns = require('date-fns');
const request = require('superagent');

const wait = async (n,val)=>new Promise((r)=>setTimeout(()=>r(val), n));
const channel = process.argv[2];


if(!channel) throw 'Must provide a channel id as arg';



const getDate = (ts)=>datefns.format(new Date(ts*1000), 'YYYY-MM-DD H:mm:ss')



const getUsers = async ()=>{
	return await request.get(`https://slack.com/api/users.list`)
		.query({
			token : config.get('command_token'),
		})
		.then((res)=>{
			return res.body.members.reduce((acc, foo)=>{
				acc[foo.id] = foo.name
				return acc;
			}, {})
		})
};

const getHistorySlice = async (channel, cursor)=>{

	return new Promise((resolve, reject)=>{
		request.get(`https://slack.com/api/conversations.history`)
			.query({ token : config.get('command_token'),
				channel,
				cursor,
				//limit : 3,
				limit : 200,
			 })
			.end((err, res)=>{
				if(err || (res.body && res.body.ok === false)) return reject(err || res.body.error);
				return resolve(res.body);
			});
	});
};

const getTXT = (msgs)=>msgs.map((entry)=>`[${entry.user} ${getDate(entry.ts)}]:${entry.text}`).join('\n');



const run = async ()=>{
	console.time('Finished!')
	const Users = await getUsers();

	let Peeps = new Set();

	let result = [];
	let cursor;
	let count = 0;

	const get = async (cursor)=>{
		console.log('fetching...', count);
		const res = await getHistorySlice(channel, cursor);

		result = res.messages.reduce((acc, msg)=>{
			if(msg.type !== 'message' || !msg.text) return acc;
			Peeps.add(Users[msg.user]);
			return [{
				user : Users[msg.user],
				ts   : msg.ts,
				text : msg.text
			}].concat(acc);
		}, []).concat(result)

		count++;

		//if(res.has_more && count <= 2){
		if(res.has_more){
			await wait(500);
			await get(res.response_metadata.next_cursor);
		}
	}


	await get();


	const filename = Array.from(Peeps).filter(x=>!!x).join('&');

	fs.writeFileSync(`C:/Users/scott/Desktop/slack_logs/${filename}.json`, JSON.stringify(result, null, '  '));
	fs.writeFileSync(`C:/Users/scott/Desktop/slack_logs/${filename}.txt`, getTXT(result));

	console.timeEnd('Finished!')
}

run();