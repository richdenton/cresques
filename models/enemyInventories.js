const Entities = require('./entities');
const EnemyInventory = require('./enemyInventory');

class EnemyInventories extends Entities {

	/**
	 * Represents a map of Items owned by Enemies.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the EnemyInventory map with data from the database.
	 * @param {Enemies} enemies - Map of initialized Enemies.
	 * @param {Items} items - Map of initialized Items.
	 */
	async load(enemies, items) {

		// Remove old data
		this.map.clear();

		// Retrieve all Player inventories from the database
		await super.load('loot', (results) => {
			results.forEach(result => {
				const enemyInventory = new EnemyInventory(result);
				let enemy = enemies.get(enemyInventory.enemyId);
				const item = items.get(enemyInventory.itemId);
				enemy.addItem(item);
				this.add(enemyInventory);
			});
		});
	}
}

module.exports = EnemyInventories;