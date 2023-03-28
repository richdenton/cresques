const Entity = require('./entity');

class EnemyInventory extends Entity {

	/**
	 * Represents a list of all items in an Enemy's possession.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		this.enemyId = parseInt(data.enemy_id);
		this.itemId = parseInt(data.item_id);
	}
}

module.exports = EnemyInventory;