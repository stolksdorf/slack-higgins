var _ = require('lodash');
var Logbot = require('./logbot');

var Cmds = [];

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


var reply_callback = function(res, response){
	return res.status(200).send(_.extend({
		'response_type': 'in_channel',
	}, formatResponse(response)));
};

var error_callback = function(res, err){
	if(_.isString(err)){
		return res.status(200).send(_.extend({
			'response_type': 'ephemeral',
		}, formatResponse(err)));
	}
	Logbot.error('Command Dev Error : ' + cmdPath, err);
}

module.exports = {

	getCmds : function(){
		return Cmds;
	},

	load : function(app, cmdList){
		var loadResults ={
			success : [],
			error : []
		}

		_.each(cmdList, function(cmdPath){
			try{
				var cmd = require('../commands/' + cmdPath);
				loadResults.success.push(cmdPath);
				Cmds.push({
					name : cmdPath,
					cmd : cmd
				});
			}catch(err){
				Logbot.error('Command Load Error : ' + cmdPath, err);
				loadResults.error.push(cmdPath);
				return;
			}

			var cmdUrl = '/' + cmdPath.replace('.js', '');

			app.post(cmdUrl, function(req, res){
				res.status(200).send({
					text : "Opps, looks like you set your command to have a *method* of `POST`, it should be set to `GET`"
				})
			});

			app.get(cmdUrl, function(req, res){
				try{
					cmd(req.query.text, req.query, reply_callback.bind(this, res), error_callback.bind(this, res));
				}catch(err){
					Logbot.error('Command Run Error : ' + cmdPath, err);
					return res.status(200).send();
				}
			})
		})

		return loadResults;
	}
}
