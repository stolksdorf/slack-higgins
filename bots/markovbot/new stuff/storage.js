const S3 = require('./s3.js');
const Engine = require('./engine.js');

let fragmentCache = {};
let mappingCache = {};

const fetchMapping = async (user)=>{
	console.log('fethcing', user);
	const mapping = await S3.fetch(user);
	mappingCache[user] = mapping;
	return mapping;
};

const getMapping = async (user)=>{
	if(mappingCache[user]) return mappingCache[user];
	return await fetchMapping(user);
};

const addFragments = (user, fragments)=>{
	if(mappingCache[user]){
		mappingCache[user] = Engine.extendMapping(mappingCache[user], fragments);
		return;
	}
	fragmentCache[user] = Engine.mergeFragments(fragmentCache[user], fragments);
};

const backupUser = async (user)=>{
	if(!fragmentCache[user] && !mappingCache[user]) return;

	/* If the user has existing fragments, add them to their mapping */
	if(fragmentCache[user]){
		let mapping = await getMapping(user);
		mappingCache[user] = Engine.extendMapping(mappingCache[user], fragmentCache[user]);
	}

	//Buffer.byteLength(string, encoding);

	await S3.upload(user, mappingCache[user]);
	delete fragmentCache[user];
	delete mappingCache[user];
};

module.exports = {
	getStoredUsers : ()=>{
		const users = [].concat(Object.keys(fragmentCache), Object.keys(mappingCache));
		return [...new Set(users)];
	},

	getMapping,
	addFragments,
	backupUser
}