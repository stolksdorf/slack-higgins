const _      = require('lodash');
const google = require('google-it');
const xkcd   = require('xkcd');

const formatReply = (comic) => {
	return {
		attachments : [
			{
				title      : comic.safe_title,
				title_link : `https://xkcd.com/${comic.num}/`,
				image_url  : comic.img
			}, {
				text : comic.alt
			}
		]
	};
};

const fetchComic = (id) => {
	return new Promise((resolve, reject) => {
		try {
			if (!id) {
				return xkcd(resolve);
			}
			return xkcd(_.toInteger(id), resolve);
		} catch (err) {
			return reject(err);
		}
	});
};

module.exports = {
	url    : '/xkcd',
	handle : async (msg, info, reply, error) => {
		try {
			// If user did not supply any params, they just want the latest comic.
			if (!msg) {
				const comic = await fetchComic();
				return reply(formatReply(comic));
			}

			// If user entered `/xkcd #<num>`, they're requesting a specific comic by ID.
			const matches = msg.match(/^\s*#(\d+)\s*$/);
			if (_.has(matches, 1)) {
				const comic = await fetchComic(matches[1]);
				return reply(formatReply(comic));
			}

			// Otherwise, let's try to search for the most relevant comic via keywords.
			const results = await google({ query: `site:xkcd.com ${msg}` });

			// Find the first google result that is for an explicit comic page.
			const foundComic = _.reduce(results, (foundComic, { link }) => {
				return foundComic || _.get(link.match(/^https?:\/\/(?:www\.)?xkcd.com\/(\d+)\/?$/), 1);
			}, false);

			if (!foundComic) {
				throw 'Could not find any comics using those keywords.  Try something else!';
			}

			return reply(formatReply(await fetchComic(foundComic)));
		} catch (err) {
			return error(err);
		}
	},
};
