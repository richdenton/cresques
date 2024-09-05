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
	 * @param {Doors} doors - Map of all Doors loaded from the database.
	 */
	async load(doors) {

		// Remove old data
		this.map.clear();

		// Retrieve all Rooms from the database
		await super.load('room', (results) => {
			results.forEach(result => {
				const room = new Room(result);
				this.add(room);
			});
		});

		// Add Doors to each Room
		doors.map.forEach(door => {
			let room = this.map.get(door.roomStart);
			if (room) {
				const roomEnd = this.map.get(door.roomEnd);
				if (roomEnd) {
					room.doors[door.direction] = {
						roomId: door.roomEnd,
						zoneId: roomEnd.zoneId
					};
					this.map.set(room.id, room);
				}
			}
		}, this);
	}
}

module.exports = Rooms;