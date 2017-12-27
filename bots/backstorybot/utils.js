const _ = require('lodash');

module.exports = {
	chart(num, map){
		num = parseInt(num);
		const newMap = _.mapKeys(map, (val, key)=>{
			key = key.replace(/l/g, '1');
			if(key.indexOf('—') !== -1) key = key.split('—')[1];
			if(key.indexOf('-') !== -1) key = key.split('-')[1];
			if(key == '00') key = 100;
			return parseInt(key);
		});
		const res = _.find(newMap, (val, threshold)=>num<=threshold)
		return (typeof res == 'function')
			? res()
			: res;
	},
	d(diceString){
		let [count, size] = diceString.split('d');
		if(count == 'l') count = 1;
		count = parseInt(count);
		size = parseInt(size);
		return _.sum(_.times(count, ()=>_.random(1, size)));
	}

}