const Entities = require('./entities');
const Room = require('./room');

class Rooms extends Entities {

	/**
	 * Represents a map of Rooms.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the Room map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Items from the database
		await super.load('room', (results) => {
			results.forEach(result => {
				const room = new Room(result);
				this.add(room);
			});
		});
	}
}

module.exports = Rooms;