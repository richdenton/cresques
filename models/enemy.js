const Entity = require('./entity');

class Enemy extends Entity {

	/**
	 * Represents an in-game Enemy.
	 * @constructor
	 */
	constructor() {
		super();
		this.templateId = 0;
		this.roomId = 0;
	}

	/**
	 * Initialize an Enemy with data from an EnemyTemplate.
	 * @param {Object} template - The EnemyTemplate to clone.
	 */
	loadTemplate(template) {
		this.templateId = template.id;
		this.name = template.name;
		this.speciesId = template.speciesId;
		this.health = template.health;
		this.strength = template.strength;
		this.stamina = template.stamina;
		this.agility = template.agility;
		this.intelligence = template.intelligence;
		this.level = template.level;
		this.money = template.money;
	}
}

module.exports = Enemy;