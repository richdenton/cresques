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
		this.enemies = [];
		this.players = [];
	}

	/**
	 * Add an Enemy to the Room.
	 * @param {Enemy} enemy - The Enemy to add.
	 */
	addEnemy(enemy) {
		this.enemies.push(enemy);
	}

	/**
	 * Remove an Enemy from the Room.
	 * @param {Enemy} enemy - The Enemy to remove.
	 */
	removeEnemy(enemy) {
		this.enemies = this.enemies.filter(e => e !== enemy);
	}

	/**
	 * Determine if an Enemy is in the Room.
	 * @param {String} name - The name of the Enemy to locate.
	 */
	findEnemy(name) {
		const find = matchFunction => {
			for (let enemy of this.enemies) {
				if (enemy[matchFunction].bind(enemy, name)()) {
					return enemy;
				}
			}
			return 0;
		};
		let result = find('matchFull');
		if (!result) {
			result = find('matchPartial');
		}
		return result;
	}

	/**
	 * Add a Player to the Room.
	 * @param {Player} player - The Player to add.
	 */
	addPlayer(player) {
		if (this.players.indexOf(player) < 0) {
			this.players.push(player);
		}
	}

	/**
	 * Remove a Player from the Room.
	 * @param {Player} player - The Player to remove.
	 */
	removePlayer(player) {
		this.players = this.players.filter(p => p !== player);
	}
}

module.exports = Room;