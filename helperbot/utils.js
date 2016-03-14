var _ = require('lodash');

module.exports = {


	// takes a message string and any number of arguments, either string or array
	// The message must have each argument in it, or if the argument is an array
	// at least one of the strings in the array
	//
	//example: utils.messageHas(msg, ['higgins', 'higs', 'higbro'], 'pokedex')
	messageHas : function(msg){
		if(!msg) return false;
		var words = Array.prototype.slice.call(arguments, 1);
		return _.every(words, (options)=>{
			if(_.isString(options)) return _.includes(msg.toLowerCase(), options.toLowerCase());

			if(_.isArray(options)) return _.some(options, (opt)=>{
				return _.includes(msg.toLowerCase(), opt.toLowerCase());
			});
		});
	},

	// Given a weighted message map, will return a random message based on the weights
	// {
	//  'hey!' : 40,
	//  'Cool guy' : 60
	// }
	getResponse : function(msgMap){


	},

}