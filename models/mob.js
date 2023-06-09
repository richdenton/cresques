const Character = require('./character');

class Mob extends Character {

	/**
	 * Represents an in-game Mob.
	 * @constructor
	 */
	constructor() {
		super();
		this.templateId = 0;
		this.damageTotals = new Map();
		this.conversations = [];
		this.factionRewards = {};
	}

	/**
	 * Initialize a Mob with data from a MobTemplate.
	 * @param {Object} template - The MobTemplate to clone.
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

module.exports = Mob;