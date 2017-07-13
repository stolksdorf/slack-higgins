const fs = require('fs');
const _ = require('lodash');

const compare = require('string-similarity').compareTwoStrings;

//const rawcsv = fs.readFileSync('./bots/scotchbot/whisky.db.temp.csv', 'utf8');
const rawcsv = fs.readFileSync('./bots/scotchbot/scotch.db.csv', 'utf8');

const processCSV = (rawcsv)=>{
	const lines = rawcsv.split('\n')
	lines.shift();
	return _.map(lines, (whisky, idx)=>{
		const parts = whisky.split('","');
		return {
			id      : idx,
			name    : parts[0].replace('"',''),
			rating  : _.toNumber(parts[1]),
			stdev   : _.toNumber(parts[2]),
			cost    : parts[4],
			class   : parts[5],
			group   : parts[6],
			country : parts[8],
			type    : parts[9].replace('"', '').replace('\r', ''),
		};
	})
};

const scotches = processCSV(rawcsv);


console.log('min', _.minBy(scotches, (scotch)=>scotch.rating));
console.log('max', _.maxBy(scotches, (scotch)=>scotch.rating));

const groups = _.groupBy(scotches, (scotch)=>Math.floor(scotch.rating));

console.log(_.mapValues(groups, (group)=>group.length));


module.exports = {
	list : scotches,

	find : (scotchName) => {
		const bestMatch = _.maxBy(scotches, (scotch)=>compare(scotchName, scotch.name))
		return {
			confidence : compare(scotchName, bestMatch.name)
			scotch : bestMatch
		};
	}

}
