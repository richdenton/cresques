const Entity = require('./entity');

class MobFactionReward extends Entity {

	/**
	 * Represents the reward/penalty given to a Player when defeating a Mob.
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

module.exports = MobFactionReward;