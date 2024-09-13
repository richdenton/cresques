const Entity = require('./entity');

class MobFaction extends Entity {

	/**
	 * Represents the ranking of each Faction associated with a Mob.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.mobId = parseInt(data.mob_id);
			this.factionId = parseInt(data.faction_id);
			this.score = parseInt(data.score);
		}
	}
}

module.exports = MobFaction;