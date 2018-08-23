const Markov = require('./markov.engine.js');
const MarkovDB = require('./markov.db.js');

const MIN = 60 * 1000;
const DEBOUNCE = 0.1 * MIN;

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
	encodeMessages: async (user, msgs)=>{
		if (!user) console.log('encoding!', user, msgs);
		try {
			let mapping = await MarkovDB.getMapping(user);
			mapping = Markov.updateMapping(cleanMsgs(msgs), mapping);
			MarkovDB.saveMapping(user, mapping);
		} catch (err) {
			console.error(`[MarkovService]: Encountered error while encoding messages.`, {user, msgs}, err.message, err);
		}
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
		let mapping = await MarkovDB.getMapping(user);
		return {
			letters : mapping.letters,
			msgs    : mapping.msgs,
			text    : await Markov.genMessage(mapping),
		};
	},
};
module.exports = Messages;