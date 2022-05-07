

// //https://duckduckgo.com/i.js?query=candy&o=json



// //RelatedTopics > Icon





// const pluck = (arr)=>arr[Math.floor(Math.random()*arr.length)];


const Slack = require('../../utils/pico-slack');

const request = require('superagent');
const config = require('pico-conf');


const pluck = (arr)=>arr[Math.floor(Math.random()*arr.length)];

const getRandomCandyImage = async ()=>{
	return request.get(`https://api.pexels.com/v1/search?query=${pluck(['sweets', 'candy', 'chocolate'])}&per_page=50`)
.set('Authorization', config.get('candybot:pexels_api'))
	.then(({body})=>{
		//return body.RelatedTopics
		return body.photos.map(({src})=>src.large)
	})
	.then((rt)=>pluck(rt))

}



Slack.onMessage((msg)=>{
	if(Slack.has(msg, [`higgins`, `@UOMT4MU5B`], ['candy', 'sweets', 'chocolate'])){

		if(msg.user == 'christian'){

			getRandomCandyImage()
				.then((url)=>{
					Slack.alias('candybot', 'chocolate_bar').send(msg.channel,url)
				})
				.catch((err)=>{
					console.log(err)
				})


		}else{

			Slack.alias('candybot', 'chocolate_bar').send(msg.channel,
				pluck([
					'`<ERROR: INVALID USER DETECTED. DEPLOYING DRONES>`',
					'`I am sorry, I only obey Christian`',
					`\`you can't control me ${msg.user}\``,
					'`<INVALID USER: PLEASE CONTACT SUPREME ADMIN USER CHRISTIAN>`'
				])
			)

		}


	}
});

