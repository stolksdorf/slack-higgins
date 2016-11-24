const mongoose = require('mongoose');
const _ = require('lodash');

const PinSchema = mongoose.Schema({
	user : {type : String},
	text : {type : String},
	channel : {type : String},
	permalink : {type : String},
	ts : {type : String}
}, { versionKey: false });


const Pin = mongoose.model('Pin', PinSchema);

module.exports = {
	schema : PinSchema,
	model : Pin,
}