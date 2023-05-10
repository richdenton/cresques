const Entities = require('./entities');
const MobInventory = require('./mobInventory');

class MobInventories extends Entities {

	/**
	 * Represents a map of Items owned by Mobs.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobInventory map with data from the database.
	 * @param {Mobs} mobs - Map of initialized Mobs.
	 * @param {Items} items - Map of initialized Items.
	 */
	async load(mobs, items) {

		// Remove old data
		this.map.clear();

		// Retrieve all Mob inventories from the database
		await super.load('mob_inventory', (results) => {
			results.forEach(result => {
				const mobInventory = new MobInventory(result);
				let mob = mobs.get(mobInventory.mobId);
				const item = items.get(mobInventory.itemId);
				mob.addItem(item);
				this.add(mobInventory);
			});
		});
	}
}

module.exports = MobInventories;