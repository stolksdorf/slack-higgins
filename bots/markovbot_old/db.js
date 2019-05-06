const DB = require('../../db.js');

const User = DB.sequelize.define('User', {
	user : DB.Sequelize.TEXT,
	msg_count : DB.Sequelize.INTEGER, //defaultValue 0
	letter_count : DB.Sequelize.INTEGER, //defaultValue 0rf
});

const Fragment = DB.sequelize.define('Fragment', {
	user : DB.Sequelize.TEXT,
	sequence : DB.Sequelize.TEXT,
	letter : DB.Sequelize.TEXT,
	weight : DB.Sequelize.INTEGER, //defaultValue 0
});



module.exports = {

	updateUser: async (user, letterCount)=>{
		return User.findOrCreate({where : {user}})
			.then(([user, created])=>{
				return user.update({
					letterCount : user.letterCount + letterCount,
					msg_count : user.msg_count + 1
				})
			});
	},

	// encodeMessage: async (user, message)=>{
	// 	//Update info in User table



	// },
	encodeFragment: async (user, sequence, letter)=>{
		return Fragment
			.findOrCreate({where : { user, sequence, letter }})
			.then(([fragment, created])=>{
				console.log(created);
				return fragment.increment('weight', {by: 1});
			})
	},


	// generateMessage: async (user)=>{

	// },
	// getNextLetter: async (user, message='')=>{

	// },

	getLetterWeights: async (user, sequence)=>{
		const total = await Fragment.sum('weight',{where : { user, sequence }});
		const fragments = await Fragment.findAll({
			attributes: ['letter', 'weight']
			where : { user, sequence }
		});

		// const {count, rows} = await Fragment.findAndCountAll({
		// 	attributes: ['letter', 'weight']
		// 	where : { user, sequence }
		// });

		//console.log(fragments);

		//turn into weights
		/*
			{ a : 5, b : 7, ...}
		*/

		let weights;

		return {total, weights};
	},



	/* ---------------- */


}




