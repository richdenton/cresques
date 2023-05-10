const Entity = require('./entity');

class MobConversation extends Entity {

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
		this.conditions = data.conditions;
		this.responses = data.responses;
	}
}

module.exports = MobConversation;