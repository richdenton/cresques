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

	/**
	 * Add an Item to the Mob.
	 * @param {item} item - The Item to add.
	 */
	addItem(item) {
		this.items.push(item);
	}

	/**
	 * Remove an Item from the Mob.
	 * @param {item} item - The Item to remove.
	 */
	removeItem(item) {
		this.items = this.items.filter(i => i !== item);
	}
}

module.exports = Mob;