const Entity = require('./entity');

class MobDialog extends Entity {

	/**
	 * Represents a conversation with a Mob.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		this.id = parseInt(data.id);
		this.mobId = parseInt(data.mob_id);
		this.text = data.text;
		this.nextId = parseInt(data.next_id);
	}
}

module.exports = MobDialog;