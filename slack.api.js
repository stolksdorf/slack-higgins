var _ = require('lodash');
var request = require('superagent');
var ws = require('ws');


var idMap = function(arr){
	return _.reduce(arr, (r, item)=>{
		r[item.id] = item;
		return r;
	}, {});
}


module.exports = function(TOKEN, opts){
	var replyId = 0;
	opts = _.assign({
		eventFilter : []
	}, opts);

	var Slack = {
		socketUrl : '',
		users : [],
		channels : [],

		init : function(cb){
			Slack.api('rtm.start', {no_unreads : true, simple_latest : true})
				.end((err, res)=>{
					var data = res.body;
					if(!data.ok) return;

					Slack.users = idMap(data.users);
					Slack.channels = idMap(data.channels);
					Slack.socketUrl = data.url;

					//handle ims

					console.log(data);


					Slack.connect(cb)


				})

			//get ws request token
			//connect to ws
			//dump user and channel lists
			//fire the ready handler


		},



		connect : function(cb){
			Slack.ws = new ws(Slack.socketUrl);



			Slack.ws.on('open', function(data){
				console.log('Open!', data);

				if(cb) cb()
			});

			Slack.ws.on('close', function(data){

			});

			Slack.ws.on('message', function(data){
				var data = JSON.parse(data);

				console.log(data);

			});




		},

		api : function(method, parameters){
			parameters.token = TOKEN;
			return request
				.post("https://slack.com/api/" + method)
				.type('form')
				.send(parameters)
		},

		// Repeatedly pings Slack to make sure the connection stays alive.
		//Maybe uneeded
		ping : function(){

		},


		reply : function(target, message, args){
			Slack.ws.send(JSON.stringify({
				"username" : "test",
				"icon_emoji" : ":cat:",
				"id": replyId++,
				"type": "message",
				"channel": target,
				"text": message
			}));
		},
		whipser : function(user, message){

		},
		react : function(target, emoji){
			return Slack.api('reactions.add', {

			})

		}
	};


	return Slack;
}
