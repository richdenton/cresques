const Character = require('./character');

class Player extends Character {

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
			this.raceId = parseInt(data.race_id);
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
	}

	/**
	 * Add (or replace) an Item in the Player's list of equipment.
	 * @param {item} item - The Item to equip.
	 */
	equip(item) {

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
			if (condition.parameter1.indexOf('item_') > -1) {

				// Check if the Player owns a certain number of a given Item
				const itemId = parseInt(condition.parameter1.substring(5)),
					itemCount = this.items.filter(i => i.id == itemId).length;
				if (!eval(itemCount + condition.operator + condition.parameter2)){
					return false;
				}
			} else if (condition.parameter1.indexOf('faction_') > -1) {

				// Check if the Player has reached a certain score with a given Faction
				const factionId = parseInt(condition.parameter1.substring(8)),
					factionScore = (this.factions[factionId] || { score: 0 }).score;
				if (!eval(factionScore + condition.operator + condition.parameter2)){
					return false;
				}
			}
		}
		return true;
	}
}

module.exports = Player;