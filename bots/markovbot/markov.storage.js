const S3 = require('./s3.js');
const Engine = require('./markov.engine.js');

const map    = (obj,fn)=>Object.keys(obj).map((key)=>fn(obj[key],key));
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);

let fragmentCache = {};
let mappingCache = {};


let tempStats={};
let statCache;
const fetchStats = async ()=>{
	try{
		return JSON.parse(await S3.fetch('stats.json'));
	}catch(err){
		return {};
	}
};
const getStats = async ()=>{
	if(statCache) return statCache;
	statCache = await fetchStats();
	return statCache;
};
const cacheStats = (user, msgCount=0, letterCount=0)=>{
	tempStats[user] = tempStats[user] || {msgCount:0, letterCount:0};
	tempStats[user].msgCount += msgCount;
	tempStats[user].letterCount += letterCount;

	console.log(fragmentCache);
	console.log(tempStats);
};
const backupStats = async ()=>{
	let stats = await getStats();
	map(tempStats, (stat, user)=>{
		stats[user] = stats[user] || {msgCount:0, letterCount:0};
		stats[user].msgCount += stat.msgCount;
		stats[user].letterCount += stat.letterCount;
	})
	await S3.upload('stats.json', JSON.stringify(stats));
	tempStats={};
	statCache=false;
}



const fetchMapping = async (user)=>{
	console.log('fetching', user);
	const mapping = await S3.fetch(`${user}.map`);
	mappingCache[user] = mapping;
	return mapping;
};

const getMapping = async (user)=>{
	if(mappingCache[user]) return mappingCache[user];
	return await fetchMapping(user);
};

const cacheFragments = (user, fragments)=>{
	fragmentCache[user] = Engine.mergeFragments(fragmentCache[user], fragments);
};

const backupUser = async (user)=>{
	if(!fragmentCache[user]) return;
	let mapping = await getMapping(user);
	mappingCache[user] = Engine.extendMapping(mapping, fragmentCache[user]);

	await S3.upload(`${user}.map`, mappingCache[user]);
	delete fragmentCache[user];
	delete mappingCache[user];
};

module.exports = {
	getStoredUsers : ()=>Object.keys(fragmentCache)||[],
	getStats,
	getMapping,
	cacheFragments,
	cacheStats,
	backupStats,
	backupUser
}