
//wiggle the fraggle is a lodash?
var _ = require('lodash');

//define the emoji that I'm all about. I don't think I need this
//var shrew_emoji = ['sandshrew'];

var isActive = false;
var channel;


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

//do the shit
module.exports = {
	listenFor : ['message'],	
	response : function(msg, info, Higgins){
		if(info.channel !== 'tall-grass') return;
		if(!msg) return;
		
      		if(info.user == 'meggeroni' && isShrewRequest(msg)){
      			  channel = info.channel;
			  Higgins.react('sandshrew');
			  isActive = true;
    	  		}
    	  	else if(info.user == 'meggeroni' && isShrewDismiss(msg)){
			  Higgins.react('pokeball');
			  isActive = false;
			  channel = null;
    	  		}	
		else if(info.user == 'meggeroni' && isActive && channel == info.channel){
			Higgins.react('sandshrew');	
			}
		
		}	
};	
