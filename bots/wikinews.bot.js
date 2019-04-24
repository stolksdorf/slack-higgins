const Slack = require('pico-slack');
const request = require('superagent');
const datefns = require('date-fns');
const cron = require('node-schedule');

//https://coolsville.slack.com/files/U0VAY0TN2/FJ4KWP0EA/image.png

//https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews#Updates_and_backfilling



const nums = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const NUM_TO_SHOW = 5;


const getTopArticles = async (date)=>{
	return request.get(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${datefns.format(date, 'YYYY/MM/DD')}`)
		.then((res)=>res.body.items[0].articles)
		.then((articles)=>{
			return articles.filter((art)=>{
				if(art.article == 'Main_Page') return false;
				if(art.article.startsWith('Special:')) return false;
				if(art.article.startsWith('File:')) return false;
				return true
			})
		})
		.then((articles)=>articles.slice(0, NUM_TO_SHOW));
}

const run = (date = new Date())=>{
	return getTopArticles(date)
		.then((articles)=>{
			const msg = articles.map((art, idx)=>{
				return `:${nums[idx]}: *<https://en.wikipedia.org/wiki/${art.article}|${art.article}>* (_views: ${art.views}_)`;
			}).join('\n')
			Slack.sendAs('wikibot', 'wikipedia', 'hmmm', `Here's the most searched articles on wikipedia for ${datefns.format(date, 'MMM Do')}\n\n${msg}`
				+ '\n\n Place your bets on what you think is happening! :monocle:')
		})
		.catch((err)=>{
			return run(datefns.subDays(date, 1))
		})
}
cron.scheduleJob('11 15 * * *', run)
