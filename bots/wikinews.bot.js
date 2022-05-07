const Slack = require('../utils/pico-slack');
const request = require('superagent');
const datefns = require('date-fns');
const cron = require('node-schedule');

const {onCommand} = require('../utils.js');

const times = (n,fn)=>Array.apply(null,{length:n}).map((_,i)=>fn(i));
const sequence = async (obj,fn)=>Object.keys(obj).reduce((a,key)=>a.then((r)=>fn(obj[key],key,r)), Promise.resolve());

//https://coolsville.slack.com/files/U0VAY0TN2/FJ4KWP0EA/image.png

//https://wikitech.wikimedia.org/wiki/Analytics/AQS/Pageviews#Updates_and_backfilling



const articleSchema = {
	article : String,
	rank    : Number,
	views   : Number
}


const nums = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'keycap_ten'];

const NUM_TO_SHOW = 10;


const getTopArticlesForDay = async (date)=>{
	return request.get(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${datefns.format(date, 'YYYY/MM/DD')}`)
		.then((res)=>res.body.items[0].articles)
		.then((articles)=>{
			return articles.filter((art)=>{
				if(art.article == 'Main_Page') return false;
				if(art.article.startsWith('Special:')) return false;
				if(art.article.startsWith('File:')) return false;
				if(art.article.startsWith('Template:')) return false;
				return true
			})
		})
		.catch(()=>[])
};


const getWeeklyTotals = async (date = new Date())=>{
	const dates = times(7, (n)=>datefns.subDays(date, n))

	const mergeArticles = (list1=[], list2=[])=>{
		const res = {};
		const merge = (art)=>{
			if(res[art.article]) return res[art.article].views += art.views;
			res[art.article] = art;
		}
		list1.map(merge);
		list2.map(merge);
		return Object.values(res);
	};

	let res = [];
	await sequence(dates, async (date)=>{
		const temp = await getTopArticlesForDay(date);
		res = mergeArticles(res, temp)
	});

	return res.sort((a,b)=>a.views<b.views?1:-1);
}


const run = (date)=>{
	return getWeeklyTotals(date)
		.then((articles)=>articles.slice(0,NUM_TO_SHOW))
		.then((articles)=>{
			const msg = articles.map((art, idx)=>{
				return `:${nums[idx]}: *<https://en.wikipedia.org/wiki/${art.article}|${art.article.replace(/_/g, ' ')}>* (_views: ${art.views.toLocaleString()}_)`;
			}).join('\n');

			Slack.send('general', `Here's the most searched articles on wikipedia for the last week\n\n${msg}`
				+ '\n\n Place your bets on what you think is happening! :monocle:', {
					username: 'wikibot',
					icon_emoji: 'wikipedia',
					unfurl_links:false,
					unfurl_media:false
				})
		})
}
cron.scheduleJob('11 15 * * 5', run);



onCommand('wiki', ()=>{
	//console.log('running wiki');
	run();
});
