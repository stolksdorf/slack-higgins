const Storage = require('./storage.js');
const Engine = require('./engine.js');


const formatNumber = (num)=>num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

const MIN = 60 * 1000;

const generateMessage = async (user)=>{
	const mapping = await Storage.getMapping(user);
	return Engine.generateMessage(mapping);
};

const encodeMessage = (user, message)=>{
	const fragments = Engine.generateFragments(message);
	Storage.addFragments(user, fragments);
};

const backup = async ()=>{
	const users = Storage.getStoredUsers() || [];
	return users.reduce((prom, user)=>{
		return prom
			.then(()=>{
				console.log('backing up', user);
				return Storage.backupUser(user)
			})
			.then(()=>console.log('done!'))
	}, Promise.resolve());
};

const startTimedBackup = (timer = 10*MIN)=>{
	setTimeout(()=>{
		backup();
		startTimedBackup(timer);
	},timer)
};


// const generateFormattedMessage = async (user)=>{
// 	const text = await generateMessage(user);
// 	const info = await Storage.getInfo(user);

// 	return {
// 		text,
// 		msgCount : info.msgCount,
// 		letterCount : info.letterCount,
// 	};
// }

module.exports = {
	generateMessage,
	encodeMessage,
	backup,
	startTimedBackup,

	migrate : require('./migration.js')
}