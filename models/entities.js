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
		this.map.set(parseInt(id), entity);
	}

	/**
	 * Get an Entity from the map.
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

	/**
	 * Find an Entity by ID.
	 * @param {Number} id - A unique ID to lookup.
	 * @return {Entity} The Entity or undefined.
	 */
	findById(id) {
		return this.map.get(id) || undefined;
	}

	/**
	 * Helper function to perform lookups by name.
	 * @param {String} name - A full or partial name to lookup.
	 * @param {String} matchFunctionName - Name of the matching function to use.
	 * @param {Function} filterFunction - Filter method to run on the results.
	 * @return {Entity} The Entity or undefined.
	 */
	_findByName(name, matchFunctionName, filterFunction = null) {
		let result = false;
		for (let entity of this.map.values()) {
			if (entity[matchFunctionName].bind(entity, name)() && (filterFunction === null || filterFunction(entity))) {
				result = entity;
				break;
			}
		}
		return result;
	}

	/**
	 * Find an Entity by exact name.
	 * @param {String} name - A full name to lookup.
	 * @return {Entity} The Entity or undefined.
	 */
	findByNameFull(name) {
		return this._findByName(name, 'matchFull');
	}

	/**
	 * Find an Entity by partial name.
	 * @param {String} name - A partial name to lookup.
	 * @return {Entity} The Entity or undefined.
	 */
	findByNamePartial(name) {
		return this._findByName(name, 'matchPartial');
	}

	/**
	 * Check if a given ID is found in the map.
	 * @param {Number} id - A unique ID to lookup.
	 * @return {Boolean} Whether or not an Entity was found.
	 */
	hasId(id) {
		return this.findById(id) !== undefined;
	}

	/**
	 * Check if a given full name is found in the map.
	 * @param {string} name - A full name to lookup.
	 * @return {boolean} Whether or not an Entity was found.
	 */
	hasNameFull(name) {
		return this.findByNameFull(name) !== false;
	}

	/**
	 * Check if a given partial name is found in the map.
	 * @param {String} name - A partial name to lookup.
	 * @return {Boolean} Whether or not an Entity was found.
	 */
	hasNamePartial(name) {
		return this.findByNamePartial(name) !== false;
	}

	/**
	 * Get the number of Entity objects in the map.
	 * @return {Number} The size of the Entity map.
	 */
	size() {
		return this.map.size;
	}
}

module.exports = Entities;