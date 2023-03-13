const Entity = require('./entity');

class Player extends Entity {

	/**
	 * Represents a Player.
	 * @param {object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.name = data.name;
			this.userId = parseInt(data.user_id);
			this.speciesId = parseInt(data.species_id);
			this.health = parseInt(data.health);
			this.strength = parseInt(data.strength);
			this.stamina = parseInt(data.stamina);
			this.agility = parseInt(data.agility);
			this.intelligence = parseInt(data.intelligence);
			this.experience = parseInt(data.experience);
			this.money = parseInt(data.money);
			this.roomId = parseInt(data.room_id);
		}
		this.socket = 0;
		this.items = [];
	}

	/**
	 * Add an Item to the Player.
	 * @param {item} item - The Item to add.
	 */
	addItem(item) {
		this.items.push(item);
	}

	/**
	 * Remove an Item from the Player.
	 * @param {item} item - The Item to remove.
	 */
	removeItem(item) {
		this.items = this.items.filter(i => i !== item);
	}
}

module.exports = Player;