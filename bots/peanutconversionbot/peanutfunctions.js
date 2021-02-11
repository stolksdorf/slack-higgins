const _ = require('lodash')

const REGEX = /([\d,.]+)[ -_]*(lb|pound|kg|kilo(?:gram)?)s?(?!\w)/g
const PEANUT_WEIGHT = { lb: 4, kg: 1.8 }


const findWeights = (text) => {
	return [...text.matchAll(REGEX)].map(([undefined, weightString, unitString]) => {
		const units = unitString[0] == 'k' ? 'kg' : 'lb'
		// strip commas and spaces; does not work on european-style numbers
		const strippedWeightString = weightString.replace(/[, ]/g, '')
		const weight = Number(strippedWeightString)
		if (_.isNaN(weight)) return null
		return { weight, units }
	}).filter(Boolean)
}


const convertWeights = (weights) => {
	return weights.map(({ weight, units }) => {
		return {
			converted: weight / PEANUT_WEIGHT[units],
			weight,
			units,
		}
	})
}


const constructMessage = (convertedWeights) => {
	const lines = convertedWeights.map(({ weight, units, converted }) => {
		return `${weight} ${units} is ${converted} :peanuts:`
	}, '')
	return lines.join('\n')
}


module.exports = {
	findWeights,
	convertWeights,
	constructMessage,
}
