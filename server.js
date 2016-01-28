var express = require("express");



var app = express();










app.get('/roll', function(req, res){

	return res.status(200).send({
		"text": "your message: " + req.query.text,
		"attachments": [
			{
				"text": JSON.stringify(req.query, null, '  ')
			}
		]
	});
})










var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');