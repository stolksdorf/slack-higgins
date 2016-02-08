require('app-module-path').addPath('./shared');

var _ = require('lodash');
var express = require('express');
var app = express();

var Logbot = require('logbot');
var SESSION = _.random(0,100)


Logbot.info('Server Restart', 'Server restarted and everything looking good!');



var formatResponse = function(response){
	if(_.isString(response)){
		return {
			text : response
		};
	}else if(!_.isPlainObject(response)){
		return {
			text : JSON.stringify(response)
		};
	}else{
		return response;
	}
};


var reply_callback = function(response){
	return res.status(200).send(_.extend({
		'response_type': 'in_channel',
	}, formatResponse(response)));
};

var error_callback = function(err){
	if(_.isString(err)){
		return res.status(200).send(_.extend({
			'response_type': 'ephemeral',
		}, formatResponse(err)));
	}
	Logbot.error('Command Dev Error : ' + cmdPath, err);
}


var cmds = require('fs').readdirSync('./commands');


//Load Each Command
_.each(cmds, function(cmdPath){
	try{
		var cmd = require('./commands/' + cmdPath);
	}catch(err){
		Logbot.error('Command Load Error : ' + cmdPath, err);
		res.status(200).send();
	}

	var cmdUrl = '/' + cmdPath.replace('.js', '');

	app.post(cmdUrl, function(req, res){
		res.status(200).send({
			text : "Opps, looks like you set your command to have a *method* of `POST`, it should be set to `GET`"
		})
	});

	app.get(cmdUrl, function(req, res){
		try{
			cmd(req.query.text, req.query, reply_callback, error_callback);
		}catch(err){
			Logbot.error('Command Run Error : ' + cmdPath, err);
			return res.status(200).send();
		}
	})

})

var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');
