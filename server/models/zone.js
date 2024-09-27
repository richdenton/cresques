const Entity = require('./entity');

class Zone extends Entity {

	/**
	 * Represents a Zone (parent of Rooms).
	 * @param {object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.name = data.name;
			this.image = data.image;
		}
	}
}

module.exports = Zone;