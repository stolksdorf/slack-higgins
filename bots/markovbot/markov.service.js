const redis = require('pico-redis')('markov');
const Markov = require('./markov.engine.js');

const MIN = 60 * 1000;
const DEBOUNCE = 0.1 * MIN;

let Mappings = {};
let msgCache = {}, timers = {};

const cleanMsgs = (msgs)=>{
	return msgs.reduce((acc, msg)=>{
		if(msg.indexOf('uploaded a file:') !== -1) return acc;  //Skip file upload messages
		msg = msg.replace(/(<h.+>)/gi, '').trim(); //Remove links from messages
		if(msg) acc.push(msg);
		return acc;
	}, []);
};

const Messages = {
	getMapping: async (user)=>{
		if(!Mappings[user]) Mappings[user] = await redis.get(user);
		return Mappings[user];
	},
	encodeMessages: async (user, msgs)=>{
		console.log('encoding!', msgs);
		let mapping = await Messages.getMapping(user) || {};
		Mappings[user] = Markov.updateMapping(cleanMsgs(msgs), mapping);
		await redis.set(user, Mappings[user]);
	},
	addMessage: (user, msg)=>{
		if(timers[user]) clearTimeout(timers[user]);
		msgCache[user] = msgCache[user] || [];
		msgCache[user].push(msg);
		timers[user] = setTimeout(()=>{
			Messages.encodeMessages(user, msgCache[user]);
			msgCache[user] = [];
		}, DEBOUNCE);
	},
	getNewMessage: async (user)=>{
		let mapping = await Messages.getMapping(user);
		if(!mapping) return false;
		return {
			letters : mapping.letters,
			msgs    : mapping.msgs,
			text    : await Markov.genMessage(mapping),
		};
	},
};
module.exports = Messages;