var _ = require('lodash');
var request = require('superagent');

var diagnosticsURL = process.env.DIAGNOSTICS_WEBHOOK || '';


var msg = function(msgObj){
	if(!diagnosticsURL){
		console.log(msgObj);
		return;
	}

	request.post(diagnosticsURL)
		.send(msgObj)
		.end(function(err){

	})
}


module.exports = {

	//blue
	log : function(){
		var args = Array.prototype.slice.call(arguments);
		msg({
			color : 'good',
			"fields": [
				{
					"title": "Logging",
					"value": JSON.stringify(args),
					"short": false
				}
			]
		})
	},

	//red
	error : function(title, err){
		msg({
			color : 'danger',
			"fields": [
				{
					"title": title,
					"value": err.stack,
					"short": false
				}
			]
		})
	},

	//yellow
	info : function(title, msg){
		msg({
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

	msg : function(text){
		msg({
			text : text
		});
	},

}

/*{

			"text": text,fgh

			"color": "#36a64f", // Can either be one of 'good', 'warning', 'danger', or any hex color code

			// Fields are displayed in a table on the message

			"fields": [
				{
					"title": "Command Fired", // The title may not contain markup and will be escaped for you
					"value": "Text value of the field. May contain standard message markup and must be escaped as normal. May be multi-line.",
					"short": false // Optional flag indicating whether the `value` is short enough to be displayed side-by-side with other values
				}
			]

		}
		*/