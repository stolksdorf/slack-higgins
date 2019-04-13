const test = require('pico-check');
const reduce = (obj,fn,init)=>Object.keys(obj).reduce((a,key)=>fn(a,obj[key],key),init);


const engine = require('./engine.js');

const sampleMapping =
`seq⇢a।4
hello⇢a।3˲b।6˲c।6˲6।7
test⇢a।4`;


test.group('weightedRandom', (test)=>{
	test('one option', (t)=>{
		const res = engine.weightedRandom({a:1}, 1);
		t.is(res, 'a');
		const res2 = engine.weightedRandom({a:100}, 100);
		t.is(res2, 'a');
	});

	test('gets a', (t)=>{
		let res, count=0;
		while(res != 'a'){
			res = engine.weightedRandom({a:1, b:2}, 3);
			if(count++ > 100) t.fail();
		}
		t.pass();
	});
	test('gets b', (t)=>{
		let res, count=0;
		while(res != 'b'){
			res = engine.weightedRandom({a:1, b:2}, 3);
			if(count++ > 100) t.fail();
		}
		t.pass();
	})
})





test('findEntry', (t)=>{
	const res = engine.findEntry(sampleMapping, 'hello');

	t.is(res.total, 22);
	t.type(res.total, 'number');

	t.is(res.weights.a, 3);
	t.type(res.weights.a, 'number');
	t.is(res.weights['6'], 7);

	const nope = engine.findEntry(sampleMapping, 'does not exist');
	t.no(nope);
});


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
		const map = engine.extendMapping('test', {h:4});
		t.is(map, `test⇢h।4`);
	});
	test('nonempty mapping', (t)=>{
		const map = engine.extendMapping('hello', {a:1, d:8}, sampleMapping);
		t.is(map, `seq⇢a।4
hello⇢6।0˲a।4˲d।8˲b।0˲c।0
test⇢a।4`);
	})

});

test.only()('mergeWeights', (t)=>{
	const res = engine.mergeWeights({b:1, c:3}, {b:1, a:1});
	t.is(res.a,1);
	t.is(res.b,2);
	t.is(res.c,3);
	t.type(res.a, 'number')
})

test('generate message', (t)=>{
	const frags = engine.generateFragments('hello.');
	const mapping = reduce(frags, (map, weights, seq)=>{
		return engine.extendMapping(seq, weights, map);
	}, '');
	const msg = engine.generateMessage(mapping);
	t.is(msg, 'hello.')
})





module.exports = test;