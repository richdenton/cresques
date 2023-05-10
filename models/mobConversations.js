const Entities = require('./entities');
const MobConversation = require('./mobConversation');

class MobConversations extends Entities {

	/**
	 * Represents a map of Mob conversations.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobConversation map with data from the database.
	 * @param {Mobs} mobs - Map of initialized Mobs
	 */
	async load(mobs) {

		// Remove old data
		this.map.clear();

		// Retrieve all conversations from the database
		await super.load('mob_conversation', (results) => {
			results.forEach(result => {
				const mobConversation = new MobConversation(result);
				let mob = mobs.get(mobConversation.mobId);
				mob.conversations.push(mobConversation);
				this.add(mobConversation);
			});
		});
	}
}

module.exports = MobConversations;