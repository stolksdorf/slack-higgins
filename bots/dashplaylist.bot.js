
const Slack = require('../utils/pico-slack');

Slack.onMessage((msg)=>{
	if(msg.text.indexOf('DASHPlaylist.mpd')!==-1){
		const [url, junk] = msg.text.split('DASHPlaylist.mpd');
		Slack.send(msg.channel, `Sorry, that link is junk, \`i fix.\` ${url.replace('<', '')}`);
	}
});