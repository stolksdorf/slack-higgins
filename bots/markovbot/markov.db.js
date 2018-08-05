const _ = require('lodash');
const DB = require('../../db.js');

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

const convertToDb = (user, mapping) => {
	return _.extend({}, mapping, {
		user,
		weights: JSON.stringify(mapping.weights),
		totals: JSON.stringify(mapping.totals)
	});
};

const convertFromDb = (mapping) => {
	if (!mapping) return {msgs:0, letters:0, totals: {}, weights: {}};
	return _.pick(mapping.toJSON(), ['msgs', 'letters', 'totals', 'weights']);
};

let timer;
let Backlog = {};
let Mappings = {};

const MarkovDB = {
	async getMapping(user) {
		if(!Mappings[user]) {
    		await MarkovDB.initialize();
    		const mapping = await MappingModel.findOne({ where: { user }});
    		Mappings[user] = convertFromDb(mapping);
		}
		return Mappings[user];
	},

	saveMapping(user, mapping) {
		Mappings[user] = mapping;
		// TODO: Since we now have the cache, replace the Backlog with a simple array of usernames.
		Backlog[user] = mapping;
		MarkovDB.enqueueBatchUpdate();
	},

	enqueueBatchUpdate() {
		if (!timer) timer = setTimeout(MarkovDB.persistBacklog, 30000);
	},

	async persistBacklog() {
		try {
			let index = 0;
    		const replacements = _.reduce(Backlog, (acc, mapping, user) => {
    			let row = convertToDb(user, mapping);
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

	initialized: false,
	async initialize() {
		if (MarkovDB.initialized) return;
		await DB.sequelize.createSchema('"Markov"');
		await MappingModel.sync();
		MarkovDB.initialized = true;
	},
};

module.exports = MarkovDB;
