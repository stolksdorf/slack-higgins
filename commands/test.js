var Logbot = require('logbot');

module.exports = function(msg, info, reply){

	Logbot.log(info);

	reply('Just a test!');
}