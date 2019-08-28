module.exports = {
	database_url : "postgres://trfovedsdkkdve:df3e1c8b55ed312ff9782f10ae168d844b48a53b0f1f489eca6f03091eab790c@ec2-50-17-250-38.compute-1.amazonaws.com:5432/d76edao4s0c6iu",
	diagnostics_webhook : '',
	slack_bot_token : '',
	command_token : '',

	rainbot : {
		darksky_api : '',
		ifttt_webhook_key : ''
	},
	nationstates_pwd : {

	},
	github_token : '',
	markov : {
		bucket_name: 'coolsville-markov'
	},
	s3 : {
		access : '',
		secret : ''
	},
	activitybot : {
		debug : false,
		run_interval_seconds: 30,
		ignored_channels: 'general,feedback,events,diagnostics',
		target_channel: 'general',
		cooldown_seconds: 43200,
		threshold : {
			message_count: 20,
			seconds: 300
		}
	}
}
