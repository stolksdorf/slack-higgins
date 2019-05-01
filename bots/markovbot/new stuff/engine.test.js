const test = require('pico-check');
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);


const engine = require('./engine.js');
const utils = engine.utils;

const ENTRY_DIV=String.fromCharCode(30);


// const sampleMapping =
// 	utils.encodeFragment('seq', {a:4}) +
// 	utils.encodeFragment('hello', {a:3, b:6, c:6, '6':7}) +
// 	utils.encodeFragment('test', {a:4});


// const sampleMapping =
// `seq⇢a।4
// hello⇢a।3˲b।6˲c।6˲6।7
// test⇢a।4`;

let sampleMapping = '';
sampleMapping = utils.addFragmentToMapping(sampleMapping, 'seq', {a:4});
sampleMapping = utils.addFragmentToMapping(sampleMapping, 'hello', {a:3,b:6,c:6, '6':7});
sampleMapping = utils.addFragmentToMapping(sampleMapping, 'test', {a:4});


test.group('utils', (test)=>{

	test.group('encode & decode', (test)=>{
		test('base', (t)=>{
			const weights = {a:35,'6':7,' ':234564,'$':34};
			//console.log(utils.encodeFragment('test', weights));

			const res = utils.decodeFragment(utils.encodeFragment('test', weights));
			t.is(res, {
				seq : 'test',
				weights,
				total: 234640
			})
		})
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
				if(count++ > 100) t.fail();
			}
			t.pass();
		});
		test('gets b', (t)=>{
			let res, count=0;
			while(res != 'b'){
				res = utils.weightedRandom({a:1, b:2}, 3);
				if(count++ > 100) t.fail();
			}
			t.pass();
		})
	});


	test('findEntry', (t)=>{
		const res = utils.findEntry(sampleMapping, 'hello');

		t.is(res.total, 22);
		t.type(res.total, 'number');

		t.is(res.weights.a, 3);
		t.type(res.weights.a, 'number');
		t.is(res.weights['6'], 7);

		const nope = utils.findEntry(sampleMapping, 'does not exist');
		t.no(nope);
	});

	test.group('addFragmentToMapping', (test)=>{

		test('empty', (t)=>{
			const map = utils.addFragmentToMapping('', 'test', {a:4, b:5});
			const line = utils.decodeFragment(map);
			t.is(line, {seq: 'test', weights : {a:4, b:5}, total : 9})
		})
		test.only('add multiple frags', (t)=>{
			let map = utils.addFragmentToMapping('', 'test', {a:4, b:5});
			map = utils.addFragmentToMapping(map, 'test', {a:1, c:5});
			map = utils.addFragmentToMapping(map, 'test2', {c:6});


			const entry1 = utils.findEntry(map, 'test');
			const entry = utils.findEntry(map, 'test2');
			const lines = map.split(ENTRY_DIV).map(utils.decodeFragment);

			console.log(map);
			console.log(lines);

			t.is(lines[0], { seq: 'test', total: 15, weights: { a: 5, b: 5, c: 5 } })
			t.is(lines[1], { seq: 'test2', total: 6, weights: { c: 6 } })
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
		const frags = engine.generateFragments('hello.');
		t.is(frags[''], {h:1});
		t.is(frags['hell'], {o:1});
		t.is(frags['hello.'], {'¶':1});
	});

	test('mutiple repeats', (t)=>{
		const frags = engine.generateFragments('hello. hello. hello.');
		t.is(frags['ello. '], {h:2});
		t.is(frags['hello.'], {' ':2, '¶':1});
	});
});

test.group('extend mapping', (test)=>{
	test('empty mapping', (t)=>{
		const map = engine.extendMapping('', {'test' : {h:4}});
		t.is(map, `test⇢h।4`);
	});
	test('nonempty mapping', (t)=>{
		const map = engine.extendMapping(sampleMapping, {'hello': {a:1, d:8}});
		const lines = map.split(ENTRY_DIV).map(utils.decodeFragment);

		t.is(lines[0].seq, 'seq');
		t.is(lines[0].weights, {a:4});

		t.is(lines[1].seq, 'hello');
		t.is(lines[1].weights, { '6': 7, a: 4, b: 6, c: 6, d: 8 });

		t.is(lines[2].seq, 'test');
		t.is(lines[2].weights, {a:4});
	});

	test('multiple fragments', (t)=>{
		const map = engine.extendMapping(sampleMapping, {'hello': {a:1, d:8}, 'test': {a:1, b:5}});
		const lines = map.split(ENTRY_DIV).map(utils.decodeFragment);

		t.is(lines[1].seq, 'hello');
		t.is(lines[1].weights, { '6': 7, a: 4, b: 6, c: 6, d: 8 });

		t.is(lines[2].seq, 'test');
		t.is(lines[2].weights, {a:5, b:5});
	})

});


test('generate message', (t)=>{
	const frags = engine.generateFragments('hello.');
	const mapping = engine.extendMapping('', frags);
	const msg = engine.generateMessage(mapping);
	t.is(msg, 'hello.')
})





module.exports = test;