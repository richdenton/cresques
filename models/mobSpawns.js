const Entities = require('./entities');
const MobSpawn = require('./mobSpawn');

class MobSpawns extends Entities {

	/**
	 * Represents a map of Mob spawn locations.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobSpawn map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all spawn location from the database
		await super.load('mob_spawn', (results) => {
			results.forEach(result => {
				const mobSpawn = new MobSpawn(result);		
				this.add(mobSpawn);
			});
		});
	}
}

module.exports = MobSpawns;