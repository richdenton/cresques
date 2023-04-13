const Entity = require('./entity');

class PlayerInventory extends Entity {

	/**
	 * Represents a list of all items in a Player's possession.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		this.playerId = parseInt(data.player_id);
		this.itemId = parseInt(data.item_id);
		this.equipped = parseInt(data.slot) === 1;
	}
}

module.exports = PlayerInventory;