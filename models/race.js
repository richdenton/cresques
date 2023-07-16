const Entity = require('./entity');

class Race extends Entity {

	/**
	 * Represents the Race of a Player or Mob.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.name = data.name;
			this.description = data.description;
			this.roomId = parseInt(data.room_id);
			this.health = parseInt(data.health);
			this.strength = parseInt(data.strength);
			this.stamina = parseInt(data.stamina);
			this.agility = parseInt(data.agility);
			this.intelligence = parseInt(data.intelligence);
		}
	}
}

module.exports = Race;