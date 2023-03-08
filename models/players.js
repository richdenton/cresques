const DatabaseController = require('../controllers/databaseController');
const Entities = require('./entities');
const Player = require('./player');

class Players extends Entities {

	/**
	 * Represents a map of Players.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the Player map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Players from the database
		await super.load('player', (results) => {
			results.forEach(result => {
				const player = new Player(result);
				this.add(player);
			});
		});
	}

	/**
	 * Find all Players controlled by a given User.
	 * @param {Number} id - A User ID to lookup.
	 * @return {Array} A list of Players.
	 */
	findAllByUserId(userId) {
		let players = [];
		this.map.forEach(player => {
			if (player.userId == userId) {
				players.push(player);
			}
		});
		return players;
	}

	/**
	 * Save a Player to the database.
	 * @param {Player} player - The Player to write to the database.
	 * @return {Player} The Player with a new ID.
	 */
	async savePlayer(player) {
		const results = await DatabaseController.pool.query('INSERT INTO player (user_id, name, species_id) VALUES (?, ?, ?);', [player.userId, player.name, player.speciesId]);
		player.id = results[0].insertId;
		if (player.id) {
			this.add(player);
		}
		return player;
	}

	/**
	 * Delete a Player to the database.
	 * @param {Player} player - The Player to remove from the database.
	 * @return {Boolean} Whether or not the deletion was a success.
	 */
	async deletePlayer(player) {
		const results = await DatabaseController.pool.query('DELETE FROM player WHERE id=?;', [player.id]);
		return results.affectedRows > 0;
	}
}

module.exports = Players;