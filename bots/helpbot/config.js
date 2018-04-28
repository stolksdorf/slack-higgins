module.exports = {
	bot : {
		name : 'helpbot',
		emoji : 'heart'
	},
	root : 'https://prose.io/#stolksdorf/slack-higgins/edit/master',
	teams : {
		care : {
			name    : 'Care',
			source  : '/bots/helpbot/docs/care.yaml',
			emoji   : 'heart_eyes',
			channel : 'care-test'
		},
		it : {
			name    : 'it',
			source  : '/bots/helpbot/docs/it.yaml',
			emoji   : 'computer',
			channel : 'care-test'
		},
		hr : {
			name    : 'hr',
			source  : '/bots/helpbot/docs/hr.yaml',
			emoji   : 'heart_eyes',
			channel : 'care-test'
		}
	},
	emojis : {
		happy : 'heart',
		more  : 'heavy_plus_sign',
		fix   : 'cry'
	}
};
