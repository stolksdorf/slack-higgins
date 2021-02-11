const test = require('pico-check');

const peanut = require('../peanutfunctions.js');


test.group('`findWeights()`', (test) => {
	test.group('trivial', (test) => {
		[
			['8 lbs', 8, 'lb'],
			['8 lb', 8, 'lb'],
			['8lb', 8, 'lb'],
			['8 pounds', 8, 'lb'],
			['8-pound', 8, 'lb'],
			['8 pound', 8, 'lb'],
			['8 pounds', 8, 'lb'],
			['4 kg', 4, 'kg'],
			['4kg', 4, 'kg'],
			['4 kgs', 4, 'kg'],
			['4 kilo', 4, 'kg'],
			['4-kilo', 4, 'kg'],
			['4-kilogram', 4, 'kg'],
			['4 kilograms', 4, 'kg'],
			['4 kilos', 4, 'kg'],
			[' 4 kilos\t', 4, 'kg'],
			['0 lbs', 0, 'lb'],
		].map(([input, expectedWeight, expectedUnits]) => {
			test(`input: '${input}'`, (t) => {
				const matches = peanut.findWeights(input)

				t.is(matches, [{ weight: expectedWeight, units: expectedUnits }])
			})
		})
	})

	test('longer message', (t) => {
		const matches = peanut.findWeights('did you hear about the 8-pound salami?')

		t.is(matches, [{ weight: 8, units: 'lb' }])
	})

	test('decimal', (t) => {
		const matches = peanut.findWeights('did you hear about the 2.1-pound dog?')

		t.is(matches, [{ weight: 2.1, units: 'lb' }])
	})

	test('formatted decimal', (t) => {
		const matches = peanut.findWeights('did you hear about the 1,234,567.8-pound dog?')

		t.is(matches.length, 1)
		t.is(matches, [{ weight: 1234567.8, units: 'lb' }])
	})

	test('complex', (t) => {
		const matches = peanut.findWeights(`
			did you hear about the 10,000-lb ant?
			no, but i did hear about a 4.9kg steak
			well the ant weighs a lot more - 4,531.024 kilos more!
			this is a crazy european number: 4 000 000,00 pounds sterling (ignored)
			here's another one: 4.000.000,00 pounds sterling
		`)

		t.is(matches, [
			{ weight: 10000, units: 'lb' },
			{ weight: 4.9, units: 'kg' },
			{ weight: 4531.024, units: 'kg' },
			{ weight: 4, units: 'lb' },
		])
	})
})


test.group('`convertWeights()`', (test) => {
	test('kilograms', (t) => {
		const output = peanut.convertWeights([{
			weight: 12.6,
			units: 'kg',
		}])
		t.is(output, [{
			weight: 12.6,
			units: 'kg',
			converted: 7,
		}])
	})
	test('pounds', (t) => {
		const output = peanut.convertWeights([{
			weight: 140,
			units: 'lb',
		}])
		t.is(output, [{
			weight: 140,
			units: 'lb',
			converted: 35,
		}])
	})
	test('nasty decimal', (t) => {
		const output = peanut.convertWeights([{
			weight: 4531.024,
			units: 'kg',
		}])
		t.is(output.length, 1)
		t.is(output[0].weight, 4531.024)
		t.is(output[0].units, 'kg')
		// ¯\_(ツ)_/¯
		t.is(Math.floor(output[0].converted), 2517)
	})
})


test.group('`constructMessage()`', (test) => {
	test('single', (t) => {
		const convertedWeights = [{ weight: 4, units: 'lb', converted: 1 }]
		const message = peanut.constructMessage(convertedWeights)
		t.is(message, '4 lb is 1 :peanuts:')
	})
	test('multiline', (t) => {
		const convertedWeights = [
			{ weight: 4, units: 'lb', converted: 1 },
			{ weight: 180, units: 'kg', converted: 10 },
			{ weight: 25000, units: 'lb', converted: 6250 },
		]
		const message = peanut.constructMessage(convertedWeights)
		t.is(
			message,
			'4 lb is 1 :peanuts:\n' +
			'180 kg is 10 :peanuts:\n' +
			'25000 lb is 6250 :peanuts:'
		)
	})
})


module.exports = test
