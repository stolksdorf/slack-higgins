const _ = require('lodash');

const joinAnd = (arr)=>{
	if(arr.length == 1) return arr[0];
	if(arr.length == 2) return `${arr[0]} and ${arr[1]}`;
	return `${_.initial(arr).join(', ')}, and ${_.last(arr)}`;
};


const groups = {
	'A' : {
		body     : 'Full-bodied',
		taste    : ['sweet', 'sherry'],
		accent   : ['fruity', 'honey', 'spicy'],
		some     : [],
		examples : ['Aberlour A’Bunadh', 'Auchentoshan Three Wood', 'Glenfiddich 15yo', 'Glendronach 12yo', 'Glenmorangie Lasanta']
	},
	'B' : {
		body     : 'Full-bodied',
		taste    : ['sweet', 'sherry'],
		accent   : ['fruity', 'floral', 'malty'],
		some     : ['honey', 'spicy'],
		examples : ['Balvenie New Wood 17yo, Glenfarclas 10yo/15yo/17yo, Glengoyne 17yo/21yo, Penderyn Madeira']
	},
	'C' : {
		body     : 'Full-bodied',
		taste    : ['sweet', 'sherry'],
		accent   : ['fruity', 'floral', 'nutty', 'spicy'],
		some     : ['smokey'],
		examples : ['Aberlour 10yo', 'Glenfarclas 105/12yo/21yo/25yo/30yo', 'Glenmorangie Signet', 'Highland Park 18yo']
	},
	'E' : {
		body     : 'Medium-bodied',
		taste    : ['sweet'],
		accent   : ['fruity', 'honey', 'malty', 'winey'],
		some     : ['smoky', 'spicy'],
		examples : ['Auchentoshan 12yo/18yo', 'Dalmore 12yo', 'Glenrothes Select Reserve/Vintage 1989/1991/1992/1994', 'Old Pulteney', 'Redbreast 12yo']
	},
	'F' : {
		body     : 'Full-bodied',
		taste    : ['sweet', 'malty'],
		accent   : ['fruity', 'spicy', 'smoky'],
		some     : [],
		examples : ['Bunnahabhain 12yo', 'Deanston 12yo', 'Glen Garioch 10yo/12yo/15yo', 'Glenlivet French Oak 15yo', 'Tobermory 10yo']
	},
	'G' : {
		body     : 'Light-bodied',
		taste    : ['sweet', 'apéritif-style'],
		accent   : ['honey', 'floral', 'fruity', 'spicy'],
		some     : ['smoky'],
		examples : ['BenRiach 12yo', 'Bruichladdich Laddie Classic', 'Glenfiddich 12yo', 'Glen Garioch Founder’s Reserve', 'Glenmorangie 10yo', 'Jura 10yo']
	},
	'H' : {
		body     : 'Very light-bodied',
		taste    : ['sweet', 'apéritif-style'],
		accent   : ['malty', 'fruity', 'floral'],
		some     : [],
		examples : ['Auchentoshan Classic/10yo', 'Cardhu 12yo', 'Dalwhinnie 15yo', 'Glen Grant 10yo', 'Tamdhu 10yo']
	},
	'I' : {
		body     : 'Medium-bodied',
		taste    : ['sweet', 'smoky'],
		accent   : ['spicy', 'fruity', 'nutty'],
		some     : ['medicinal'],
		examples : ['Ardmore Traditional Cask', 'BenRiach Curiositas 10yo', 'Bowmore 12yo', 'Highland Park 12yo', 'Jura Superstition', 'Oban 14yo', 'Talisker 10yo)']
	},
	'J' : {
		body     : 'Full-bodied',
		taste    : ['dry', 'smoky', 'pungent'],
		accent   : ['medicinal', 'malty', 'fruity'],
		some     : ['spicy'],
		examples : ['Ardbeg 10yo/Corryvreckan/Uigeadail', 'Lagavulin 16yo', 'Laphroaig 10yo/15yo/18yo/Quarter Cask', 'Toumintol Peaty Tang']
	},
};

const GroupInfo = {
	groups : groups,

	getDescription : (cluster)=>{
		const info = _.reduce(cluster.split(''), (r, groupID)=>{
			const group = groups[groupID];
			_.each(group, (val, key)=>{
				r[key] = _.uniq(_.concat(r[key], val));
			});
			return r;
		}, {
			body     : [],
			taste    : [],
			accent   : [],
			some     : [],
			examples : []
		});

		// let taste = _.sampleSize(info.taste, _.random(1,3));
		// let accent = _.sampleSize(info.accent, _.random(2,4));
		// let some = _.sampleSize(info.some, _.random(0,2));

		const notes = joinAnd(_.sampleSize(info.accent, _.random(2, 4)));

		let some = '';
		if(info.some.length > 0){
			some = ` and some ${joinAnd(_.sampleSize(info.some, _.random(1, 3)))} notes`;
		}
		return `${_.sample(info.body)}, ${_.sampleSize(info.taste, _.random(1, 3)).join(', ')} with ${notes} notes${some}`;
	},

	getScores : (text)=>{
		return _.mapValues(groups, (group)=>{
			return _.sumBy(group.taste, (taste)=>(text.indexOf(taste)!==-1 ? 3 : 0)) +
				   _.sumBy(group.accent, (accent)=>(text.indexOf(accent)!==-1 ? 1 : 0)) +
				   _.sumBy(group.some, (some)=>(text.indexOf(some)!==-1 ? 0.5 : 0));
		});
	},

	getMatchingGroup : (text)=>{
		const scores = GroupInfo.getScores(text);
		const max = _.maxBy(_.toPairs(scores), (info)=>info[1]);
		if(max[1] == 0) return '';
		return max[0];
	}

};

module.exports = GroupInfo;