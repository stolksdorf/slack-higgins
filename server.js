require('app-module-path').addPath('./shared');

var _ = require('lodash');
var express = require('express');
var app = express();

var Logbot = require('logbot');



var SESSION = _.random(0,100)



Logbot.info('Server Restart', 'Server restarted and everything looking good!');



var cmds = require('fs').readdirSync('./commands');


//Load Each Command
_.each(cmds, function(cmdPath){
	try{
		var cmd = require('./commands/' + cmdPath);
		var cmdUrl = '/' + cmdPath.replace('.js', '');

		app.post(cmdUrl, function(req, res){
			res.status(200).send({
				text : "Opps, looks like you set your command to have a *method* of `POST`, it should be set to `GET`"
			})
		});

		app.get(cmdUrl, function(req, res){
			var text = req.query.text;
			try{
				cmd(text, req.query, function(response){
					var msgObj = {};
					if(_.isString(response)){
						msgObj = {
							text : response
						};
					}else if(!_.isPlainObject(response)){
						msgObj = {
							text : JSON.stringify(response)
						};
					}else{
						msgObj = response;
					}

					res.status(200).send(_.extend({
						'response_type': 'in_channel',
					}, msgObj));
				})
			}catch(err){
				Logbot.error('Command Run Error : ' + cmdPath, e);
			}
		})
	}catch(err){
		Logbot.error('Command Load Error : ' + cmdPath, err);
	}

})

var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');