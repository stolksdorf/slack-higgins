const _ = require('lodash');
const Slack = require('pico-slack');

const ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');

const request = require('superagent');

//const ytUrl = 'https://www.youtube.com/watch?v=XUZSm_m15kg'

const ytUrl = 'https://www.youtube.com/watch?v=5Nj2BngIko0'


/*
	https://github.com/jpweeks/ytdl-audio/blob/master/index.js

	Look into ffmpeg install
	  - make that work on

*/

//Test uploading a file to slack
//

//Test uploading a file to dropbox, uses basic auth



const getYTInfo = (url)=>{

}

const download = (url)=>{

	return ytdl.getInfo(url)
			.then((info)=>{

				return new Promise((resolve, reject)=>{

						const artist = info.artist;
						const title = info.title

						const reader = ytdl.downloadFromInfo(info, {filter: 'audioonly'});
						var writer = ffmpeg(reader).format('mp3')
							.audioBitrate(info.formats[0].audioBitrate)
							.withAudioCodec("libmp3lame")
							.toFormat("mp3")
							.outputOptions("-id3v2_version", "4")
							.outputOptions("-metadata", "title=" + title)
							.outputOptions("-metadata", "artist=" + artist)
							.on("error", function(err) {
								reject(err);
							})
							.on("end", function() {
								console.log('yeah boi')
								return resolve(writer);
						//		resultObj.file =  fileName;
					//			resultObj.youtubeUrl = videoUrl;
					//			resultObj.videoTitle = videoTitle;
					//			resultObj.artist = artist;
					//			resultObj.title = title;
					//			resultObj.thumbnail = thumbnail;
								console.log('DONE');
							})
							.saveToFile('test.mp3');


				});


			})
}


// download(ytUrl)
// 	.then((res)=>{
// 		console.log('DONE');
// 		console.log(res);
// 	})
// 	.catch((err)=>{
// 		console.log("ERROR");
// 		console.log(err);
// 	})

const fs = require('fs')
const uploadToSlack = (msgObj, stream)=>{
	console.log(msgObj.channel);
	return request.post('https://slack.com/api/files.upload')
		.send({token : Slack.token, channel : msgObj.channel})
		.attach('file', fs.readFileSync('./bots/test.mp3'))
		.end((res, err)=>{
			console.log('res', res);
			console.log('err', err);
		});

}






Slack.onMessage((msg)=>{
	if(!msg.isDirect) return;

	console.log('HEre');

	//uploadToSlack(msg)

	//get a regex going
	//if(_.startsWith(msg.text, 'https://www.youtube.com/watch?v=')){
		console.log('in here');


	//}


});