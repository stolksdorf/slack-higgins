var request = require('request');

module.exports = function(msg, info, reply, error) {
	if (!msg) {
		// No parameters means they want a list of available memes.
		return request.get({
			url: 'http://memeapi.com/list.php',
			json: true
		}, function(req, res, body) {
			return reply({
				text : body.memes.join('\n'),
				response_type : 'ephemeral'
			});
		});
	}

	return reply({
		attachments: [
			{
				title : msg,
				title_link : 'http://memeapi.com/find.php?name=' + encodeURIComponent(msg),
				image_url : 'http://memeapi.com/find.php?name=' + encodeURIComponent(msg)
			}
		]
	});
};
