
//wiggle the fraggle is a lodash?
var _ = require('lodash');

var isActive = false;


// Try using this meg, it's new!
var utils = require('slack-helperbot/utils');

var isShrewRequest = function(msg){
	return !isActive && utils.messageHas(msg, ['Sandshrew','shrewbro'], ['choose','go']);
};

var isShrewDismiss = function(msg){
	return isActive && utils.messageHas(msg, ['Sandshrew','shrewbro','asshole'], ['enough','come back','back']);
};

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
