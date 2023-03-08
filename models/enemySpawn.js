const Entity = require('./entity');

class EnemySpawn extends Entity {

	/**
	 * Represents an Enemy spawn point (ie Room and EnemyTemplate to use).
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.roomId = parseInt(data.room_id);
			this.enemyId = parseInt(data.enemy_id);
			this.respawnTime = parseInt(data.respawn_time);
		}
	}
}

module.exports = EnemySpawn;