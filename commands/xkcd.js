var _      = require('lodash');
var google = require('google');
var xkcd   = require('xkcd');

var ERR_NOT_FOUND = 'Could not find any comics using those keywords.  Try something else!';

var formatReply = function(comic) {
	return {
		attachments: [
			{
				title      : comic.safe_title,
				title_link : 'https://xkcd.com/' + comic.num + '/',
				image_url  : comic.img
			}, {
				text : comic.alt
			}
		]
	};
};

var fetchComic = function(id, done) {
	if (typeof id === 'function' && typeof done === 'undefined') {
		done = id;
		id = null;
	} else {
		try {
			id = Number(id);
		} catch (err) {
			return done(err);
		}
	}

	try {
		if (id === null) {
			return xkcd(function(data) {
				return done(null, data);
			});
		}

		return xkcd(id, function(data) {
			return done(null, data);
		});
	} catch (err) {
		return done(err);
	}
};

module.exports = function(msg, info, reply, error) {
	// If user did not supply any params, they want the latest comic.
	if (!msg) {
		return fetchComic(function(err, comic) {
			if (err) {
				err.message += ' ' + JSON.stringify(matches);
				return error(err);
			}
			return reply(formatReply(comic));
		});
	}

	// If user entered `/xkcd #<num>`, they're requesting a specific comic by ID.
	var matches = msg.match(/^[\s]*#([\d]+)[\s]*$/);
	if (matches !== null && matches.length > 1 && matches[1]) {
		return fetchComic(matches[1], function(err, comic) {
			if (err) {
				err.message += ' ' + JSON.stringify(matches);
				return error(err);
			}
			return reply(formatReply(comic));
		});
	}

	// Otherwise, let's try to find the most relevant comic via keywords.
	return google('site:xkcd.com ' + msg, function(err, nextPage, links) {
		try {
			if (err) {
				return error(err);
			}

			if (links.length < 1) {
				return error(ERR_NOT_FOUND);
			}

			var foundComic = _.reduce(links, function(foundComic, link) {
				if (foundComic) {
					// Already found the most relevant comic, so skip to the end.
					return foundComic;
				}

				// Check if google result is for an explicit comic page.
				var matches = link.href.match(/^https?:\/\/xkcd.com\/([\d]+)\/?$/);
				if (matches === null || matches.length < 2 || !matches[1]) {
					// Link does not point to an explicit comic page, try the next one.
					return false;
				}

				// Found one!
				fetchComic(matches[1], function(err, comic) {
					if (err) {
						err.message += ' ' + JSON.stringify(matches);
						return error(err);
					}
					return reply(formatReply(comic));
				});

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
