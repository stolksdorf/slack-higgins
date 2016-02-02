var _ = require('lodash');
var Logbot = require('logbot');

var nest = require('unofficial-nest-api');
var NEST_CONFIG = JSON.parse(process.env.NEST_CONFIG) || {};


module.exports = function(msg, info, reply){
	var targetTemp = Number(msg || 'none');
	var sender = info.user_name;

	//check for user
	if(!NEST_CONFIG[sender]){
		return reply({
			response_type : 'ephemeral',
			text : "Looks like you don't have a Nest connected with NestBot, contact :scott:"
		})
	}

	var user = NEST_CONFIG[sender];

	nest.login(user.email, user.password, function (err, data) {
		if(err){
			throw err
		}
		nest.fetchStatus(function(data){
			var deviceId = _.keys(data.device)[0];

			var hasLeaf = data.device[deviceId].leaf;
			var currentTemp = data.shared[deviceId].current_temperature;

			var res = "Your home's current temperature is " + currentTemp + "C. ";

			if(hasLeaf) res += "You got dat leaf! ";

			if(!_.isNaN(targetTemp)){
				nest.setTemperature(deviceId, targetTemp);
				res += "Setting it to " + targetTemp + "C.";
			}

			reply({
				text : res
			})
		});
	});
}