const Entities = require('./entities');
const Enemy = require('./enemy');
const Rooms = require('./rooms');

class Enemies extends Entities {

	/**
	 * Represents a map of Enemies.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the Enemy map with data from the database.
	 * @param {EnemySpawns} enemySpawns - Map of all Enemy spawn points.
	 * @param {EnemyTemplates} enemyTemplates - Map of all Enemy templates.
	 * @param {Rooms} rooms - Map of all Rooms.
	 */
	init(enemySpawns, enemyTemplates, rooms) {

		// Remove old data
		this.map.clear();

		// Create new Enemy objects from their spawn and template data
		enemySpawns.map.forEach(enemySpawn => {
			const enemy = new Enemy();
			enemy.loadTemplate(enemyTemplates.findById(enemySpawn.enemyId));
			this.add(enemy);
			const room = rooms.findById(enemySpawn.roomId);
			room.addEnemy(enemy);
		});
	}
}

module.exports = Enemies;