require('app-module-path').addPath('./shared');

var _ = require('lodash');
var express = require('express');
var app = express();

var diag = require('diag');



var SESSION = _.random(0,100)


var gitrev = require('gitrev');
gitrev(function(str){
	diag.msg("Server restart! " + str);
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



var exitHandler = function(type){
	console.log('reacting to ' + type + SESSION);
	diag.msg("Shutting down to " + type + SESSION, function(){

		console.log('EXITING');
		process.exit();
	});
}


//process.on('exit', exitHandler.bind(null, 'exit'));
process.on('SIGTERM', exitHandler.bind(null, 'SIGTERM'));
//process.on('SIGINT', exitHandler.bind(null, 'SIGINT'));
//process.on('uncaughtException', exitHandler.bind(null, 'uncaughtException'));



var port = process.env.PORT || 8000;

app.listen(port);
console.log('running.');