
//wiggle the fraggle is a lodash?
var _ = require('lodash');

//define the emoji that I'm all about. I don't think I need this
//var shrew_emoji = ['sandshrew'];

var isActive = false;


// Try using this meg, it's new!
var utils = require('slack-helperbot/utils');

var isShrewRequest = function(msg){
	return !isActive && utils.messageHas(msg, ['Sandshrew','shrewbro'], ['choose','go']);
};

var isShrewDismiss = function(msg){
	return isActive && utils.messageHas(msg, ['Sandshrew','shrewbro','asshole'], ['enough','come back','back']);
};

/* This code has been replaced, will delete when tested
//words of ancient voodoo provided by scott to whisper gently over my bot
var _contains = function(str, list){
	return _.some(list, (word)=>{
		return _.includes(str.toLowerCase(), word.toLowerCase());
	});
};
//define shrew messages
var isShrewRequest = function(msg){
	return _contains(msg, ['choose','go']) && _contains(msg, ['Sandshrew','shrewbro']) && !isActive;
	};

//random junk maybe? Will I need it someday, only time will tell.
var isShrewDismiss = function(msg){
	return _contains(msg, ['enough','come back','back']) && _contains(msg, ['Sandshrew','shrewbro','asshole']) && isActive;
	};
*/

//do the shit
module.exports = {
	listenIn : 'tall-grass',
	listenFor : ['message'],
	response : function(msg, info, Higgins){
      		if(info.user == 'meggeroni' && isShrewRequest(msg)){
      			  isActive = true;
			  Higgins.react('sandshrew');

    	  		}
    	  	else if(info.user == 'meggeroni' && isShrewDismiss(msg)){
			  Higgins.react('pokeball');
			  isActive = false;
    	  		}
		else if(info.user == 'meggeroni' && isActive){
			Higgins.react('sandshrew');
			}

		}
};
