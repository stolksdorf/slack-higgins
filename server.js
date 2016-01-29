require('app-module-path').addPath('./shared');

var _ = require('lodash');
var express = require('express');
var app = express();

var diag = require('diag');



var SESSION = _.random(0,100)



var cmds = require('fs').readdirSync('./commands');
console.log(cmds);


Error.stackTraceLimit = 30;

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
			}catch(e){
				diag.msg(e.message + ' in ' + cmdPath);
			}
		})
	}catch(e){
		console.log('error loading', cmdPath);
		console.log(e.message);
		console.log(e.stack);

		diag.msg(e.message + ' in ' + cmdPath);
	}

})


/*

app.post('/test', function(req, res){


	console.log(req.params);


	return res.status(200).send({
		'response_type': 'in_channel',
		'text': "HEY TEST WORKED"
	});
})





app.get('/roll', function(req, res){




	var rollCheck = function(text){
		var roll = 10;
		var rolls = [_.random(1,20), _.random(1,20)];
		var hasMod = false;

		if(_.includes(text, 'adv') || _.includes(text, 'inspiration')){
			roll = _.max(rolls);
			hasMod = true;
		}else if(_.includes(text, 'dis')){
			roll = _.min(rolls);
			hasMod = true;
		}else{
			roll = rolls[0];
		}


		roll = (roll == 20 ? 'CRIT!' : roll);
		roll = (roll == 1 ? 'FAIL!' : roll);

		return {
			'response_type': 'in_channel',
			'text': roll,
			'attachments': [
				{
					'text': (hasMod ? JSON.stringify(rolls) : '')
				}
			]
		};

	}


	var rollDice = function(text){

		//roll logic
		var num_dice = Number(text.split('d')[0] || 1);
		var dice_type = Number(text.split('d')[1]);



		var rolledDice = _.times(num_dice, function(){
			return _.random(1, dice_type);
		});

		return {
			'response_type': 'in_channel',
			'text': num_dice+'d'+dice_type+': ' + _.sum(rolledDice),
			'attachments': [
				{
					'text': JSON.stringify(rolledDice)
				}
			]
		};
	}


	var text = req.query.text;


	if(_.includes(text, 'check') || _.includes(text, 'throw')){
		res.status(200).send(rollCheck(text));
	}else{
		res.status(200).send(rollDice(text));
	}



})


var rollCmd = {
	private : false, //sets it so your command will only be seen by
	cmd : function(text, data){


		//return a string for basic text, or object complex
		//messaging
	}
}

*/

var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');