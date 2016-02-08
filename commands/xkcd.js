var _      = require('lodash');
var google = require('google');
var xkcd   = require('xkcd');

google.resultsPerPage = 1;

module.exports = function(msg, info, reply){
	google('site:xkcd.com ' + msg, function(err, nextPage, links) {
		if (links.length < 1) {
			// TODO: Tell user if their keywords resulted in absolutely nothing.
			throw new Error('nawp');
		}
		var url = links[0].href;
		// TODO: check  if 'url' is NOT a direct comic page, then try next link
		var matches = url.match(/^https?:\/\/xkcd.com\/([\d]+)\/?$/);
		if (matches === null || matches.length < 2 || !matches[1]) {
			// TODO: couldn't find match
			throw new Error('nawp 2');
		}
		// TODO: try
		var comicId = Number(matches[1]);
		xkcd(comicId, function(data) {
			// TODO: handle if no comic was found
			return reply({
				text: '*' + data.safe_title + '*',
				attachments: [{
					image_url: data.img,
					text: data.alt
				}]
			});
		});
	});
};
