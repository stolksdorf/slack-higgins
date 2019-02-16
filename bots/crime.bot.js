const config = require('pico-conf');
const Slack = require('pico-slack');
const request = require('superagent');

const crimeGistID = '24d22dfeecc3d02e419cad8739e8b672';
const gistName= '20crimeteen.txt';
const token = config.get('github_token');

const updateCrimeGist = async (newContent)=>{
	return request.get(`https://api.github.com/gists/${crimeGistID}`)
		.set('Accept', 'application/vnd.github.v3+json')
		.set('Authorization', `token ${token}`)
		.then((response)=>{
			return response.body.files[gistName].content;
		})
		.then((content)=>{
			return request.patch(`https://api.github.com/gists/${crimeGistID}`)
				.set('Accept', 'application/vnd.github.v3+json')
				.set('Authorization', `token ${token}`)
				.send({
					description : '#20crimeteen',
					files: {
						[gistName] : {
							content : `${content}\n\n${newContent}`
						}
					}
				})
		})
		.catch((err)=>{
			console.log(err);
			Slack.error(err);
		})
};

Slack.onMessage((msg)=>{
	if(Slack.msgHas(msg.text, ['#20crimeteen', '#twentycrimeteen'])){
		updateCrimeGist(`[${(new Date()).toLocaleDateString()}] ${msg.user}: ${msg.text}`)
			.then(()=>{
				Slack.sendAs('crimebot', 'police_car', msg.channel, `<https://gist.github.com/stolksdorf/24d22dfeecc3d02e419cad8739e8b672|#20crimeteen!>`)
			});
	}
});