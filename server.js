var express = require("express");



var app = express();










app.get('/roll', function(req, res){
	console.log(req.params.text);


	return res.status(200).send({
		"text": "your message: " + req.params.text,
		"attachments": [
			{
				"text":"Partly butty today and tomorrow"
			}
		]
	});
})










var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');