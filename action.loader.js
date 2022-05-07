const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const request = require('request');
const Slack = require('./utils/pico-slack');

const router = require('express').Router();
router.use(require('body-parser').urlencoded({ extended: false }))

const formatResponse = (response)=>{
	if(_.isString(response)){
		return {text: response};
	} else if(!_.isPlainObject(response)){
		return {text: JSON.stringify(response)};
	} else {
		return response;
	}
};

const sendResponse = (actionInfo, response) => {
	return request.post(actionInfo.response_url, {
		json : true,
		body : _.assign({
			'response_type' : 'ephemeral',
		}, formatResponse(response))
	});
};

module.exports = (actionFolder)=>{
	return new Promise((resolve, reject)=>{
		glob(`${actionFolder}/**/*.action.js`, {}, (err, files)=>{
			if(err) return reject(err);
			return resolve(files);
		});
	})
		.then((actionpaths)=>{
			return _.reduce(actionpaths, (r, actionpath)=>{
				try {
					r.push(require(actionpath));
					console.log('loaded', actionpath);
				} catch (e){
					Slack.error('Action Load Error', e);
				}
				return r;
			}, []);
		})
		.then((actions)=>{
			const Actions = _.mapKeys(actions, 'id');
			router.post('/action', (req, res)=>{
				const input = JSON.parse(req.body.payload);
				if (!Actions[input.callback_id]) return res.status(422).send();
				res.status(200).send();

				try {
					Actions[input.callback_id].handle(
						input.message.text,
						input,
						(response) => {
							return sendResponse(input, response);
						},
						(error) => {
							return sendResponse(input, error);
						}
					);
				} catch (err){
					Slack.error('Action Run Error', err);
				}
			});
			return router;
		});

};