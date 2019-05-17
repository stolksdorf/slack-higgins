const Storage = require('./markov.storage.js');
const Engine = require('./markov.engine.js');

//TODO: Remove when done testing
const Slack = require('pico-slack')

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

const backupCache = async ()=>{
	Slack.log('starting backup');
	if(Storage.getStoredUsers().length == 0){
		Slack.log('nothing to back up');
		return ;
	}

	return Storage.getStoredUsers().reduce((prom, user)=>{
		return prom
			.then(()=>{
				Slack.log('backing up', user);
				return Storage.backupUser(user)
			})
			.then(()=>Slack.log('done!'))
	}, Promise.resolve())
	.then(()=>{
		Slack.log('backing up stats')
		return Storage.backupStats();
	})
	.then(()=>Slack.log('finished!'));
};

module.exports = {
	generateMessage,
	encodeMessage,
	backupCache,
}