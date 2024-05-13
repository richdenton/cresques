const Entity = require('./entity');

class Door extends Entity {

	/**
	 * Represents the Door from a Room.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.roomStart = parseInt(data.room_start);
			this.roomEnd = parseInt(data.room_end);
			this.direction = data.direction;
		}
	}
}

module.exports = Door;