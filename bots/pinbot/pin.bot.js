const utils = require('slack-microbots/utils');
const PinModel = require('./pin.model.js').model;

const PIN_URL = 'https://slack-higgins.herokuapp.com/pins/';

module.exports = {
	name : 'pinbot',
	icon : ':pushpin:',
	events: ['message', 'pin_added'],
	channel : '*',
	handle : function(msg, info, Higgins){
		if(info.type == 'pin_added' && info.item.type == 'message'){
			const newPin = new PinModel({
				user      : info.user,
				text      : info.item.message.text,
				channel   : info.channel,
				permalink : info.item.message.permalink,
				ts        : info.item.created
			}).save((err, obj)=>{
				if(err) return;
				Higgins.reply(`Saved your pin! You can view it here ${PIN_URL}`);
			});
		}

		if(info.type == 'message' && utils.messageHas(msg, ['higgins', 'pinbot', 'higs'], ['where', 'link', 'url'])){
			Higgins.reply(`You can find all Coolsville pins here, ${PIN_URL}`);
		}
	}
}
