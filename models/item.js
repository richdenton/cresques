const Entity = require('./entity');

class Item extends Entity {

	/**
	 * Represents an Item.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.name = data.name;
			this.rarity = parseInt(data.rarity);
			this.slot = parseInt(data.slot);
			this.damage = parseInt(data.damage);
			this.delay = parseInt(data.delay);
			this.strength = parseInt(data.strength);
			this.stamina = parseInt(data.stamina);
			this.agility = parseInt(data.agility);
			this.intelligence = parseInt(data.intelligence);
			this.spell = parseInt( data.spell);
			this.value = parseInt(data.value);
		}
	}
}

module.exports = Item;