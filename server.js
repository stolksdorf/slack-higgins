var express = require("express");



var app = express();






var _ = require('lodash');



app.get('/roll', function(req, res){

	var text = req.query.text;

	//roll logic
	var num_dice = Number(text.split('d')[0] || 1);
	var dice_type = Number(text.split('d')[1]);



	var rolledDice = _.times(num_dice, function(){
		return _.random(1, dice_type);
	});






	return res.status(200).send({
		"response_type": "in_channel",
		"text": num_dice+'d'+dice_type+': ' + _.sum(rolledDice),
		"attachments": [
			{
				"text": JSON.stringify(rolledDice)
			}
		]
	});
})









var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');