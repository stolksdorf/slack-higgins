var _ = require('lodash');
var request = require('superagent');

var diagnosticsURL = '';

var sendViaLogbot = function(msgObj){
	if(!diagnosticsURL){
		console.log(JSON.stringify(msgObj, null, '  '));
		return;
	}
	request.post(diagnosticsURL)
		.send(msgObj)
		.end(function(err){})
}


module.exports = {
	setUrl : function(url){
		diagnosticsURL = url;
	},

	log : function(){
		var args = Array.prototype.slice.call(arguments);
		sendViaLogbot({
			color : '#0000FF',
			"fields": [
				{
					"title": "Logging",
					"value": JSON.stringify(args),
					"short": false
				}
			]
		})
	},

	error : function(title, err){
		err = err || {};
		var stack = err.stack ? err.stack : JSON.stringify(err, null, '  ');

		sendViaLogbot({
			color : 'danger',
			"fields": [
				{
					"title": title,
					"value": stack,
					"short": false
				}
			]
		})
	},

	warn : function(title, msg){
		sendViaLogbot({
			color : 'warning',
			"fields": [
				{
					"title": title,
					"value": msg,
					"short": false
				}
			]
		})
	},

	info : function(title, msg){
		sendViaLogbot({
			color : 'good',
			"fields": [
				{
					"title": title,
					"value": msg,
					"short": false
				}
			]
		})
	},

	msg : function(text){
		sendViaLogbot({
			text : text
		});
	},

};