const Entities = require('./entities');
const Door = require('./door');

class Doors extends Entities {

	/**
	 * Represents a map of Doors.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the Doors map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Doors from the database
		await super.load('door', (results) => {
			results.forEach(result => {
				const door = new Door(result);
				this.add(door);
			});
		});
	}
}

module.exports = Doors;