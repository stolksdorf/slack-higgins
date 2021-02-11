const test = require('pico-check');

const pcb = require('../peanutconversion.bot.js');


test.group('`findMatches()`', (test) => {
	test('trivial', () => {
		const matches = pcb.findMatches('8 lbs')

		t.is(matches.length, 1)
		const match = matches[0]

		t.is(match.weight, 8)
		t.is(match.units, 'lb')
	})
})


module.exports = test
