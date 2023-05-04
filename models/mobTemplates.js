const Entities = require('./entities');
const MobTemplate = require('./mobTemplate');

class MobTemplates extends Entities {

	/**
	 * Represents a map of Mob templates.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the MobTemplate map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all templates from the database
		await super.load('mob', (results) => {
			results.forEach(result => {
				const mobTemplate = new MobTemplate(result);			
				this.add(mobTemplate);
			});
		});
	}
}

module.exports = MobTemplates;