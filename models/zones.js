const Entities = require('./entities');
const Zone = require('./zone');

class Zones extends Entities {

	/**
	 * Represents a map of Zones.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the Zone map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Items from the database
		await super.load('zone', (results) => {
			results.forEach(result => {
				const zone = new Zone(result);
				this.add(zone);
			});
		});
	}
}

module.exports = Zones;