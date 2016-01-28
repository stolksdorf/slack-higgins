var express = require('express');
var request = require('superagent');



var app = express();




var diagnosticsURL = 'https://hooks.slack.com/services/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'

var _ = require('lodash');






var sendDiagmsg = function(text){
	request
		.post(diagnosticsURL)
		.send({

			"text": text,

			"color": "#36a64f", // Can either be one of 'good', 'warning', 'danger', or any hex color code

			// Fields are displayed in a table on the message
			/*
			"fields": [
				{
					"title": "Command Fired", // The title may not contain markup and will be escaped for you
					"value": "Text value of the field. May contain standard message markup and must be escaped as normal. May be multi-line.",
					"short": false // Optional flag indicating whether the `value` is short enough to be displayed side-by-side with other values
				}
			]
			*/
		})
		.end(function(err){
			if(!err){
				console.log('Sent without error', text);
			}
			console.log('ERR', err);
		});
}




sendDiagmsg("Server restart!");



app.get('/roll', function(req, res){

	var text = req.query.text;

	//roll logic
	var num_dice = Number(text.split('d')[0] || 1);
	var dice_type = Number(text.split('d')[1]);



	var rolledDice = _.times(num_dice, function(){
		return _.random(1, dice_type);
	});



	sendDiagmsg("Roll Command Fired");




	return res.status(200).send({
		'response_type': 'in_channel',
		'text': num_dice+'d'+dice_type+': ' + _.sum(rolledDice),
		'attachments': [
			{
				'text': JSON.stringify(rolledDice)
			}
		]
	});
})


var rollCmd = {
	private : false, //sets it so your command will only be seen by
	cmd : function(text, data){


		//return a string for basic text, or object complex messaging
	}
}



process.on('exit', function() {
	console.log('About to close');
	sendDiagmsg("Server shutting down... goodnight. :moon:");
});



var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');