const Markov = require('./markov.engine.js');
const MarkovDB = require('./markov.db.js');

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
		if(!Mappings[user]) Mappings[user] = await MarkovDB.getMapping(user);
		return Mappings[user];
	},
	encodeMessages: async (user, msgs)=>{
		console.log('encoding!', msgs);
		try {
			let mapping = await Messages.getMapping(user);
			Mappings[user] = Markov.updateMapping(cleanMsgs(msgs), mapping);
			MarkovDB.saveMapping(user + '1', Mappings[user]);
			MarkovDB.saveMapping(user + '2', Mappings[user]);
			MarkovDB.saveMapping(user + '3', Mappings[user]);
			MarkovDB.saveMapping(user + '4', Mappings[user]);
			MarkovDB.saveMapping(user + '5', Mappings[user]);
			MarkovDB.saveMapping(user + '6', Mappings[user]);
			MarkovDB.saveMapping(user + '7', Mappings[user]);
			MarkovDB.saveMapping(user + '8', Mappings[user]);
			MarkovDB.saveMapping(user + '9', Mappings[user]);
			MarkovDB.saveMapping(user, Mappings[user]);
		} catch (err) {
			console.error(`Encountered error while trying to encode messages.`, {user, msgs}, err)
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