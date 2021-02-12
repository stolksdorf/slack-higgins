const Slack = require('pico-slack')

const peanut = require('./peanutfunctions.js')

const messageHandler = (msg) => {
	const weights = peanut.findWeights(msg.text)
	const convertedWeights = peanut.convertWeights(weights)
	const outgoingMsg = peanut.constructMessage(convertedWeights)
	Slack.send(msg.channel, outgoingMsg)
}

module.exports = {
	messageHandler,
	load: () => {
		Slack.onMessage(messageHandler)
	}
}
