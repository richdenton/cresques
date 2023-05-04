const Entity = require('./entity');

class Room extends Entity {

	/**
	 * Represents a Room.
	 * @param {object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		this.exits = {};
		if (data) {
			this.id = parseInt(data.id);
			this.name = data.name;
			this.description = data.description;
			this.exits.north = parseInt(data.north);
			this.exits.east = parseInt(data.east);
			this.exits.south = parseInt(data.south);
			this.exits.west = parseInt(data.west);
			this.exits.up = parseInt(data.up);
			this.exits.down = parseInt(data.down);
		}
		this.mobs = [];
		this.players = [];
		this.items = [];
	}

	/**
	 * Add a Mob to the Room.
	 * @param {Mob} mob - The Mob to add.
	 */
	addMob(mob) {
		this.mobs.push(mob);
		mob.roomId = this.id;
	}

	/**
	 * Remove a Mob from the Room.
	 * @param {Mob} mob - The Mob to remove.
	 */
	removeMob(mob) {
		this.mobs = this.mobs.filter(e => e !== mob);
		mob.roomId = 0;
	}

	/**
	 * Add a Player to the Room.
	 * @param {Player} player - The Player to add.
	 */
	addPlayer(player) {
		if (this.players.indexOf(player) < 0) {
			this.players.push(player);
		}
		player.roomId = this.id;
	}

	/**
	 * Remove a Player from the Room.
	 * @param {Player} player - The Player to remove.
	 */
	removePlayer(player) {
		this.players = this.players.filter(p => p !== player);
		player.roomId = 0;
	}

	/**
	 * Add an Item to the Room.
	 * @param {item} item - The Item to add.
	 */
	addItem(item) {
		this.items.push(item);
	}

	/**
	 * Remove an Item from the Room.
	 * @param {item} item - The Item to remove.
	 */
	removeItem(item) {
		this.items = this.items.filter(i => i !== item);
	}
}

module.exports = Room;