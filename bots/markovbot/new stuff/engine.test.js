const test = require('pico-check');
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);


const engine = require('./engine.js');

const sampleMapping =
`seq⇢a।4
hello⇢a।3˲b।6˲c।6˲6।7
test⇢a।4`;


test.group('utils', (test)=>{
	test.group('weightedRandom', (test)=>{
		test('one option', (t)=>{
			const res = engine.utils.weightedRandom({a:1}, 1);
			t.is(res, 'a');
			const res2 = engine.utils.weightedRandom({a:100}, 100);
			t.is(res2, 'a');
		});

		test('gets a', (t)=>{
			let res, count=0;
			while(res != 'a'){
				res = engine.utils.weightedRandom({a:1, b:2}, 3);
				if(count++ > 100) t.fail();
			}
			t.pass();
		});
		test('gets b', (t)=>{
			let res, count=0;
			while(res != 'b'){
				res = engine.utils.weightedRandom({a:1, b:2}, 3);
				if(count++ > 100) t.fail();
			}
			t.pass();
		})
	});


	test('findEntry', (t)=>{
		const res = engine.utils.findEntry(sampleMapping, 'hello');

		t.is(res.total, 22);
		t.type(res.total, 'number');

		t.is(res.weights.a, 3);
		t.type(res.weights.a, 'number');
		t.is(res.weights['6'], 7);

		const nope = engine.utils.findEntry(sampleMapping, 'does not exist');
		t.no(nope);
	});

	test.group('addFragmentToMapping', (test)=>{

		test('empty', (t)=>{
			const map = engine.utils.addFragmentToMapping('', 'test', {a:4, b:5});
			const line = engine.utils.decodeFragment(map);
			t.is(line, {seq: 'test', weights : {a:4, b:5}, total : 9})
		})
		test('add multiple frags', (t)=>{
			let map = engine.utils.addFragmentToMapping('', 'test', {a:4, b:5});
			map = engine.utils.addFragmentToMapping(map, 'test', {a:1, c:5});
			map = engine.utils.addFragmentToMapping(map, 'test2', {c:6});
			const lines = map.split('\n').map(engine.utils.decodeFragment);

			t.is(lines[0], { seq: 'test', total: 15, weights: { a: 5, b: 5, c: 5 } })
			t.is(lines[1], { seq: 'test2', total: 6, weights: { c: 6 } })
		})

	});


	test('mergeWeights', (t)=>{
		const res = engine.utils.mergeWeights({b:1, c:3}, {b:1, a:1});
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
		const lines = map.split('\n').map(engine.utils.decodeFragment);

		t.is(lines[0].seq, 'seq');
		t.is(lines[0].weights, {a:4});

		t.is(lines[1].seq, 'hello');
		t.is(lines[1].weights, { '6': 7, a: 4, b: 6, c: 6, d: 8 });

		t.is(lines[2].seq, 'test');
		t.is(lines[2].weights, {a:4});
	});

	test('multiple fragments', (t)=>{
		const map = engine.extendMapping(sampleMapping, {'hello': {a:1, d:8}, 'test': {a:1, b:5}});
		const lines = map.split('\n').map(engine.utils.decodeFragment);

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