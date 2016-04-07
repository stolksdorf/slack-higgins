var slack = require('./slack.api.js');




var bot = slack("xoxb-29672537380-jYlw4NxlV6z4X1kyAPohVZey");

bot.init(function(){
	bot.reply('C0VL2BUUX', 'hey there!');
	bot.reply('D0VKSFTBN', 'direct message');

});

console.log('ready');