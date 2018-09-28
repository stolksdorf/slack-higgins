const request = require('superagent');
const xmlParse  = require('xml2js').parseString;
const parse = (res)=>{
	return new Promise((resolve, reject)=>{
		xmlParse(res.text, (err, result)=>err?reject(err):resolve(result));
	});
};

const Nations = require('./nations.js');


module.exports = {
	fetchIssues : async (user)=>{
		if(!Nations[user]) throw `No such user: ${user}`;

		return request.get('https://www.nationstates.net/cgi-bin/api.cgi')
			.set('X-Password', Nations[user].password)
			.set('User-Agent', "scott.tolksdorf@gmail.com")
			.query({
				nation: Nations[user].id,
				q : 'issues'
			})
			.then((res)=>{
				if(res.text.indexOf('<ERROR>') !== -1) throw res.text;
				return res;
			})
			.then(parse)
			.then((json)=>{
				return json.NATION.ISSUES[0].ISSUE.map((issue)=>{
					return {
						id : issue.$.id,
						title : issue.TITLE[0],
						text : issue.TEXT[0],
						link : `https://www.nationstates.net/page=show_dilemma/dilemma=${issue.$.id}`,
						options : issue.OPTION.map((opt)=>{
							return {
								id : opt.$.id,
								text : opt._
							}
						})
					}
				});
			})
	},
	respondToIssue : async (user, issueId, optionId)=>{
		if(!Nations[user]) throw `No such user: ${user}`;
		return request.get('https://www.nationstates.net/cgi-bin/api.cgi')
			.set('X-Password', Nations[user].password)
			.set('User-Agent', "scott.tolksdorf@gmail.com")
			.query({
				nation: Nations[user].id,
				c : 'issue',
				issue : issueId,
				option : optionId
			})
			.then((res)=>{
				if(res.text.indexOf('<ERROR>') !== -1) throw res.text;
				return res;
			})
			.then(parse)
			.then((json)=>{
				return {
					result    : json.NATION.ISSUE[0].DESC,
					headlines : json.NATION.ISSUE[0].HEADLINES[0].HEADLINE
				}
			})
	}
}