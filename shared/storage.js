var Logbot = require('logbot');
var redis = require("redis");
var client = redis.createClient(process.env.REDIS_URL);

client.on("error", function(err){
	Logbot.error("Storage Error", err);
});


module.exports = {
	get : function(key, cb){
		return client.get(key, function(err, res){
			if(err) return Logbot.error(err);
			cb(JSON.parse(res));
		})
	},
	set : function(key, val, cb){
		return client.set(key, JSON.stringify(val), cb);
	},
}
