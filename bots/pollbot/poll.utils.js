const emojis = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'a', 'b'];

const processPollMessage = (msg='')=>{
	const text = msg.trim();
	if(!text) return {};
	const [question, rest] = text.split('?');
	if(!rest) return {};
	const options = rest.split(',');
	return {
		question : question.trim(),
		options : options.map(opt=>opt.trim())
	}
}

const getMessage = (question, options)=>{
	return `*${question}?*\n${options.map((opt, idx)=>`:${emojis[idx]}: ${opt}`).join('\n')}`
}

const getHelpMessage = ()=>{
	return `To create a poll, make a message in the following format:
\`poll: Would you like go bowling? yes, fuck yeah, 10-4 lil buddy\`
or
\`/poll Would you like go bowling? yes, fuck yeah, 10-4 lil buddy\`
`
}

module.exports = { processPollMessage, getHelpMessage, getMessage, emojis }