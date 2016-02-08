var _      = require('lodash');
var google = require('google');
var xkcd   = require('xkcd');

var ERR_NOT_FOUND = 'Could not find any comics using those keywords.  Try something else!';

module.exports = function(msg, info, reply, error) {
	google('site:xkcd.com ' + msg, function(err, nextPage, links) {
		try {
			if (err) {
				return error(err);
			}

			if (links.length < 1) {
				return error(ERR_NOT_FOUND);
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

				try {
					var comicId = Number(matches[1]);
				} catch (err) {
					return error(new Error('Parsed out a comic ID but failed to cast to Number... ' + JSON.stringify(matches)));
				}

				try {
					xkcd(comicId, function(data) {
						try {
							return reply({
								attachments: [
									{
										title : data.safe_title,
										title_link : link.href,
										image_url : data.img
									}, {
										text : data.alt
									}
								]
							});
						} catch (err) {
							return error(err);
						}
					});
				} catch (err) {
					return error(new Error('xkcd() threw an error; this should not really happen... ' + JSON.stringify(matches)));
				}

				return true;
			}, false);

			if (!foundComic) {
				return error(ERR_NOT_FOUND);
			}
		} catch (err) {
			return error(err);
		}
	});
};
