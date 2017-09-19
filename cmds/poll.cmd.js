const _ = require('lodash');
const nums = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'];

module.exports = {
	url    : '/poll',
	handle : function(msg, info, reply, error){
		const parts = msg.split('?');
		const question = parts[0];
		const options = parts[1].split(',');

		reply(`*${question}?*\n\n${
			_.map(options, (opt, index)=>{
				return `${nums[index]} ${_.trim(opt)}`;
			}).join('\n')}`
		);
	}
};