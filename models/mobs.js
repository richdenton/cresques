const Entities = require('./entities');
const Mob = require('./mob');
const Rooms = require('./rooms');
const GameUtils = require('../utils/gameUtils');

class Mobs extends Entities {

	/**
	 * Represents a map of Mobs.
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initialize the Mob map with data from the database.
	 * @param {MobSpawns} mobSpawns - Map of all Mob spawn points.
	 * @param {MobTemplates} mobTemplates - Map of all Mob templates.
	 * @param {Entities} species - The map of Species to help initialize Mob stats.
	 * @param {Rooms} rooms - Map of all Rooms.
	 */
	init(mobSpawns, mobTemplates, species, rooms) {

		// Remove old data
		this.map.clear();

		// Create new Mob objects from their spawn and template data
		mobSpawns.map.forEach(mobSpawn => {
			let mob = new Mob();
			mob.loadTemplate(mobTemplates.get(mobSpawn.mobId));
			mob.roomId = mobSpawn.roomId;
			mob.respawnTime = mobSpawn.respawnTime;
			mob.respawnRoomId = mobSpawn.roomId;
			const mobSpecies = species.get(mob.speciesId);
			mob.strengthBase = mobSpecies.strength;
			mob.staminaBase = mobSpecies.stamina;
			mob.agilityBase = mobSpecies.agility;
			mob.intelligenceBase = mobSpecies.intelligence;
			mob.healthBase = mobSpecies.health;
			this.add(mob);
			const room = rooms.get(mobSpawn.roomId);
			room.addMob(mob);
		});
	}
}

module.exports = Mobs;