const Entities = require('./entities');
const MobRoute = require('./mobRoute');

class MobRoutes extends Entities {

	/**
	 * Represents a map of Mob travel routes.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobRoute map with data from the database.
	 * @param {Mobs} mobs - Map of initialized Mobs.
	 */
	async load(mobs) {

		// Remove old data
		this.map.clear();

		// Retrieve all routes from the database
		await super.load('mob_route', (results) => {
			results.forEach(result => {
				const mobRoute = new MobRoute(result);
				let mob = mobs.get(mobRoute.mobId);
				mob.routes.push(mobRoute);
				this.add(mobRoute);
			});
		});
	}
}

module.exports = MobRoutes;