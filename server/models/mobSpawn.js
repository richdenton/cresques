const Entity = require('./entity');

class MobSpawn extends Entity {

	/**
	 * Represents a Mob spawn point (ie Room and MobTemplate to use).
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.roomId = parseInt(data.room_id);
			this.mobId = parseInt(data.mob_id);
			this.respawnTime = parseInt(data.respawn_time);
		}
	}
}

module.exports = MobSpawn;