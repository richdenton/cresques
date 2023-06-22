const Entity = require('./entity');

class MobConversationReward extends Entity {

	/**
	 * Represents the Reward given to a Player after reaching a certain Conversation milestone.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.conversationId = parseInt(data.conversation_id);
			this.itemId = parseInt(data.item_id);
			this.money = parseInt(data.money);
			this.experience = parseInt(data.experience);
		}
	}
}

module.exports = MobConversationReward;