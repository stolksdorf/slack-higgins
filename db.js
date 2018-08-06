const _ = require('lodash');
const Sequelize = require('sequelize');

const DB = {
	Sequelize,
	sequelize : null,

	connect(url, options = {}) {
		delete require('pg').native;

		const dbOptions = _.defaultsDeep({}, options, {
			dialect : 'postgres',
			logging : false,
			benchmark : false,
			timezone : 'America/Toronto',
			operatorsAliases : false,
			databaseVersion : '10.4.0',
			dialectOptions : {
				ssl : true,
			},
			define : {
				underscored : true,
			},
		});

		if (dbOptions.logging === true) {
			dbOptions.logging = console.log;
		}

		DB.sequelize = new Sequelize(url, dbOptions);
	},
};

module.exports = DB;
