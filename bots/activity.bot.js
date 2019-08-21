const _ = require('lodash');
const config = require('pico-conf');
const Slack = require('pico-slack');


const DEBUG = config.get('activitybot.debug');
const TARGET_CHANNEL = config.get('activitybot.target_channel');

const MESSAGE_COUNT_THRESHOLD = _.parseInt(
	config.get('activitybot.threshold.message_count')
);
const THRESHOLD_SECONDS = _.parseInt(
	config.get('activitybot.threshold.seconds')
);
const COOLDOWN_SECONDS = _.parseInt(
	config.get('activitybot.cooldown_seconds')
);

const IGNORED_CHANNELS = config.get('activitybot.ignored_channels').split(',')

const coolingChanels = {};
const messageTimestamps = {};


const unixNow = () => Math.floor(Date.now() / 1000);

/**
 * Add `msg`'s timestamp as UNIX epoch to the end of the array for
 * the message's channel, initializing the array if necessary.
 * The timestamps are appended, meaning that the array should be sorted,
 * more or less.
 */
const tallyMessage = (msg) => {
	if (_.in(msg.channel, IGNORED_CHANNELS)) {
		return;
	}
	const channelKey = `${msg.channel_id}|${msg.channel}`;
	if (!_.has(messageTimestamps, channelKey)) {
		messageTimestamps[channelKey] = [];
	}
	const unixTimestamp = Math.floor(msg.ts * 1000);
	messageTimestamps[channelKey].push(unixTimestamp)
};

/**
 * Remove from `timestamps` (array) the timestamps that are outside
 * the specified `thresholdSeconds`. Return the surviving timestamps
 * in a new array.
 */
const cullTimestamps = (timestamps, thresholdSeconds) => {
	const minimumTimestamp = unixNow() - thresholdSeconds;
	const cutoffIndex = _.sortedIndex(timestamps, minimumTimestamp);
	return _.slice(timestamps, cutoffIndex);
};

/**
 * Check whether channel with `channelKey` is on cooldown.
 * Update the `coolingChannels` object and
 * return true if the channel is on cooldown, else false.
 */
const checkChannelCooldown = (channelKey) => {
	if (!_.has(coolingChannels, channelKey)) {
		// channel not on cooldown
		return false;
	}
	if (unixNow() - COOLDOWN_SECONDS > coolingChannels[channelKey]) {
		// channel is now off cooldown
		delete coolingChannels[channelKey];
		return false;
	}
	return true;
};

/**
 * Identify channels that have had activity that exceeds the configured
 * thresholds and notify #general about them.
 */
const checkForActivityBursts = () => {
	_.forEach(messageTimestamps, (timestamps, channelKey) => {
		const channelIsOnCooldown = checkChannelCooldown(channelKey);
		if (channelIsOnCooldown) return;

		timestamps = cullTimestamps(timestamps, THRESHOLD_SECONDS);
		if (DEBUG) {
			Slack.log(
				`[ActivityBot]: Culled <#${channelKey}> timestamps: ${timestamps}`
			);
		}
		if (timestamps.length >= MESSAGE_COUNT_THRESHOLD) {
			Slack.send(
				TARGET_CHANNEL,
				`Something's going down in <#${channelKey}>!`
			);
			coolingChannels[channelKey] = unixNow();
			delete messageTimestamps[channelKey];
		}
	});
};


Slack.onMessage(tallyMessage);
setInterval(checkForActivityBursts, 30*1000);
