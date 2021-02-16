const Slack = require('pico-slack')

const peanut = require('./logic.js')

const messageHandler = (msg) => {
	const weights = peanut.findWeights(msg.text)
	if(weights.length < 1) return
	const convertedWeights = peanut.convertWeights(weights)
	const outgoingMsg = peanut.constructMessage(convertedWeights)
	Slack.send(msg.channel, outgoingMsg)
}

Slack.onMessage(messageHandler)

module.exports = { messageHandler }
