const Entities = require('./entities');
const Race = require('./race');

class Races extends Entities {

	/**
	 * Represents a map of Races.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the Races map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Races from the database
		await super.load('race', (results) => {
			results.forEach(result => {
				const race = new Race(result);
				this.add(race);
			});
		});
	}

	/**
	 * Retrieve all available Races.
	 * @return {Array} A list of all Race entities.
	 */
	getAll() {
		let results = [];
		this.map.forEach(result => {
			results.push(result);
		});
		return results;
	}
}

module.exports = Races;