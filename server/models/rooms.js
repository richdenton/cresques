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
	* @param {Zones} zones - Map of all Zones loaded from the database. 
	* @param {Doors} doors - Map of all Doors loaded from the database.
	 */
	async load(zones, doors) {

		// Remove old data
		this.map.clear();

		// Retrieve all Rooms from the database
		await super.load('room', (results) => {
			results.forEach(result => {
				let room = new Room(result);

				// Ensure Zone exists
				const zone = zones.map.get(room.zoneId);
				if (zone) {

					// Fallback to Zone image if Room does not have its own
					if (!room.image) {
						room.image = zone.image;
					}
					this.add(room);
				}
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