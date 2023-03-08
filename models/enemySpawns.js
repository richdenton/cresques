const Entities = require('./entities');
const EnemySpawn = require('./enemySpawn');

class EnemySpawns extends Entities {

	/**
	 * Represents a map of Enemy spawn locations.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the EnemySpawn map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all spawn location from the database
		await super.load('spawn', (results) => {
			results.forEach(result => {
				const enemySpawn = new EnemySpawn(result);		
				this.add(enemySpawn);
			});
		});
	}
}

module.exports = EnemySpawns;