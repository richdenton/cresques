const Entities = require('./entities');
const EnemyTemplate = require('./enemyTemplate');
const Rooms = require('./rooms');

class EnemyTemplates extends Entities {

	/**
	 * Represents a map of Enemy templates.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the EnemyTemplate map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all templates from the database
		await super.load('enemy', (results) => {
			results.forEach(result => {
				const enemyTemplate = new EnemyTemplate(result);			
				this.add(enemyTemplate);
			});
		});
	}
}

module.exports = EnemyTemplates;