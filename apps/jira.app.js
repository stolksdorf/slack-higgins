var _ = require('lodash');


// https://api.slack.com/apps/A29PQHSV7
//Replaces references to Jira tasks in messages with links to them instead.

module.exports = function(expressInstance){

	expressInstance.get('/jira/oauth', (req, res)=>{

	});


	expressInstance.post('/jira/event', (req, res)=>{

		if(req.body.type == 'url_verification'){
			return res.status(200).send(req.body.challenge);
		}


	});



	return expressInstance;
}