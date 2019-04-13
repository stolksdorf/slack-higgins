const config = require('../../../config');
const AWS = require('aws-sdk');

AWS.config.update({
	accessKeyId     : config.get('s3.access'),
	secretAccessKey : config.get('s3.secret')
});
const S3 = new AWS.S3();

const upload = async (name, content)=>{
	return new Promise((resolve, reject)=>{
		S3.putObject({
			Bucket : config.get('markov.bucket_name'),
			Key    : `${name}.map`,
			Body   : content,
		}, (err, data)=>err ? reject(err) : resolve(data));
	})
};

const fetch = async (name)=>{
	return new Promise((resolve, reject)=>{
		S3.getObject({
			Bucket : config.get('markov.bucket_name'),
			Key    : `${name}.map`,
		}, (err, data)=>err ? reject(err) : resolve(data));
	})
	.then((data)=>data.Body.toString());
	//TODO: potentially parse out data here
};

const encode = async ()=>{

};


// put the cron job in here
// have a function to clear out cache
// add to cache
// upload user to S3



/*
	encode mutliple messages into a buffer
	then merge that buffer with an existing mapping


*/


/*
upload('test-key.biz', 'updated text').then((doot)=>{
	console.log(doot);
});

fetch('test-key.biz').then((data)=>{
	console.log(data);
});
*/


/*
use regex to find the line that starts with the sequence.
use a sequence terminating character?
extract out the weights and calculate the total
use that to generate the next letter, and repeat
toss out the file once you are done

*/



module.exports = {
	fetch,
	upload
}
