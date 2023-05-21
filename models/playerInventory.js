const Entity = require('./entity');

class PlayerInventory extends Entity {

	/**
	 * Represents a list of all items in a Player's possession.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.playerId = parseInt(data.player_id);
			this.itemId = parseInt(data.item_id);
			this.slot = parseInt(data.slot);
		}
	}
}

module.exports = PlayerInventory;