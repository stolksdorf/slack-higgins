const config = require('nconf');
const MarkovEngine = require('./markov.engine.js');

const mapping = MarkovEngine.updateMapping([
	'hello there',
	'hello champ'
], {totals: {'':3}, weights : {'':{g :3}}});

console.log(mapping);
const message = MarkovEngine.getMessage(mapping)
console.log(message);


// Logic: we don't have a bot's mapping in memory
// Pull mapping out of redis
// Fetch new messages
// Build new mapping with stored mapping
// Store into local and into redis


const SafeChannels = [
	'general',
].map((channel)=>`in:${channel}`).join(' ');

const fetchMessages = async (user)=>{
	const lastMsgTS = '1508284197'; //Pull from redis for user
	let query = `from:${username} ${SafeChannels}`;
	if(lastMsgTS) query += ` after:${(new Date(lastMsgTS * 1000)).toISOString().substring(0, 10)}`;

	console.log(query);

	const searchSlack = async (page=1)=>{
		console.log('Calling page', page);
		const res = await Slack.api('search.messages', {
			token : config.get('command_token'),
			sort  : 'timestamp',
			count : 100,
			page,
			query,
		});
		let msgs = res.messages.matches.reduce((acc, msg)=>{
			if(msg.text.indexOf('uploaded a file:') !== -1) return acc;  //Skip file upload messages
			msg.text = msg.text.replace(/(<h.+>)/gi, '').trim(); //Remove links from messages
			if(msg.text) acc.push(msg);
			return acc;
		}, []);

		if(res.messages.pagination.page < res.messages.pagination.page_count){
			return msgs.concat(await searchSlack(page+1));
		}
		return msgs;
	};
	const msgs = await searchSlack();

	return {
		lastTS : Math.floor(Number(msgs[0].ts)), //FIXME: Maybe grab last message for timestamp
		msgs   : msgs.map((msg)=>msg.text)
	};
};

