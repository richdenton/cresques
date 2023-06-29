const Entity = require('./entity');

class MobRoute extends Entity {

	/**
	 * Represents the Room-to-Room route a Mob travels.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.mobId = parseInt(data.mob_id);
			this.roomStart = parseInt(data.room_start);
			this.roomEnd = parseInt(data.room_end);
			this.waitTime = parseInt(data.wait_time);
		}
	}
}

module.exports = MobRoute;