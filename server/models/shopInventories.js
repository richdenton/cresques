const Entities = require('./entities');
const ShopInventory = require('./shopInventory');

class ShopInventories extends Entities {

	/**
	 * Represents a map of Items owned by Shops.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the ShopInventory map with data from the database.
	 * @param {Shops} shops - Map of initialized Shops.
	 * @param {Items} items - Map of initialized Items.
	 */
	async load(shops, items) {

		// Remove old data
		this.map.clear();

		// Retrieve all Shop inventories from the database
		await super.load('shop_inventory', (results) => {
			results.forEach(result => {
				const shopInventory = new ShopInventory(result);
				let shop = shops.get(shopInventory.shopId);
				const item = items.get(shopInventory.itemId);
				shop.buyItem(item, 0);
				this.add(shopInventory);
			});
		});
	}
}

module.exports = ShopInventories;