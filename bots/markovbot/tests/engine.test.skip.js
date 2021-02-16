const test = require('pico-check');
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);
const times = (n,fn)=>Array.from(new Array(n*1),(v,i)=>fn(i));

const engine = require('../markov.engine.js');
const utils = engine.utils;

const END_MSG    = String.fromCharCode(28);
const SEQ_DIV    = String.fromCharCode(29);
const ENTRY_DIV  = String.fromCharCode(30);
const WEIGHT_DIV = String.fromCharCode(31);


const messages = [
	'hello',
	'hello.',
	'ah! hello.'
];

const sampleMapping = engine.encodeMessages(messages);



test.group('stats', (test)=>{
	test('can extract stats', (t)=>{
		const {stats, mapping} = engine.utils.extractStats(sampleMapping);

		t.is(stats.msgs, messages.length);
		t.is(stats.letters, messages.reduce((a, m)=>a+m.length, 0));

		t.type(mapping, 'string');
		t.ok(mapping.length > 0);
	})

	test('empty mapping returns default values', (t)=>{
		const {stats, mapping} = engine.utils.extractStats();

		t.is(stats.msgs,0);
		t.is(stats.letters, 0);

		t.type(mapping, 'string');
		t.ok(mapping.length == 0);
	});


	test('adding new messages updates stats properly', (t)=>{
		const newMessages = ['why hello', 'who is this?'];
		const newMapping = engine.encodeMessages(newMessages, sampleMapping);

		const {stats} = engine.utils.extractStats(newMapping);

		t.is(stats.msgs, messages.length + newMessages.length);
		t.is(stats.letters,
			messages.reduce((a, m)=>a+m.length, 0) +
			newMessages.reduce((a, m)=>a+m.length, 0)
		);
	});
})



test.skip('test', (t)=>{
	const mapping = engine.encodeMessages([
		'hello',
		'hello.',
		'oh hello.'
	]);

	console.log(mapping);

	const res = utils.decodeMapping(mapping);

	console.log(JSON.stringify(res, null, '  '));


})

test('Encode and generate', (t)=>{
	const res = engine.generateMessage(engine.encodeMessages(messages));

	t.ok(messages.includes(res.message));
});

test('large scale generate', (t)=>{
	const msgSet = new Set();
	times(10000, ()=>{
		msgSet.add(engine.generateMessage(sampleMapping).message);
	});

	t.is(msgSet.size, messages.length);
	t.ok(messages.every((msg)=>msgSet.has(msg)))
});


test('Encode multiple times', (t)=>{

	const encodeTimes = 6;
	let map = '';
	times(encodeTimes, ()=>{
		map = engine.encodeMessages(['hello'], map);
	});

	t.is(map.split(ENTRY_DIV).length, encodeTimes + 2)
})



test.group('utils', (test)=>{

	test.group('encode & decode', (test)=>{
		test('base', (t)=>{
			const weights = {a:35,'6':7,' ':234564,'$':34, '\n':1};
			const res = utils.decodeFragment(utils.encodeFragment('test', weights));
			t.is(res, {
				seq : 'test',
				weights,
				total: 234641
			})
		});

	});


	test.group('weightedRandom', (test)=>{
		test('one option', (t)=>{
			const res = utils.weightedRandom({a:1}, 1);
			t.is(res, 'a');
			const res2 = utils.weightedRandom({a:100}, 100);
			t.is(res2, 'a');
		});

		test('gets a', (t)=>{
			let res, count=0;
			while(res != 'a'){
				res = utils.weightedRandom({a:1, b:2}, 3);
				if(count++ > 1000) t.fail();
			}
			t.pass();
		});
		test('gets b', (t)=>{
			let res, count=0;
			while(res != 'b'){
				res = utils.weightedRandom({a:1, b:2}, 3);
				if(count++ > 1000) t.fail();
			}
			t.pass();
		})
	});


	test('findFragment', (t)=>{
		const res = utils.findFragment(sampleMapping, 'hello');
		t.is(res.total, 2);
		t.type(res.total, 'number');

		t.is(res.weights['.'], 1);
		t.is(res.weights[END_MSG], 1);

		const nope = utils.findFragment(sampleMapping, 'does not exist');
		t.no(nope);
	});

	test.group('addFragmentToMapping', (test)=>{

		test('empty', (t)=>{
			const temp = {
				seq : 'test',
				weights : {a:4, b:5}
			}
			const map = utils.addFragmentToMapping('', temp.weights, temp.seq);
			t.is(map.split(ENTRY_DIV).length, 3);
			const frag = utils.findFragment(map, temp.seq);
			t.is(frag, {...temp, total : 9, start:1, end: 11})
		})
		test('add multiple frags', (t)=>{
			let map = utils.addFragmentToMapping('', {a:4, b:5}, 'test');
			t.is(map.split(ENTRY_DIV).length, 3);
			map = utils.addFragmentToMapping(map, {a:1, c:5}, 'test');

			t.is(map.split(ENTRY_DIV).length, 3);
			map = utils.addFragmentToMapping(map, {c:6}, 'test2');
			t.is(map.split(ENTRY_DIV).length, 4);

			const {fragments} = utils.decodeMapping(map);
			t.is(fragments.test, { seq: 'test', total: 15, weights: { a: 5, b: 5, c: 5 } })
			t.is(fragments.test2, { seq: 'test2', total: 6, weights: { c: 6 } })
		})
	});

	test('mergeWeights', (t)=>{
		const res = utils.mergeWeights({b:1, c:3}, {b:1, a:1});
		t.is(res.a,1);
		t.is(res.b,2);
		t.is(res.c,3);
		t.type(res.a, 'number')
	});
})





test.group('generate fragments', (test)=>{
	test('base case', (t)=>{
		const frags = engine.utils.generateFragments('hello.');
		t.is(frags[''], {h:1});
		t.is(frags['hell'], {o:1});
		t.is(frags['hello.'], {[END_MSG]:1});
	});

	test('mutiple repeats', (t)=>{
		const frags = engine.utils.generateFragments('hello. hello. hello.');
		t.is(frags['ello. '], {h:2});
		t.is(frags['hello.'], {' ':2, [END_MSG]:1});
	});
});


test.group('encode messages', (test)=>{

})

// test.group('extend mapping', (test)=>{
// 	test('empty mapping', (t)=>{
// 		const map = engine.extendMapping('', {'test' : {h:4}});
// 		const entries = utils.decodeMapping(map);
// 		t.is(entries.test, {seq:'test', total : 4, weights:{h:4}});
// 	});
// 	test('nonempty mapping', (t)=>{
// 		const map = engine.extendMapping(sampleMapping, {'hello': {a:1, d:8}});
// 		const entries =  utils.decodeMapping(map);

// 		t.is(entries['seq'].seq, 'seq');
// 		t.is(entries['seq'].weights, {a:4});

// 		t.is(entries['hello'].seq, 'hello');
// 		t.is(entries['hello'].weights, { '6': 7, a: 4, b: 6, c: 6, d: 8 });

// 		t.is(entries['test'].seq, 'test');
// 		t.is(entries['test'].weights, {a:4});
// 	});

// 	test('multiple fragments', (t)=>{
// 		const map = engine.extendMapping(sampleMapping, {'hello': {a:1, d:8}, 'test': {a:1, b:5}});
// 		const entries =  utils.decodeMapping(map);

// 		t.is(entries['hello'].seq, 'hello');
// 		t.is(entries['hello'].weights, { '6': 7, a: 4, b: 6, c: 6, d: 8 });

// 		t.is(entries['test'].seq, 'test');
// 		t.is(entries['test'].weights, {a:5, b:5});
// 	})

// });


test('generate message', (t)=>{
	const input = 'hello.'
	const mapping = engine.encodeMessages([input]);
	const msg = engine.generateMessage(mapping);
	t.is(msg.message, input);
});

module.exports = test;