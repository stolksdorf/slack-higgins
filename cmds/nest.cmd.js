const _ = require('lodash');

const nest = require('unofficial-nest-api');
const NEST_CONFIG = JSON.parse(process.env.NEST_CONFIG || '{}');

module.exports = {
	url    : '/nest',
	handle : function(msg, info, reply, error){
		const targetTemp = Number(msg || 'none');
		const sender = info.user_name;

		//check for user
		if(!NEST_CONFIG[sender]){
			return error('Looks like you don\'t have a Nest connected with NestBot, contact :scott: with your username and password.');
		}
		const user = NEST_CONFIG[sender];

		nest.login(user.email, user.password, function (err, data) {
			if(err) throw err;

			nest.fetchStatus(function(data){
				const deviceId = _.keys(data.device)[0];
				const hasLeaf = data.device[deviceId].leaf;
				const currentTemp = data.shared[deviceId].current_temperature;

				let response = `${sender}, your home's current temperature is ${currentTemp}C. `;
				if(hasLeaf) response += 'You got dat leaf! ';
				if(!_.isNaN(targetTemp)){
					const cuteMsg = _.sample(['', '', '', '', '', ', so cozy!', ', just the way you like it.']);

					nest.setTemperature(deviceId, targetTemp);
					response += `I'm setting it to ${targetTemp}C${cuteMsg}`;
				}
				reply(response);
			});
		});
	}
};