var _ = require('lodash');
var utils = require('slack-helperbot/utils.js');

//var DiplomacyEngine = require('diplomacy.engine.js');


module.export = {
	listenIn : ['diplomacy'],
	listenFor : ['messages'],
	response : function(msg, info, Higgins){

		//Debug Commands
		if(utils.messageHas(msg, 'diplomacybot', 'start game')){

		}
		if(utils.messageHas(msg, 'end round')){

		}
		if(utils.messageHas(msg, 'diplomacybot', 'end game')){

		}


		if(info.isDirect){

			Higgins.reply('yo');


		}


//////////////////////





	}
}