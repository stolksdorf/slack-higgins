const fs = require('fs');
const _ = require('lodash');
const Groups = require('./group.info.js');
const compare = require('string-similarity').compareTwoStrings;

//const rawcsv = fs.readFileSync('./bots/scotchbot/whisky.db.temp.csv', 'utf8');
const rawcsv = fs.readFileSync('./bots/scotchbot/scotch.db.csv', 'utf8');

const processCSV = (rawcsv)=>{
	const lines = rawcsv.split('\n');
	lines.shift();
	return _.map(lines, (whisky, idx)=>{
		const parts = whisky.split('","');
		return {
			id         : idx,
			name       : parts[0].replace('"', ''),
			rating     : _.toNumber(parts[1]),
			stdev      : _.toNumber(parts[2]),
			cost       : parts[4],
			class      : parts[5],
			supergroup : parts[6],
			group      : parts[7],
			country    : parts[8],
			type       : parts[9].replace('"', '').replace('\r', ''),
		};
	});
};

const scotches = processCSV(rawcsv);


// const groups = _.groupBy(scotches, (scotch)=>Math.floor(scotch.rating));
// console.log(_.mapValues(groups, (group)=>group.length));


module.exports = {
	list : scotches,

	lookup : (scotchName)=>{
		const bestMatch = _.maxBy(scotches, (scotch)=>compare(scotchName.toLowerCase(), scotch.name.toLowerCase()));
		return {
			confidence : compare(scotchName.toLowerCase(), bestMatch.name.toLowerCase()),
			scotch     : bestMatch
		};
	},

	//groups, cost
	search : (params = {})=>{
		if(params.groups && !_.isArray(params.groups)) params.groups = [params.groups];
		return _.filter(scotches, (scotch)=>{

			if(params.groups){
				const hasMatchingGroup = _.some(params.groups, (group)=>scotch.group == group);
				if(!hasMatchingGroup) return false;
			}

			if(params.costs){
				const hasMatchingCost = _.some(params.costs, (cost)=>scotch.cost == cost);
				if(!hasMatchingCost) return false;
			}

			return true;
		});
	},

};
