const Slack = require('pico-slack')

const peanut = require('./peanutfunctions.js')

const messageHandler = (msg) => {
	const weights = peanut.findMatches(msg.text)
	const convertedWeights = peanut.convertWeights(weights)
	const outgoingMsg = fns.constructMessage(convertedWeights)
	Slack.send(msg.channel, outgoingMsg)
}

module.exports = () => {
	Slack.onMessage(messageHandler)
}
