const proxyquire = require('proxyquire')
const sinon = require('sinon')
const test = require('pico-check')

const peanut = require('../logic.js')


test.group('`findWeights()`', (test) => {
	test.group('negatives', (test) => {
		[
			'8 ponds',
			'ohai',
			'that is 8 kilometers away',
			'i mean, 8 kilometres',
			'who needs more than 256 kilobytes of memory, anyway',
			'roger, 8kga',
			'the baker pounds the dough',
			'https://open.spotify.com/track/6XXNno2uNgLTt6YeM6hBBc?si=XEjvsf88TZahYDhbWF6Qkg',
		].map((input) => {
			test(`input: ${input}`, (t) => {
				const matches = peanut.findWeights(input)
				t.is(matches.length, 0)
			})
		})
	})

	test.group('trivial', (test) => {
		[
			['8 lbs', 8, 'lb'],
			['8 lb', 8, 'lb'],
			['8lb', 8, 'lb'],
			['8 pounds', 8, 'lb'],
			['8-pound', 8, 'lb'],
			['8 pound', 8, 'lb'],
			['8pounds', 8, 'lb'],
			['4 kg', 4, 'kg'],
			['4kg', 4, 'kg'],
			['4 kgs', 4, 'kg'],
			['4 kilo', 4, 'kg'],
			['4-kilo', 4, 'kg'],
			['4-kilogram', 4, 'kg'],
			['4 kilograms', 4, 'kg'],
			['4 kilos', 4, 'kg'],
			['4kilos', 4, 'kg'],
			[' 4 kilos\t', 4, 'kg'],
			['(4 kilos)', 4, 'kg'],
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
			this is a crazy european number: 4 000 000,05 pounds sterling (reads incorrectly but meh)
			here's another one: 4.000.000,04 pounds sterling (ignored)
		`)

		t.is(matches, [
			{ weight: 10000, units: 'lb' },
			{ weight: 4.9, units: 'kg' },
			{ weight: 4531.024, units: 'kg' },
			{ weight: 5, units: 'lb' },
		])
	})
})


test.group('`convertWeights()`', (test) => {
	test('empty', (t) => {
		const output = peanut.convertWeights([])
		t.is(output, [])
	})
	test('kilograms', (t) => {
		const output = peanut.convertWeights([
			{ weight: 12.6, units: 'kg' },
			{ weight: 180, units: 'kg' },
		])
		t.is(output, [
			{ weight: 12.6, units: 'kg', converted: 7 },
			{ weight: 180, units: 'kg', converted: 100 },
		])
	})
	test('pounds', (t) => {
		const output = peanut.convertWeights([{ weight: 140, units: 'lb' }])
		t.is(output, [{ weight: 140, units: 'lb', converted: 35 }])
	})
	test('nasty decimal', (t) => {
		const output = peanut.convertWeights([{ weight: 4531.024, units: 'kg' }])
		t.is(output.length, 1)
		t.is(output[0].weight, 4531.024)
		t.is(output[0].units, 'kg')
		// ¯\_(ツ)_/¯
		t.is(Math.floor(output[0].converted), 2517)
	})
})


test.group('`constructMessage()`', (test) => {
	test('empty', (t) => {
		const message = peanut.constructMessage([])
		t.is(message, '')
	})
	test('single', (t) => {
		const convertedWeights = [{ weight: 4, units: 'lb', converted: 1 }]
		const message = peanut.constructMessage(convertedWeights)
		t.is(message, '4 lb is 1 :peanuts:')
	})
	test('multiline', (t) => {
		const convertedWeights = [
			{ weight: 4, units: 'lb', converted: 1 },
			{ weight: 180, units: 'kg', converted: 100 },
			{ weight: 25000, units: 'lb', converted: 6250 },
		]
		const message = peanut.constructMessage(convertedWeights)
		t.is(
			message,
			'4 lb is 1 :peanuts:\n' +
			'180 kg is 100 :peanuts:\n' +
			'25000 lb is 6250 :peanuts:'
		)
	})
})


test.group('bot main', (test) => {
	const slackStub = {
		send: sinon.spy(),
		onMessage: sinon.spy(),
	}
	const pcb = proxyquire('../peanutconversion.bot.js', { 'pico-slack': slackStub })

	test('attaches Slack message listener on require', (t) => {
		t.is(slackStub.onMessage.calledOnce, true)
	})

	test.group('`messageHandler()`', (test) => {
		test('no match', (t) => {
			slackStub.send.resetHistory()
			pcb.messageHandler({ channel: '#general', text: "this is just a regular ol' message" })
			t.is(slackStub.send.notCalled, true)
		})
		test('match (lb)', (t) => {
			slackStub.send.resetHistory()
			pcb.messageHandler({ channel: '#warriors', text: 'omg the elephant weighs 100 pounds' })
			t.is(slackStub.send.calledOnceWithExactly('#warriors', '100 lb is 25 :peanuts:'), true)
		})
		test('match (kg)', (t) => {
			slackStub.send.resetHistory()
			pcb.messageHandler({ channel: '#warriors', text: 'omg the elephant weighs 180 kg' })
			t.is(slackStub.send.calledOnceWithExactly('#warriors', '180 kg is 100 :peanuts:'), true)
		})
	})
})


module.exports = test
