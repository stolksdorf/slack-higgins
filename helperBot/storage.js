var logbot = require('./logbot');
var redis = require("redis");
var client = redis.createClient(process.env.REDIS_URL);

var TEMP_STORAGE = {}


client.on("error", function(err){
	logbot.warn("Redis Storage Error", "Falling back to temporary storage instance.");
	client.end();

	//Fallback storage
	client = {
		get : function(key, cb){
			cb(null, TEMP_STORAGE[key]);
		},
		set : function(key, val, cb){
			TEMP_STORAGE[key] = val;
			cb();
		}
	}
});


module.exports = {
	get : function(key, cb){
		return client.get(key, function(err, res){
			if(!err) cb(JSON.parse(res));
		})
	},
	set : function(key, val, cb){
		return client.set(key, JSON.stringify(val), cb);
	},
}
