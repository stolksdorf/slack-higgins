var _ = require('lodash');
var async = require('async');
var nums = ['one','two','three','four','five','six','seven','eight','nine'];

var POLLBOT_ID = 'B0NB1NTD0';
var pollMaster;

//Helps out PollBot by adding the default reactions for each option whenever a user posts a poll

module.exports = {
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(_.startsWith(msg, '/poll')){
			pollMaster = info.user;
		}

		if(info.bot_id == POLLBOT_ID){
			var fns = _.map(nums, (num)=>{
				if(_.includes(msg, ':' + num + ':')){
					//make this syncronous using 'async'
					return function(cb){
						Higgins.react(num).always(function(){ cb(); });
					};
				}
				return function(cb){ return cb() };
			});
			//make sure the reactions happen in order
			async.series(fns);

			Higgins.reply(_.sample([
				'Smashing poll ' + pollMaster,
				'Top shelf question ' + pollMaster +'!'
			]))
		}
	}
}