const Entity = require('./entity');

class MobTemplate extends Entity {

	/**
	 * Represents a templated version of a Mob.
	 * Templates contain the base version of a Mob as in-game Mobs can change.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.name = data.name;
			this.raceId = parseInt(data.race_id);
			this.health = parseInt(data.health);
			this.strength = parseInt(data.strength);
			this.stamina = parseInt(data.stamina);
			this.agility = parseInt(data.agility);
			this.intelligence = parseInt(data.intelligence);
			this.level = parseInt(data.level);
			this.money = parseInt(data.money);
		}
	}
}

module.exports = MobTemplate;