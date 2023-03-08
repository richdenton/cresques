const Entities = require('./entities');
const Item = require('./item');

class Items extends Entities {

	/**
	 * Represents a map of Items.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the EnemyTemplate map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Items from the database
		await super.load('item', (results) => {
			results.forEach(result => {
				const item = new Item(result);
				this.add(item);
			});
		});
	}
}

module.exports = Items;