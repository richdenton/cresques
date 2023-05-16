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
		this.conditions = (data.conditions || '').split('|');
		this.responses = [];
		(data.responses || '').split('|').forEach(response => {
			const properties = response.split('>');
			if (properties.length) {
				this.responses.push({
					input: properties[0],
					nextId: parseInt(properties[1])
				});
			}
		});
	}
}

module.exports = MobConversation;