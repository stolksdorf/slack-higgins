const Slack = require('pico-slack');
const Markov = require('./markov.engine2.js');
const config = require('../../config')
const fs = require('fs').promises;

const format = (num)=>num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

const exportPath = "C:/Users/scott/Desktop/coolsville-markov-mappings";

const test = async (user, depth=6)=>{
	const raw = await fs.readFile(exportPath + `/${user}.mapping.json`);

	const mapping = JSON.parse(raw);

	const footer = `built with ${format(mapping.messages)} messages, using ${format(mapping.letters)} letters with a depth of ${depth}.`;
	const pretext = Markov.generate(mapping[`depth${depth}`], depth);


	console.log(pretext);
	console.log(footer);

}

test('scott', 8);
console.log('------');

// let res = {}
// res = Markov.encode(res, `Oh hello there, didn't see you!`,2);
// //res = Markov.encode(res, `foo`, 7);
// //res = Markov.encode(res, `foobar`, 7);

// console.log(Markov.generate(res,2) + '|');


// console.log(Markov.truncate('oh hello', 2))
// console.log(Markov.truncate('dfgdfgfg', 7))