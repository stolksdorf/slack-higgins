

const now = (new Date());
const yearStart = new Date(now.getFullYear(), 0, 0);



const {addDays, format} = require('date-fns');
const pluck = (arr)=>arr[Math.floor(Math.random()*arr.length)];


const pickRandomDate = ()=>{
	const res = addDays(Date.now(), Math.floor(Math.random()*365));
	return pluck([
		()=>`Your date is ${format(res, 'dddd MMM Do, YYYY')}`,
		()=>`Your date is ${format(res, 'dddd MMM Do')}, In the year of Our Lord ${format(res, 'YYYY')}`,
		()=>`I heard ${format(res, 'dddd MMM Do, YYYY')} is going to be a great day`,
		()=>`Between you and me? ${format(res, 'dddd MMM Do, YYYY')} is gunna slap`,
		()=>`Mark ${format(res, 'dddd MMM Do, YYYY')} on your calendars ev'rybody`,
		()=>`I gotchu, ${format(res, 'dddd MMM Do, YYYY')}`,
		()=>`𝓓𝓞 𝓝𝓞𝓣 𝓕𝓔𝓐𝓡 𝓜𝓨 𝓒𝓗𝓘𝓛𝓓, 𝓣𝓗𝓔 𝓓𝓐𝓨 𝓞𝓕 𝓡𝓔𝓒𝓚𝓞𝓝𝓘𝓝𝓖 𝓢𝓗𝓐𝓛𝓛 𝓞𝓒𝓒𝓤𝓡 𝓞𝓝 ${format(res, 'dddd MMM Do, YYYY')}`
	])()
};

console.log(pickRandomDate())
console.log(pickRandomDate())
console.log(pickRandomDate())
console.log(pickRandomDate())
console.log(pickRandomDate())

