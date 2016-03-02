
//var _ = require('lodash');
//var shrew_emoji = ['sandshrew'];

var isShrewRequest = function(msg){
	return _contains(msg, ['Sandshrew', 'choose','go','shrewbro']);
	}
	
//var isShrewDismiss = function(msg){
//	return _contains(msg, ['Sandshrew good job', 'Sandshrew that's enough']);	

module.exports = {
	listenFor : ['message'],	
	response : function(msg, info, Higgins){
      		if(isShrewRequest(msg)){
    	  	if(info.user == 'meggeroni'){
			  Higgins.react('sandshrew');
    	  		}
			}
		}	
	};	
