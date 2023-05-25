const Entities = require('./entities');
const MobShop = require('./mobShop');

class MobShops extends Entities {

	/**
	 * Represents a map of Shops run by Mobs.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobShops map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all MobShops from the database
		await super.load('mob_shop', (results) => {
			results.forEach(result => {
				const mobShop = new MobShop(result);		
				this.add(mobShop);
			});
		});
	}

	/**
	 * Find a Shop by Mob.
	 * @param {Number} mobId - Uniaue Mob ID to lookup.
	 * @return {MobShop} The MobShop or undefined.
	 */
	findByMobId(mobId) {
		let result = false;
		for (let mobShop of this.map.values()) {
			if (mobShop.mobId == mobId) {
				result = mobShop;
				break;
			}
		}
		return result;
	}
}

module.exports = MobShops;