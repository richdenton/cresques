const Entity = require('./entity');

class User extends Entity {

	/**
	 * Represents a User.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.email = data.email;
			this.password = data.password;
			this.admin = data.admin ? (data.admin.toLowerCase() === 'true') : false;
		}
		this.playerId = 0;
	}
}

module.exports = User;