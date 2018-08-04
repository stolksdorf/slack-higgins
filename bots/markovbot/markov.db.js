const _ = require('lodash');
const DB = require('../../db.js');

//const UserModel = DB.sequelize.define('User', {
//    name : {
//        type      : DB.Sequelize.TEXT,
//        allowNull : false,
//        isUnique : true,
//    },
//    numMessages : {
//    	type : DB.Sequelize.INTEGER,
//    	allowNull : false,
//    },
//    numLetters : {
//    	type : DB.Sequelize.INTEGER,
//    	allowNull : false,
//    },
//}, {
//    schema : 'Markov',
//});
//
//const MappingModel = DB.sequelize.define('Mapping', {
//	userId : {
//		
//	},
//	key : {
//		type : DB.Sequelize.TEXT,
//		allowNull : false,
//	},
//	// TODO: Is this the thing I can generate on the fly?
//	count : {
//		type : DB.Sequelize.INTEGER,
//		allowNull : false,
//	},
//	weights : {
//		type : DB.Sequelize.JSONB,
//		allowNull : false,
//		defaultValue : {},
//	},
//}, {
//	schema : 'Markov',
//});

//UserModel.build({
//	name : 'jared',
//	numMessages : 4000,
//	numLetters : 85000,
//});
//
//MappingModel.build({
//	userId : fk(UserModel, 'jared'),
//	key : 'ing',
//	count : 347,
//	weights : {
//		'a' : 4,
//		'!' : 50,
//		' ' : 43,
//	},
//});
//
//MappingModel.build({
//	userId : fk(UserModel, 'jared'),
//	key : 'ing!',
//	count : 280,
//	weights : {
//		'a' : 250,
//		'!' : 0,
//	},
//});

const MappingModel = DB.sequelize.define('Mapping', {
	user : {
		type : DB.Sequelize.TEXT,
		allowNull : false,
		unique : true,
	},
	msgs : {
		type : DB.Sequelize.INTEGER,
		allowNull : false,
	},
	letters : {
		type : DB.Sequelize.INTEGER,
		allowNull : false,
	},
	weights : {
		type : DB.Sequelize.JSONB,
		allowNull : false,
		defaultValue : {},
	},
	// TODO: Try adding some indexes and see if we can realistically remove this.
	totals : {
		type : DB.Sequelize.JSONB,
		allowNull : false,
		defaultValue : {},
	},
}, {
	schema : 'Markov',
});

let timer;
let Backlog = {};

const MarkovDB = {
	async getMapping(user) {
		await MarkovDB.initialize();
		// TODO: Might want to cache the mappings in here instead of doing it in the service.
		const mapping = await MappingModel.findOne({ where: { user }});
		return MarkovDB.convertFromDb(mapping);
	},

	saveMapping(user, mapping) {
		Backlog[user] = mapping;
		MarkovDB.enqueueBatch();
	},

	enqueueBatch() {
		if (!timer) timer = setTimeout(MarkovDB.persistBacklog, 30000);
	},

	async persistBacklog() {
		try {
			let index = 0;
    		const replacements = _.reduce(Backlog, (acc, mapping, user) => {
    			let row = MarkovDB.convertToDb(user, mapping);
    			row = _.mapKeys(row, (value, key) => `${key}${index}`);
    			index++;
    			return _.assign(acc, row);
    		}, {});
    		const insertRows = _.times(_.size(Backlog), _.template('(DEFAULT, :user${i}, :msgs${i}, :letters${i}, :weights${i}, :totals${i}, now(), now())', { variable: 'i' })).join(',\n\t\t\t\t\t');
    		
    		timer = null;
    		Backlog = {};
    		
    		await MarkovDB.initialize();
    		const start = Date.now();
    		console.log(`[MarkovDB]: Beginning upsert for '<a bunch of users>'.`);
			await DB.sequelize.query(`
				INSERT INTO "Markov"."Mappings" (id, "user", msgs, letters, weights, totals, created_at, updated_at) VALUES
					${ insertRows }
				ON CONFLICT ("user") DO UPDATE SET
					msgs = EXCLUDED.msgs,
					letters = EXCLUDED.letters,
					weights = EXCLUDED.weights,
					totals = EXCLUDED.totals,
					updated_at = EXCLUDED.updated_at;
			`, { replacements });
			console.log(`[MarkovDB]: Finished upsert for '<a bunch of users>'. Took ${Date.now() - start}ms.`);
		} catch (err) {
			console.error(`Encountered error while trying to persist backlog.:`, err)
		}
	},

	convertToDb(user, mapping) {
		return _.extend({}, mapping, {
			user,
			weights: JSON.stringify(mapping.weights),
			totals: JSON.stringify(mapping.totals)
		});
	},

	convertFromDb(mapping) {
		if (!mapping) return null;
		return _.pick(mapping.toJSON(), ['msgs', 'letters', 'totals', 'weights']);
	},

	initialized: false,
	async initialize() {
		if (MarkovDB.initialized) return;
		await DB.sequelize.createSchema('"Markov"');
		await MappingModel.sync();
		MarkovDB.initialized = true;
	},
};

module.exports = MarkovDB;
