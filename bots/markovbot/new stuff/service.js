const Storage = require('./storage.js');
const Engine = require('./engine.js');

const MIN = 60 * 1000;



const generateMessage = async (user)=>{
	const mapping = await Storage.getMapping(user);
	const stats = await Storage.getStats(user);
	return {
		text        : Engine.generateMessage(mapping),
		msgCount    : stats[user].msgCount,
		letterCount : stats[user].letterCount,
	};
};

const encodeMessage = (user, message)=>{
	const fragments = Engine.generateFragments(message);
	Storage.cacheFragments(user, fragments);
	Storage.cacheStats(user, 1, message.length);
};

const backup = async ()=>{
	console.log('starting backup');
	return Storage.getStoredUsers().reduce((prom, user)=>{
		Slack.log(`backing up ${user}`)
		return prom
			.then(()=>{
				console.log('backing up', user);
				return Storage.backupUser(user)
			})
			.then(()=>console.log('done!'))
	}, Promise.resolve())
	.then(()=>{
		Slack.log('backing up stats')
		return Storage.backupStats();
	})
	.then(()=>console.log('finished!'));
};


const startTimedBackup = (timer = 10)=>{
	setTimeout(()=>{
		backup();
		startTimedBackup(timer * MIN);
	}, timer)
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