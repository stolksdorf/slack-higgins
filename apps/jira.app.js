var _ = require('lodash');


// https://api.slack.com/apps/A29PQHSV7
//Replaces references to Jira tasks in messages with links to them instead.

module.exports = function(expressInstance){

	expressInstance.all('/jira/oauth', (req, res)=>{

	});


	expressInstance.all('/jira/event', (req, res)=>{

		console.log('query', req.query);
		console.log('body', req.body);

		if(req.body.type == 'url_verification'){
			return res.status(200).send(req.body.challenge);
		}


	});



	return expressInstance;
}