const Entities = require('./entities');
const MobFactionReward = require('./mobFactionReward');

class MobFactionRewards extends Entities {

	/**
	 * Represents a map of Faction Rewards when defeating Mobs.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobFactionRewards map with data from the database.
	 * @param {Mobs} mobs - Map of initialized Mobs.
	 */
	async load(mobs) {

		// Remove old data
		this.map.clear();

		// Retrieve all Mob Faction rewards from the database
		await super.load('mob_faction_reward', (results) => {
			results.forEach(result => {
				const mobFactionReward = new MobFactionReward(result);
				let mob = mobs.get(mobFactionReward.mobId);
				mob.factionRewards.push({
					factionId: mobFactionReward.id,
					score: mobFactionReward.score
				});
				this.add(mobFactionReward);
			});
		});
	}
}

module.exports = MobFactionRewards;