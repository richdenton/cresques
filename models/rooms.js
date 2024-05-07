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

		// Retrieve all Rooms from the database
		await super.load('room', (results) => {
			results.forEach(result => {
				const room = new Room(result);
				this.add(room);
			});
		});

		// Append Zone data to each Room exit
		this.map.forEach(function(room, index) {
			if (room.exits.north) {
				room.exits.north.zoneId = this.get(room.exits.north.roomId).zoneId;
			}
			if (room.exits.east) {
				room.exits.east.zoneId = this.get(room.exits.east.roomId).zoneId;
			}
			if (room.exits.south) {
				room.exits.south.zoneId = this.get(room.exits.south.roomId).zoneId;
			}
			if (room.exits.west) {
				room.exits.west.zoneId = this.get(room.exits.west.roomId).zoneId;
			}
			if (room.exits.up) {
				room.exits.up.zoneId = this.get(room.exits.up.roomId).zoneId;
			}
			if (room.exits.down) {
				room.exits.down.zoneId = this.get(room.exits.down.roomId).zoneId;
			}
			this[index] = room;
		}, this.map);
	}
}

module.exports = Rooms;