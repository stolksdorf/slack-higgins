const config = require('../../../config');
const AWS = require('aws-sdk');

AWS.config.update({
	accessKeyId     : config.get('s3.access'),
	secretAccessKey : config.get('s3.secret')
});
const S3 = new AWS.S3();

const upload = async (filename, content)=>{
	return new Promise((resolve, reject)=>{
		S3.putObject({
			Bucket : config.get('markov.bucket_name'),
			Key    : filename,
			Body   : content,
		}, (err, data)=>err ? reject(err) : resolve(data));
	});
};

const fetch = async (filename)=>{
	return new Promise((resolve, reject)=>{
		S3.getObject({
			Bucket : config.get('markov.bucket_name'),
			Key    : filename,
		}, (err, data)=>err ? reject(err) : resolve(data));
	})
	.then((data)=>data.Body.toString())
	.catch((err)=>{
		if(err.code == 'NoSuchKey') return '';
		throw err;
	})
};

module.exports = {
	fetch,
	upload
};


fetch('doot.map')
	.then(console.log)
	.catch((err)=>{
		console.log('err', err.code);
	})
