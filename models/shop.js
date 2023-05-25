const Entity = require('./entity');

class Shop extends Entity {

	/**
	 * Represents a Shop.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.name = data.name;
			this.money = parseInt(data.money);
		}
		this.items = [];
	}

	/**
	 * Add an Item to the Shop.
	 * @param {Item} item - The Item to add.
	 * @param {Number} value - The amount of money to add to the Shop.
	 */
	buyItem(item, value) {
		this.items.push(item);
		this.money += value;
	}

	/**
	 * Remove an Item from the Shop.
	 * @param {Item} item - The Item to remove.
	 * @param {Number} value - The amount of money to deduct from the Shop.
	 */
	sellItem(item, value) {
		this.items = this.items.filter(i => i !== item);
		this.money -= value;
	}
}

module.exports = Shop;