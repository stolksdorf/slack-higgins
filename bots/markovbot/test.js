const test = require('pico-check');

const S3 = require('./s3.js');
const engine = require('./engine.js');

const sampleMapping =
`seq|a:4
hello|a:3,b:6,c:6,6:7
test|a:4`





test.group('engine', (test)=>{

	test('getWeights', (t)=>{
		const res = engine.getWeights(sampleMapping, 'hello');

		t.is(res.total, 22);
		t.type(res.total, 'number');

		t.is(res.weights.a, 3);
		t.is(res.weights['6'], 7);

		const nope = engine.getWeights(sampleMapping, 'nope');
		t.no(nope);
	});

})


module.exports = test;