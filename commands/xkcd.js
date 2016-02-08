var _      = require('lodash');
var google = require('google');
var xkcd   = require('xkcd');

google.resultsPerPage = 1;

module.exports = function(msg, info, reply){
	google('site:xkcd.com ' + msg, function(err, nextPage, links) {
		try {
			if (links.length < 1) {
				// TODO: Tell user if their keywords resulted in absolutely nothing.
				return reply({
					response_type : 'ephemeral',
					text : 'nawp'
				});
			}
			var url = links[0].href;
			// TODO: check  if 'url' is NOT a direct comic page, then try next link
			var matches = url.match(/^https?:\/\/xkcd.com\/([\d]+)\/?$/);
			if (matches === null || matches.length < 2 || !matches[1]) {
				// TODO: couldn't find match
				return reply({
					response_type : 'ephemeral',
					text : 'nawp 2 -- ' + url
				});
			}
			// TODO: try
			var comicId = Number(matches[1]);
			xkcd(comicId, function(data) {
				try {
					// TODO: handle if no comic was found
					return reply({
						text: '*' + data.safe_title + '*',
						attachments: [{
							image_url: data.img,
							text: data.alt
						}]
					});
				} catch (err) {
					return reply({
						response_type : 'ephemeral',
						text : 'nawp 3'
					});
				}
			});
		} catch (err) {
			return reply({
				response_type : 'ephemeral',
				text : 'nawp 4'
			});
		}
	});
};
