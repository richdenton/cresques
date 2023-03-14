const Entity = require('./entity');

class EnemyTemplate extends Entity {

	/**
	 * Represents a templated version of an Enemy.
	 * Templates contain the base version of an Enemy as in-game Enemies can change.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		this.id = parseInt(data.id);
		this.name = data.name;
		this.speciesId = parseInt(data.species_id);
		this.health = parseInt(data.health);
		this.strength = parseInt(data.strength);
		this.stamina = parseInt(data.stamina);
		this.agility = parseInt(data.agility);
		this.intelligence = parseInt(data.intelligence);
		this.level = parseInt(data.level);
		this.money = parseInt(data.money);
	}
}

module.exports = EnemyTemplate;