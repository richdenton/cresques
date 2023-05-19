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
		this.isActive = false;
		this.items = [];
		this.equipment = {};
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

	/**
	 * Add (or replace) an Item in the Player's list of equipment.
	 * @param {item} item - The Item to equip.
	 */
	equipItem(item) {

		// Unequip previous Item
		const oldItem = this.items.find(i => i.id === this.equipment[item.slot]);
		if (oldItem) {
			oldItem.equipped = false;
			oldItem.saved = false;
		}

		// Equip the new Item
		this.equipment[item.slot] = item.id;
		item.equipped = true;
		item.saved = false;
	}

	/**
	 * Determine whether the Player meets the conditions of a given Conversation.
	 * @param {Conversation} conversation - The Conversation with conditions to test.
	 */
	meetsConditions(conversation) {
		for (const condition of conversation.conditions) {
			switch (condition.parameter1) {
				case 'itemId':
					if (!this.items.find(i => i.id === parseInt(condition.parameter2))) {
						return false;
					}
					break;
			}
		}
		return true;
	}
}

module.exports = Player;