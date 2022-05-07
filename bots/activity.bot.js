const _ = require('lodash');
const config = require('pico-conf');
const Slack = require('../utils/pico-slack');


const Gist = require('pico-gist')(config.get('github_token'));
const GistId = 'cd0ef3adbd53514767d6669cc959bc61';



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
const RUN_INTERVAL_SECONDS = _.parseInt(
	config.get('activitybot.run_interval_seconds')
);

const IGNORED_CHANNELS = config.get('activitybot.ignored_channels').split(',');

const coolingChannels = {};
let messageTimestamps = {};


const unixNow = ()=>Math.floor(Date.now() / 1000);
const debug = (...args)=>DEBUG && Slack.log(args.join(' '));


/**
 * Add `msg`'s timestamp as UNIX epoch to the end of the array for
 * the message's channel, initializing the array ifnecessary.
 * The timestamps are appended, meaning that the array should be sorted,
 * more or less.
 */
const tallyMessage = (msg)=>{
	const channelIgnored = _.indexOf(IGNORED_CHANNELS, msg.channel) > -1;
	const messageIsWeird = msg.subtype || msg.hidden;
	if(channelIgnored || messageIsWeird || msg.isPrivate) {
		return;
	}
	const channelKey = `${msg.channel_id}|${msg.channel}`;
	if(!_.has(messageTimestamps, channelKey)) {
		messageTimestamps[channelKey] = [];
	}
	const unixTimestamp = Math.floor(msg.ts);
	messageTimestamps[channelKey].push(unixTimestamp);
};

/**
 * Remove from `timestamps` (array) the timestamps that are outside
 * the specified `thresholdSeconds`. Return the surviving timestamps
 * in a new array.
 */
const cullTimestamps = (timestamps, thresholdSeconds, channelKey)=>{
	const minimumTimestamp = unixNow() - thresholdSeconds;
	const cutoffIndex = _.sortedIndex(timestamps, minimumTimestamp);
	const culled = _.slice(timestamps, cutoffIndex);
	debug(`[ActivityBot]: Culled <#${channelKey}> timestamps ${timestamps} -> ${culled}`);
	return culled;
};

/**
 * Check whether channel with `channelKey` is on cooldown.
 * Update the `coolingChannels` object and
 * return true ifthe channel is on cooldown, else false.
 */
const checkChannelCooldown = (channelKey)=>{
	if(!_.has(coolingChannels, channelKey)) {
		// channel not on cooldown
		return false;
	}
	if(unixNow() - COOLDOWN_SECONDS > coolingChannels[channelKey]) {
		// channel is now off cooldown
		delete coolingChannels[channelKey];
		debug(`[Activitybot]: <#${channelKey}> is off cooldown`);
		return false;
	}
	return true;
};

/**
 * Identify channels that have had activity that exceeds the configured
 * thresholds and notify #general about them.
 */
const checkForActivityBursts = ()=>{
	messageTimestamps = _.reduce(messageTimestamps, (res, timestamps, channelKey)=>{
		const channelIsOnCooldown = checkChannelCooldown(channelKey);
		const culled = cullTimestamps(timestamps, THRESHOLD_SECONDS, channelKey);

		if(culled.length >= MESSAGE_COUNT_THRESHOLD && !channelIsOnCooldown) {
			// alert the troops
			Slack.send(
				TARGET_CHANNEL,
				`Something's going down in <#${channelKey}>!`
			)
			coolingChannels[channelKey] = unixNow();
		}
		res[channelKey] = culled;
		return res;
	}, {});
	debug(
		'[Activitybot]: Finished checking activity',
		JSON.stringify(messageTimestamps),
		JSON.stringify(coolingChannels, null, '  ')
	);
};


Slack.onMessage(tallyMessage);
setInterval(checkForActivityBursts, RUN_INTERVAL_SECONDS * 1000);
