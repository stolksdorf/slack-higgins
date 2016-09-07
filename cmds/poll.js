var _ = require('lodash');
var nums = [':one:',':two:',':three:',':four:',':five:',':six:',':seven:',':eight:',':nine:'];

module.exports = function(msg, info, reply, error){
	var parts = msg.split('?');
	var question = parts[0]
	var options = parts[1].split(',');

	reply('*' + question + '?*\n\n' +
		_.map(options, (opt, index)=>{
			return nums[index] + ' ' + _.trim(opt);
		}).join('\n')
	);
}
