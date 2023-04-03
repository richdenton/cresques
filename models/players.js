const DatabaseController = require('../controllers/databaseController');
const Entities = require('./entities');
const Player = require('./player');
const GameUtils = require('../utils/gameUtils');

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
	 * @param {Entities} species - The map of Species to help initialize Player stats.
	 */
	async load(species) {

		// Remove old data
		this.map.clear();

		// Retrieve all Players from the database
		await super.load('player', (results) => {
			results.forEach(result => {
				let player = new Player(result);
				const playerSpecies = species.get(player.speciesId);
				player.strengthBase = playerSpecies.strength;
				player.staminaBase = playerSpecies.stamina;
				player.agilityBase = playerSpecies.agility;
				player.intelligenceBase = playerSpecies.intelligence;
				player.level = GameUtils.getExperienceLevel(player);
				player.maxHealth = GameUtils.getMaxHealth(player, playerSpecies);
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
	 * Insert a Player into the database.
	 * @param {Player} player - The Player to write to the database.
	 * @return {Player} The Player with a new ID.
	 */
	async insertPlayer(player) {
		const results = await DatabaseController.pool.query('INSERT INTO player (user_id, name, species_id, health) VALUES (?, ?, ?);', [player.userId, player.name, player.speciesId, player.health]);
		player.id = results[0].insertId;
		if (player.id) {
			this.add(player);
		}
		return player;
	}

	/**
	 * Update a Player in the database.
	 * @param {Player} player - The Player to write to the database.
	 * @return {Boolean} Whether or not the update was a success.
	 */
	async updatePlayer(player) {

		// Update Player
		const results = await DatabaseController.pool.query('UPDATE player SET health=?, strength=?, stamina=?, agility=?, intelligence=?, experience=?, money=?, room_id=? WHERE id=?;', [player.health, player.strength, player.stamina, player.agility, player.intelligence, player.experience, player.money, player.roomId, player.id]);

		// Update Inventory
		if (player.items.length) {

			// Sort all Items by their save status since the last update
			let oldItems = [],
				newItems = [];
			player.items.forEach(item => {
				if (item.saved) {
					oldItems.push(item.id);
				} else {
					newItems.push([player.id, item.id]);
				}
			});

			// Remove any Items that the Player no longer has
			if (oldItems.length) {
				await DatabaseController.pool.query('DELETE FROM inventory WHERE player_id=? AND item_id NOT IN (?)', [ player.id, oldItems ]);
			}

			// Add any new Items the Player received since the last update
			if (newItems.length) {
				await DatabaseController.pool.query('INSERT INTO inventory (player_id, item_id) VALUES ?', [ newItems ]);
			}

			// Mark all local Items as being saved to the database
			player.items.forEach(item => { item.saved = true; });
		}

		return results.affectedRows > 0;
	}

	/**
	 * Delete a Player from the database.
	 * @param {Player} player - The Player to remove from the database.
	 * @return {Boolean} Whether or not the deletion was a success.
	 */
	async deletePlayer(player) {
		const results = await DatabaseController.pool.query('DELETE FROM player WHERE id=?;', [player.id]);
		return results.affectedRows > 0;
	}
}

module.exports = Players;