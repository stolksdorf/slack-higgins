var logbot = require('./logbot');
var redis = require("redis");
var client = redis.createClient(process.env.REDIS_URL);

var TEMP_STORAGE = {}


client.on("error", function(err){
	if(process.env.PRODUCTION) logbot.warn("Redis Storage Error", "Falling back to temporary storage instance.");
	client.end();

	console.log('REDIS ERROR: Falling back to node in-memory storage');

	//Fallback storage
	client = {
		get : function(key, cb){
			cb && cb(null, TEMP_STORAGE[key]);
		},
		set : function(key, val, cb){
			TEMP_STORAGE[key] = val;
			cb && cb();
		}
	}
});

module.exports = {
	get : function(key, cb){
		return client.get(key, function(err, res){
			if(!res) return cb();
			if(!err) return cb(JSON.parse(res));
		})
	},
	set : function(key, val, cb){
		return client.set(key, JSON.stringify(val), cb);
	},
}
