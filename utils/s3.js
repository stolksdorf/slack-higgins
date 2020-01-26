const config = require('../config');
const AWS = require('aws-sdk');

AWS.config.update({
	accessKeyId     : config.get('s3.access'),
	secretAccessKey : config.get('s3.secret')
});
const S3 = new AWS.S3();

const upload = async (bucket, filename, content)=>{
	return new Promise((resolve, reject)=>{
		S3.putObject({
			Bucket : bucket,
			Key    : filename,
			Body   : content,
		}, (err, data)=>err ? reject(err) : resolve(data));
	});
};

const fetch = async (bucket, filename)=>{
	return new Promise((resolve, reject)=>{
		S3.getObject({
			Bucket : bucket,
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