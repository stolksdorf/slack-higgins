var utils = require('slack-helperbot/utils.js');
var _ = require('lodash');

var annoyingThings = [
	'nope. gross.',
	'too many toxins in that, sorry',
	'No way, do you even know how much gluten is in that?!',
	'That will completely ruin your cleanse',
	'Not natural enough.',
	"Only if it's free-range",
	"Only if it comes in a mason jar, then it's on diet",
	'totally not on diet, what are thinking?'
]

module.exports = {
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(utils.messageHas(msg, ['paleo', 'on diet', 'eat'], ['can', 'on'])){
			Higgins.reply(_.sample(annoyingThings))
		}
	}
}
