const Entities = require('./entities');
const PlayerInventory = require('./playerInventory');

class PlayerInventories extends Entities {

	/**
	 * Represents a map of Items owned by Players.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the PlayerInventory map with data from the database.
	 */
	async load(players, items) {

		// Remove old data
		this.map.clear();

		// Retrieve all Player inventories from the database
		await super.load('inventory', (results) => {
			results.forEach(result => {
				const playerInventory = new PlayerInventory(result);
				let player = players.findById(playerInventory.playerId);
				const item = items.findById(playerInventory.itemId);
				player.addItem(item);
				this.add(playerInventory);
			});
		});
	}
}

module.exports = PlayerInventories;