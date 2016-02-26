var Logbot = require('logbot');
var redis = require("redis");
var client = redis.createClient();

client.on("error", function(err){
	Logbot.error(err);
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
