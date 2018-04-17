module.exports = {
	notFound : (msg, Care)=>{
		`Sorry, I couldn't find anything. I've given a care-human a heads up about your question and they'll be reaching out to you shortly.`

		`looks like ${msg.user} tried asking: \n > ${msg.text} \n But I couldn't find anything related. Can someone reach out to them? And possibly update the docs here: ${Care.docsSource}`

	},
	notHappy : (msg, doc, Care)=>{
		`looks like ${msg.user} tried asking: \n > ${msg.text}`
	}
}