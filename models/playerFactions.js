const Entities = require('./entities');
const PlayerFaction = require('./playerFaction');

class PlayerFactions extends Entities {

	/**
	 * Represents a map of Faction rankings of Players.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the PlayerFactions map with data from the database.
	 * @param {Players} players - Map of initialized Players.
	 */
	async load(players) {

		// Remove old data
		this.map.clear();

		// Retrieve all Player Faction rankings from the database
		await super.load('player_faction', (results) => {
			results.forEach(result => {
				const playerFaction = new PlayerFaction(result);
				let player = players.get(playerFaction.playerId);
				player.updateFactionRank(playerFaction.id, playerFaction.score);
				this.add(playerFaction);
			});
		});
	}
}

module.exports = PlayerFactions;