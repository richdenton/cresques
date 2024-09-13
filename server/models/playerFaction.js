const Entity = require('./entity');

class PlayerFaction extends Entity {

	/**
	 * Represents the ranking of each Faction associated with a Player.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.playerId = parseInt(data.player_id);
			this.factionId = parseInt(data.faction_id);
			this.score = parseInt(data.score);
		}
	}
}

module.exports = PlayerFaction;