const Entities = require('./entities');
const Item = require('./item');
const MobConversationReward = require('./mobConversationReward');

class MobConversationRewards extends Entities {

	/**
	 * Represents a map of Rewards given to a Player after reaching certain Conversation milestones.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobConversationReward map with data from the database.
	 * @param {Conversation} conversations - Map of initialized Conversations
	 * @param {Items} items - Map of initialized Items
	 */
	async load(conversations, items) {

		// Remove old data
		this.map.clear();

		// Retrieve all Rewards from the database
		await super.load('mob_conversation_reward', (results) => {
			results.forEach(result => {
				const mobConversationReward = new MobConversationReward(result);
				let conversation = conversations.get(mobConversationReward.conversationId);
				const item = new Item(items.get(mobConversationReward.itemId));
				mobConversationReward.item = item;
				conversation.rewards.push(mobConversationReward);
				this.add(mobConversationReward);
			});
		});
	}
}

module.exports = MobConversationRewards;