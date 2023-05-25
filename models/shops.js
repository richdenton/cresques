const Entities = require('./entities');
const Shop = require('./shop');

class Shops extends Entities {

	/**
	 * Represents a map of Shops.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the Shops map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Shops from the database
		await super.load('shop', (results) => {
			results.forEach(result => {
				const shop = new Shop(result);
				this.add(shop);
			});
		});
	}
}

module.exports = Shops;