require('app-module-path').addPath('./shared');
var _ = require('lodash');


var cmds = require('fs').readdirSync('./commands');


var targetCmd = process.argv[2];
var text = process.argv[3] || '';

try{
	var cmd = require('./commands/' + targetCmd);

	cmd(text, {}, function(response){
		console.log(response);
	});
}catch(e){
	console.log('Load Error:', e.message);
	console.log(e.stack);
}

