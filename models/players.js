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
	 * @param {Entities} races - The map of Races to help initialize Player stats.
	 */
	async load(races) {

		// Remove old data
		this.map.clear();

		// Retrieve all Players from the database
		await super.load('player', (results) => {
			results.forEach(result => {
				let player = new Player(result);
				const playerRace = races.get(player.raceId);
				player.strengthBase = playerRace.strength;
				player.staminaBase = playerRace.stamina;
				player.agilityBase = playerRace.agility;
				player.intelligenceBase = playerRace.intelligence;
				player.healthBase = playerRace.health;
				player.level = player.getExperienceLevel();
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
		const results = await DatabaseController.pool.query('INSERT INTO player (user_id, name, race_id, health) VALUES (?, ?, ?);', [player.userId, player.name, player.raceId, player.health]);
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

		// Update Faction score
		if (player.factions.length) {
			let factions = [];
			player.factions.forEach(faction => {
				factions.push([ player.id, faction.id, faction.score ]);
			});
			await DatabaseController.pool.query('INSERT INTO player_faction (player_id, faction_id, score) VALUES ? ON DUPLICATE KEY UPDATE score = VALUES(score);', [ factions ]);
		}

		// Update Inventory
		if (player.items.length) {

			// Sort all Items by their save status since the last update
			let oldItems = [],
				newItems = [];
			player.items.forEach(item => {
				if (item.saved) {
					oldItems.push(item.id);
				} else {
					newItems.push([player.id, item.id, item.equipped ? item.slot : null]);
				}
			});

			// Remove any Items that the Player no longer has
			if (oldItems.length) {
				await DatabaseController.pool.query('DELETE FROM player_inventory WHERE player_id=? AND item_id NOT IN (?)', [ player.id, oldItems ]);
			}

			// Add any new Items the Player received since the last update
			if (newItems.length) {
				await DatabaseController.pool.query('INSERT INTO player_inventory (player_id, item_id, slot) VALUES ?', [ newItems ]);
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