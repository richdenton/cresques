const Entities = require('./entities');
const Mob = require('./mob');
const Rooms = require('./rooms');

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
	 * @param {MobShops} mobShops - Map of all Shops owned by Mobs.
	 * @param {Shops} shops - Map of all Shops.
	 * @param {MobTemplates} mobTemplates - Map of all Mob templates.
	 * @param {Races} races - The map of Races to help initialize Mob stats.
	 * @param {Rooms} rooms - Map of all Rooms.
	 */
	init(mobSpawns, mobShops, shops, mobTemplates, races, rooms) {

		// Remove old data
		this.map.clear();

		// Create new Mob objects from their spawn and template data
		mobSpawns.map.forEach(mobSpawn => {
			let mob = new Mob();
			mob.loadTemplate(mobTemplates.get(mobSpawn.mobId));
			mob.roomId = mobSpawn.roomId;
			mob.respawnTime = mobSpawn.respawnTime;
			mob.respawnRoomId = mobSpawn.roomId;
			const mobShop = mobShops.findByMobId(mobSpawn.mobId);
			if (mobShop) {
				const shop = shops.get(mobShop.shopId);
				if (shop) {
					mob.shop = shop;
				}
			}
			const mobRace = races.get(mob.raceId);
			mob.strengthBase = mobRace.strength;
			mob.staminaBase = mobRace.stamina;
			mob.agilityBase = mobRace.agility;
			mob.intelligenceBase = mobRace.intelligence;
			mob.healthBase = mobRace.health;
			this.add(mob);
			const room = rooms.get(mobSpawn.roomId);
			room.addMob(mob);
		});
	}
}

module.exports = Mobs;