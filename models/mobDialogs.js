const Entities = require('./entities');
const MobDialog = require('./mobDialog');

class MobDialogs extends Entities {

	/**
	 * Represents a map of Mob conversations.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobDialog map with data from the database.
	 * @param {Mobs} mobs - Map of initialized Mobs
	 */
	async load(mobs) {

		// Remove old data
		this.map.clear();

		// Retrieve all conversations from the database
		await super.load('dialog', (results) => {
			results.forEach(result => {
				const mobDialog = new MobDialog(result);
				let mob = mobs.get(mobDialog.mobId);
				mob.dialogs.push(mobDialog);
				this.add(mobDialog);
			});
		});
	}
}

module.exports = MobDialogs;