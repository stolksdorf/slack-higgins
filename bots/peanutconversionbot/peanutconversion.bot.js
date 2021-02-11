const _ = require('lodash')
const Slack = require('pico-slack')

const REGEX = /([\d,.]+)[ -_]*(?:lbs?|pounds?)(?!\w)/g
const PEANUT_WEIGHT = { lb: 4, kg: 1.8 }


const findMatches = (text) => {
	return [...text.matchAll(regex)].map((_, weightString, units) => {
		return {
			weight: Number(weightString),
			units,
		}
	})
}


const translateWeights = (matches) => {
	const lines = _.map(weights, ({ weight, unit }) => {
	})
}


const constructMessage = (lines) => {
}


const messageHandler = (msg) => {
	const weights = findMatches(msg.text)
	Slack.send(msg.channel, _.join(lines, '\n'))
}


Slack.onMessage(messageHandler)


module.exports = {
	messageHandler,
	findMatches,
	translateWeights,
	constructMessage,
}
