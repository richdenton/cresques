const Entity = require('./entity');

class MobInventory extends Entity {

	/**
	 * Represents a list of all items in a Mob's possession.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		this.mobId = parseInt(data.mob_id);
		this.itemId = parseInt(data.item_id);
	}
}

module.exports = MobInventory;