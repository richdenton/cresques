const config = require('../config/gameConfig');
const Items = require('../models/items');
const Rooms = require('../models/rooms');
const Species = require('../models/species');
const MobSpawns = require('../models/mobSpawns');
const MobTemplates = require('../models/mobTemplates');
const Mobs = require('../models/mobs');
const MobFactions = require('../models/mobFactions');
const MobInventories = require('../models/mobInventories');
const MobConversations = require('./mobConversations');
const Players = require('../models/players');
const PlayerFactions = require('../models/playerFactions');
const PlayerInventories = require('../models/playerInventories');
const Logger = require('../utils/logger');

class Game {

	/**
	 * Represents the Game.
	 * @constructor
	 */
	constructor() {
		this.items = new Items();
		this.rooms = new Rooms();
		this.species = new Species();
		this.mobSpawns = new MobSpawns();
		this.mobTemplates = new MobTemplates();
		this.mobs = new Mobs();
		this.mobFactions = new MobFactions();
		this.mobInventories = new MobInventories();
		this.mobConversations = new MobConversations();
		this.players = new Players();
		this.playerFactions = new PlayerFactions();
		this.playerInventories = new PlayerInventories();
	}

	/**
	 * Update all objects in the Game.
	 * @param {Number} now - The current time in milliseconds.
	 */
	update(now) {

		// Reset Player properties from last update
		this.players.map.forEach(player => {
			player.damage = -1;
			player.attacker = 0;
			player.encumbered = player.items.length > player.getMaxWeight();
		});

		// Handle Mob updates
		this.mobs.map.forEach(mob => {

			// Reset actions from last update
			mob.damage = -1;
			mob.attacker = 0;
			mob.newRoomId = 0;

			// Check if the Mob has died
			if (mob.health < 1) {

				// End any existing combat
				if (mob.attacking) {
					mob.attacking = 0;
					mob.damageTotals.clear();
				}

				// Remove Mob from the current Room
				if (mob.roomId) {
					const room = this.rooms.get(mob.roomId);
					if (room.id) {
						room.removeMob(mob);
						Logger.log('"' + mob.name + '" (' + mob.id + ') was removed from ' + room.name + '.', Logger.logTypes.DEBUG);
					} else {
						Logger.log('"' + mob.name + '" (' + mob.id + ') is not in a room.', Logger.logTypes.ERROR);
					}
				}

				// Respawn the Mob
				if (mob.killTime && now > mob.killTime + mob.respawnTime) {

					// Respawn Mob in original spawning Room
					const room = this.rooms.get(mob.respawnRoomId);
					if (room.id) {
						mob.newRoomId = room.id;
						room.addMob(mob);
						Logger.log('"' + mob.name + '" (' + mob.id + ') respawned in ' + room.name + '.', Logger.logTypes.DEBUG);
					} else {
						Logger.log('Could not respawn "' + mob.name + '" (' + mob.id + ') due to missing room.', Logger.logTypes.ERROR);
					}

					// Reset Mob stats
					mob.killTime = 0;
					mob.health = mob.getMaxHealth();
				}
			}

			// Check if Mob is currently in combat
			else if (mob.attacking) {

				// Check if target is still available to fight
				const player = this.players.get(mob.attacking);
				if (player.id && player.health && player.roomId === mob.roomId) {

					// Check if Mob is ready to attack
					if ((mob.nextAttackTime || 0) < now) {

						// Roll for damage
						player.damage = mob.willHit(player) ? mob.rollDamage() : 0;
						player.health = Math.max(0, player.health - player.damage);
						player.attacker = mob.id;
						player.attacking = mob.id;
						mob.nextAttackTime = now + mob.getNextAttackTime();
						Logger.log('"' + mob.name + '" (' + mob.id + ') hit ' + player.name + ' for ' + player.damage + ' damage.', Logger.logTypes.DEBUG);

						// Check if the Player has died
						if (player.health < 1) {
							player.killTime = now;
							Logger.log(player.name + ' died.', Logger.logTypes.DEBUG);
						}
					}
				} else {

					// End combat
					mob.attacking = 0;
					mob.damageTotals.clear();
				}
			}
		});

		// Handle Player updates
		this.players.map.forEach(player => {

			// Reset actions from last update
			player.newRoomId = 0;
			player.oldRoomId = 0;

			// Check if the Player has died
			if (player.health < 1) {

				// End any existing combat
				if (player.attacking) {
					player.attacking = 0;
				}

				// Respawn the Player
				if (player.isActive && (!player.killTime || now > player.killTime + config.playerRespawnTime)) {

					// Remove Player from the current Room
					let room = this.rooms.get(player.roomId);
					if (room.id) {
						player.oldRoomId = room.id;
						room.removePlayer(player);
						Logger.log(player.name + ' was removed from ' + room.name + '.', Logger.logTypes.DEBUG);
					} else {
						Logger.log(player.name + ' is not in a room.', Logger.logTypes.ERROR);
					}

					// Respawn Player in Species starting Room
					const species = this.species.get(player.speciesId);
					if (species.id) {
						room = this.rooms.get(species.roomId);
						if (room.id) {
							player.newRoomId = room.id;
							room.addPlayer(player);
							Logger.log(player.name + ' respawned in ' + room.name + '.', Logger.logTypes.DEBUG);
						} else {
							Logger.log('Could not respawn ' + player.name + ' due to missing room.', Logger.logTypes.ERROR);
						}
					} else {
						Logger.log('Could not respawn ' + player.name + ' due to missing species.', Logger.logTypes.ERROR);
					}

					// Reset Player stats
					player.killTime = 0;
					player.health = player.getMaxHealth();
				}
			}

			// Check if Player is currently in combat
			else if (player.attacking) {

				// Check if the target Mob is still available to fight
				const mob = this.mobs.get(player.attacking);
				if (mob.id && mob.health && mob.roomId === player.roomId) {

					// Check if Plyer is ready to attack
					if ((player.nextAttackTime || 0) < now) {

						// Roll for damage
						mob.damage = player.willHit(mob) ? player.rollDamage() : 0;
						mob.health = Math.max(0, mob.health - mob.damage);
						mob.attacker = player.id;
						player.nextAttackTime = now + player.getNextAttackTime();
						Logger.log(player.name + ' hit "' + mob.name + '" (' + mob.id + ') for ' + mob.damage + ' damage.', Logger.logTypes.DEBUG);

						// Determine if this attack should change who the Mob is targetting
						mob.damageTotals.set(player.id, (mob.damageTotals.get(player.id) || 0) + mob.damage);
						mob.attacking = [...mob.damageTotals.entries()].reduce((accumulator, currentValue) => currentValue[1] > accumulator[1] ? currentValue : accumulator)[0];

						// Check if the Mob has died
						if (mob.health < 1) {
							mob.killTime = now;
							Logger.log('"' + mob.name + '" (' + mob.id + ') died.', Logger.logTypes.DEBUG);

							// Reward the Player
							player.experience += player.getExperienceReward(mob);
							player.level = player.getExperienceLevel();

							// Drop loot
							if (mob.items) {
								const room = this.rooms.get(player.roomId);
								mob.items.forEach(item => {
									const newItem = JSON.parse(JSON.stringify(item));
									newItem.dropTime = now;
									newItem.mobId = mob.id;
									newItem.playerId = player.id;
									room.addItem(newItem);
								});
							}
						}
					}
				} else {

					// End combat
					player.attacking = 0;
				}
			}
		});
	}
}

module.exports = Game;