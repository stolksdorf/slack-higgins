var _      = require('lodash');
var google = require('google');
var xkcd   = require('xkcd');

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
			var foundComic = _.reduce(links, function(foundComic, link) {
				if (foundComic) {
					return foundComic;
				}
				var matches = link.href.match(/^https?:\/\/xkcd.com\/([\d]+)\/?$/);
				if (matches === null || matches.length < 2 || !matches[1]) {
					// Link does not point to an explicit comic page, try the next one.
					return false;
				}
				// TODO: try
				var comicId = Number(matches[1]);
				xkcd(comicId, function(data) {
					try {
						// TODO: handle if no comic was found
						return reply({
							attachments: [
								{
									title : data.safe_title,
									title_link : link.href,
									image_url : data.img
								}, {
									text : '_' + data.alt + '_'
								}
							]
						});
					} catch (err) {
						return reply({
							response_type : 'ephemeral',
							text : 'nawp 3 -- ' + link.href + ' -- ' + comicId
						});
					}
				});
				return true;
			}, false);
			if (!foundComic) {
				return reply({
					response_type : 'ephemeral',
					text : 'nawp 2'
				});
			}
		} catch (err) {
			return reply({
				response_type : 'ephemeral',
				text : 'nawp 4'
			});
		}
	});
};
