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
};

module.exports = {
	fetch,
	upload
}
