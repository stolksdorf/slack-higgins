
//wiggle the fraggle is a lodash?
//var _ = require('lodash');

//define the emoji that I'm all about
var shrew_emoji = ['sandshrew'];

//define shrew messages
var isShrewRequest = function(msg){
	return _contains(msg, ['Sandshrew','choose','go','shrewbro']);
	}

//words of ancient voodoo provided by scott to whisper gently over my bot
var _contains = function(str, list){
	return _.some(list, (word)=>{
		return _.includes(str.toLowerCase(), word.toLowerCase());
	});
}	
	
//random junk maybe? Will I need it someday, only time will tell.	
//var isShrewDismiss = function(msg){
//	return _contains(msg, ['Sandshrew good job', 'Sandshrew that's enough']);	

//do the shit
module.exports = {
	//listenFor : ['message'],	
	response : function(msg, info, Higgins){
      		if(isShrewRequest(msg)){
    	  	if(info.user == 'meggeroni'){
			  Higgins.react(shrew_emoji);
    	  		}
			}
		}	
	};	
