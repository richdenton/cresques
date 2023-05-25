const Entity = require('./entity');

class ShopInventory extends Entity {

	/**
	 * Represents a list of all Items in a Shop.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.shopId = parseInt(data.shop_id);
			this.itemId = parseInt(data.item_id);
		}
	}
}

module.exports = ShopInventory;