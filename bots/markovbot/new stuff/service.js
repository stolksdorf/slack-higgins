const Storage = require('./storage.js');
const Engine = require('./engine.js');

const MIN = 60;

const generateMessage = async (user)=>{
	const mapping = await Storage.getMapping(user);
	return Engine.generateMessage(mapping);
};

const encodeMessage = (user, message)=>{
	const fragments = Engine.generateFragments(message);
	Storage.addFragments(user, fragments);
};

const backup = async ()=>{
	const users = Storage.getStoredUsers();
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
}

module.exports = {
	generateMessage,
	encodeMessage,
	backup,
	startTimedBackup
}