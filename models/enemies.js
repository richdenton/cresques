const Entities = require('./entities');
const Enemy = require('./enemy');
const Rooms = require('./rooms');
const GameUtils = require('../utils/gameUtils');

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
	 * @param {Entities} species - The map of Species to help initialize Enemy stats.
	 * @param {Rooms} rooms - Map of all Rooms.
	 */
	init(enemySpawns, enemyTemplates, species, rooms) {

		// Remove old data
		this.map.clear();

		// Create new Enemy objects from their spawn and template data
		enemySpawns.map.forEach(enemySpawn => {
			let enemy = new Enemy();
			enemy.loadTemplate(enemyTemplates.get(enemySpawn.enemyId));
			enemy.roomId = enemySpawn.roomId;
			const enemySpecies = species.get(enemy.speciesId);
			enemy.strength += enemySpecies.strength;
			enemy.stamina += enemySpecies.stamina;
			enemy.agility += enemySpecies.agility;
			enemy.intelligence += enemySpecies.intelligence;
			enemy.maxHealth = GameUtils.getMaxHealth(enemy, enemySpecies);
			this.add(enemy);
			const room = rooms.get(enemySpawn.roomId);
			room.addEnemy(enemy);
		});
	}
}

module.exports = Enemies;