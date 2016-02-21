var _ = require('lodash');
var Logbot = require('logbot');

var nums = [':one:',':two:',':three:',':four:',':five:',':six:',':seven:',':eight:',':nine:'];


module.exports = function(msg, info, reply, error){
	var parts = msg.split('?');
	var question = parts[0]
	var options = parts[1].split(',');

	if(!options.length){
		return error("You didn't provide any options!");
	}

	reply('*' + question + '*\n\n' +
		_.map(options, (opt, index)=>{
			return nums[index] + ' ' + _.trim(opt);
		}).join('\n')
	);
}