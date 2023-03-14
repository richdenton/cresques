const DatabaseController = require('../controllers/databaseController');
const Logger = require('../utils/logger');

class Entities {

	/**
	 * Represents a map of Entity objects.
	 * @constructor
	 */
	constructor() {
		this.map = new Map();
	}

	/**
	 * Initialize the local map with data from the database.
	 * @param {String} table - The name of the database table to lookup.
	 * @param {Function} next - A callback function to run on completion.
	 */
	async load(table, next) {
		const results = await DatabaseController.pool.query(`SELECT * FROM ${table};`);
		Logger.log('Loaded ' + results[0].length + ' objects from the "' + table + '" table.', Logger.logTypes.INFO);
		next(results[0]);
	}

	/**
	 * Add an Entity to the map.
	 * @param {Entity} entity - The Entity to add.
	 */
	add(entity) {
		const id = this.findOpenId();
		entity.id = id;
		this.map.set(id, entity);
	}

	/**
	 * Retrieve an Entity from the map.
	 * @param {Number} id - A unique ID to lookup.
	 * @return {Entity} The Entity or undefined.
	 */
	get(id) {
		return this.map.get(id);
	}

	/**
	 * Find the next available index in the map.
	 * @return {Number} The next avaiable ID.
	 */
	findOpenId() {
		let previousId = 0;
		for (let key of this.map.keys()) {
			if (key !== previousId + 1) {
				break;
			}
			previousId = key;
		}
		return previousId + 1;
	}
}

module.exports = Entities;