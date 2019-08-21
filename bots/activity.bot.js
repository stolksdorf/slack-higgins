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

const IGNORED_CHANNELS = config.get('activitybot.ignored_channels').split(',')


const messageTimestampsByChannelKey = {};


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
	if (!_.has(messageTimestampsByChannelKey, channelKey)) {
		messageTimestampsByChannelKey[channelKey] = [];
	}
	const unixTimestamp = Math.floor(msg.ts * 1000);
	messageTimestampsByChannelKey[channelKey].push(unixTimestamp)
};

/**
 * Remove from `timestamps` (array) the timestamps that are outside
 * the specified `thresholdSeconds`. Return the surviving timestamps
 * in a new array.
 */
const cullTimestamps = (timestamps, thresholdSeconds) => {
	const minimumTimestamp = Math.floor(Date.now() / 1000) - thresholdSeconds;
	const cutoffIndex = _.sortedIndex(timestamps, minimumTimestamp);
	return _.slice(timestamps, cutoffIndex);
};

/**
 * Identify channels that have had activity that exceeds the configured
 * thresholds and notify #general about them.
 */
const checkForActivityBursts = () => {
	_.forEach(messageTimestampsByChannelKey, (timestamps, channelKey) => {
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
		}
	});
};


Slack.onMessage(tallyMessage);
setInterval(checkForActivityBursts, 30*1000);
