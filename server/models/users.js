const DatabaseController = require('../controllers/databaseController');
const Entities = require('./entities');
const User = require('./user');

class Users extends Entities {

	/**
	 * Represents a map of Users.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the User map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Users from the database
		await super.load('user', (results) => {
			results.forEach(result => {
				const user = new User(result);
				this.add(user);
			});
		});
	}

	/**
	 * Find a User by their email.
	 * @param {String} email - Email address to lookup.
	 * @return {User} The found User or an empty User.
	 */
	findByEmail(email) {
		let result = new User();
		for (let user of this.map.values()) {
			if (user.email == email) {
				result = user;
				break;
			}
		}
		return result;
	}

	/**
	 * Save a User to the database.
	 * @param {User} user - The User to write to the database.
	 * @return {User} The User with a new ID.
	 */
	async saveUser(user) {
		const results = await DatabaseController.pool.query('INSERT INTO user (email, password, admin) VALUES (?, ?, ?);', [user.email, user.password, user.admin]);
		user.id = results[0].insertId;
		if (user.id) {
			this.add(user);
		}
		return user;
	}
}

module.exports = Users;