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
const Backlog = {};

const MarkovDB = {
	async getMapping(user) {
		await MarkovDB.initialize();
		// TODO: Might want to cache the mappings in here instead of doing it in the service.
		const mapping = await MappingModel.findOne({ where: { user }});
		return MarkovDB.convertFromDb(mapping);
	},

	saveMapping(user, mapping) {
		Backlog[user] = mapping;
		MarkovDB.enqueueUpdate();
	},

	enqueueUpdate() {
		if (!timer) timer = setTimeout(MarkovDB.persistBacklog, 20000);
	},

	async persistBacklog() {
		try {
    		await MarkovDB.initialize();
    		_.each(Backlog, async (mapping, user) => {
        		const start = Date.now();
        		console.log(`[MarkovDB]: Beginning upsert for '${user}'.`);
    //    		await MappingModel.upsert(_.assign({ user }, mapping));
        		await DB.sequelize.query(`
        			INSERT INTO "Markov"."Mappings" (id, "user", msgs, letters, weights, totals, created_at, updated_at)
        				VALUES (DEFAULT, :user, :msgs, :letters, :weights, :totals, now(), now())
        			ON CONFLICT ("user") DO UPDATE SET
        				msgs = EXCLUDED.msgs,
        				letters = EXCLUDED.letters,
        				weights = EXCLUDED.weights,
        				totals = EXCLUDED.totals,
        				updated_at = EXCLUDED.updated_at
        		`, { replacements: MarkovDB.convertToDb(user, mapping) });
        		console.log(`[MarkovDB]: Finished upsert for '${user}'. Took ${Date.now() - start}ms.`);
    		});
    		
    		timer = null;
    		Backlog = {};
		} catch (err) {
			console.error(`Encountered error while trying to save mapping for user '${user}':`, err)
		}
	},

	convertToDb(user, mapping) {
//		return _.assign({}, mapping, { user });
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
