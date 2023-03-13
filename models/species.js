const Entity = require('./entity');
const Entities = require('./entities');

class Species extends Entity {

	/**
	 * Represents the Species of a Player or Enemy.
	 * @constructor
	 */
	constructor(data) {
		super();
		if (data) {
			this.id = parseInt(data.id);
			this.name = data.name;
			this.description = data.description;
			this.roomId = parseInt(data.room_id);
			this.strength = parseInt(data.strength);
			this.stamina = parseInt(data.stamina);
			this.agility = parseInt(data.agility);
			this.intelligence = parseInt(data.intelligence);
		}
	}
}

class SpeciesMap extends Entities {

	/**
	 * Represents a map of Species.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Retrieve all available Species.
	 * @return {Array} A list of all Species entities.
	 */
	getAll() {
		let results = [];
		this.map.forEach(result => {
			results.push(result);
		});
		return results;
	}

	/**
	 * Initialize the Species map with data from the database.
	 */
	async load() {

		// Remove old data
		this.map.clear();

		// Retrieve all Species from the database
		await super.load('species', (results) => {
			results.forEach(result => {
				const species = new Species(result);
				this.add(species);
			});
		});
	}
}

module.exports = SpeciesMap;