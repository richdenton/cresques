const Entities = require('./entities');
const MobFaction = require('./mobFaction');

class MobFactions extends Entities {

	/**
	 * Represents a map of Faction rankings of Mobs.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobFactions map with data from the database.
	 * @param {Mobs} mobs - Map of initialized Mobs.
	 */
	async load(mobs) {

		// Remove old data
		this.map.clear();

		// Retrieve all Mob Faction rankings from the database
		await super.load('mob_faction', (results) => {
			results.forEach(result => {
				const mobFaction = new MobFaction(result);
				let mob = mobs.get(mobFaction.mobId);
				mob.updateFactionScore(mobFaction.id, mobFaction.score);
				this.add(mobFaction);
			});
		});
	}
}

module.exports = MobFactions;