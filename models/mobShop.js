const Entity = require('./entity');

class MobShop extends Entity {

	/**
	 * Represents a Shop run by a Mob.
	 * @param {Object} data - Default parameters.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.mobId = parseInt(data.mob_id);
			this.shopId = parseInt(data.shop_id);
		}
	}
}

module.exports = MobShop;