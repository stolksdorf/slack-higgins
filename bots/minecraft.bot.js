const _ = require('lodash');
const Config = require('pico-conf');
const Slack = require('pico-slack');
const RCon = require('rcon');

const ASKING_FOR_NOW = /(?:any\s*one|any\s*body).*(?:on|playing).*/i;
const ASKING_FOR_LATER = /(?:when|any\s*one|any\s*body).*(?:planning|going|thinking).*(?:be on|playing|hopping on).*/i;

Slack.onMessage(async (msg) => {
	if (msg.channel != 'minecraft' && !msg.isDirect) {
		return;
	}

	const whosOnlineNow = msg.text.match(ASKING_FOR_NOW);
	const whosOnlineLater = msg.text.match(ASKING_FOR_LATER);

	if (!whosOnlineNow && !whosOnlineLater) {
		return;
	}

	Slack.react(msg, 'thinking_face_b');

	try {
		const reply = await makeReply(whosOnlineNow, whosOnlineLater);
		Slack.sendAs('minecraft', 'creeper', msg.channel_id, reply);
	} catch (err) {
		Slack.error(err);
	}
});

const makeReply = async (whosOnlineNow, whosOnlineLater) => {
	const players = await fetchPlayers();

	if (whosOnlineNow) {
		if (players.length > 0) return `Yes!! There ${plural(players, 'is', 'are')} currently *${players.length} ${plural(players, 'peep', 'peeps')} online*: ${players.join(', ')}`;
		return "Nope, *nobody's online* right now. Sorry!";
	}
	if (whosOnlineLater) {
		if (players.length > 0) return `If you're quick :woman-running: you can catch the *${players.length} ${plural(players, 'person', 'people')} online*, but I dunno how long they're sticking around!! (${players.join(', ')})`;
		return "I dunno know about _later_... but *nobody's online* right now. ¯\\_(ツ)_/¯";
	}
};

const fetchPlayers = () => {
	return new Promise((resolve, reject) => {
		const client = new RCon('minecraft.jaredtyler.ca', '25575', Config.get('minecraftbot.rcon_password'));

		client.on('auth', () => {
			client.send('list');
		}).on('response', (str) => {
			client.disconnect();

			const matches = str.match(/^There are \d+ of a max \d+ players online:(.*)$/);
			if (!matches || !matches[1]) {
				return reject();
			}

			const players = _.trim(matches[1]);
			if (!players) return resolve([]);
			return resolve(players.split(', '));
		}).on('error', reject);

		client.connect();
	});
};

const plural = (collection, singular, plural) => {
	return collection.length == 1 ? singular : plural;
};
