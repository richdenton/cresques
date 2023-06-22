const Entity = require('./entity');

class MobConversation extends Entity {

	/**
	 * Represents a Conversation with a Mob.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.mobId = parseInt(data.mob_id);
			this.text = data.text;
			this.parentId = parseInt(data.parent_id);
			this.conditions = [];
			(data.conditions || '').split('|').forEach(condition => {
				const properties = condition.split(/(==|!=|>=|<=|<|>)/);
				if (properties.length == 3) {
					this.conditions.push({
						parameter1: properties[0],
						operator: properties[1],
						parameter2: properties[2]
					});
				}
			});
			this.responses = [];
			(data.responses || '').split('|').forEach(response => {
				const properties = response.split('>');
				if (properties.length == 2) {
					this.responses.push({
						input: properties[0],
						nextId: parseInt(properties[1])
					});
				}
			});
			this.rewards = [];
		}
	}

	/**
	 * Add sender-specific context to a Conversation message.
	 * @param {Entity} entity - A Player or Mob.
	 * @return {String} The formatted message.
	 */
	getFormattedMessage(entity) {
		return this.text.replace('{name}', entity.name);
	}
}

module.exports = MobConversation;