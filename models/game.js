const config = require('../config/gameConfig');
const Items = require('../models/items');
const Rooms = require('../models/rooms');
const Species = require('../models/species');
const EnemySpawns = require('../models/enemySpawns');
const EnemyTemplates = require('../models/enemyTemplates');
const Enemies = require('../models/enemies');
const Players = require('../models/players');
const PlayerInventories = require('../models/playerInventories');
const GameUtils = require('../utils/gameUtils');
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
		this.enemySpawns = new EnemySpawns();
		this.enemyTemplates = new EnemyTemplates();
		this.enemies = new Enemies();
		this.players = new Players();
		this.playerInventories = new PlayerInventories();
	}

	/**
	 * Update all objects in the Game.
	 * @param {Number} now - The current time in milliseconds.
	 */
	update(now) {

		// Handle Enemy updates
		this.enemies.map.forEach(enemy => {

			// Reset actions from last update
			enemy.damage = 0;
			enemy.newRoomId = 0;

			// Check if the Enemy has died
			if (enemy.health < 1) {

				// End any existing combat
				if (enemy.attacking) {
					enemy.attacking = 0;
				}

				// Remove Enemy from the current Room
				if (enemy.roomId) {
					const room = this.rooms.get(enemy.roomId);
					if (room.id) {
						room.removeEnemy(enemy);
						Logger.log('"' + enemy.name + '" (' + enemy.id + ') was removed from ' + room.name + '.', Logger.logTypes.DEBUG);
					} else {
						Logger.log('"' + enemy.name + '" (' + enemy.id + ') is not in a room.', Logger.logTypes.ERROR);
					}
				}

				// Respawn the Enemy
				if (enemy.killTime && now > enemy.killTime + enemy.respawnTime) {

					// Respawn Enemy in original spawning Room
					const room = this.rooms.get(enemy.respawnRoomId);
					if (room.id) {
						enemy.newRoomId = room.id;
						room.addEnemy(enemy);
						Logger.log('"' + enemy.name + '" (' + enemy.id + ' respawned in ' + room.name + '.', Logger.logTypes.DEBUG);
					} else {
						Logger.log('Could not respawn "' + enemy.name + '" (' + enemy.id + ') due to missing room.', Logger.logTypes.ERROR);
					}

					// Reset Enemy stats
					enemy.killTime = 0;
					enemy.health = enemy.maxHealth;
				}
			}

			// Check if Enemy is currently in combat
			else if (enemy.attacking) {

				// Check if target is still available to fight
				const player = this.players.get(enemy.attacking);
				if (player.id && player.health && player.roomId === enemy.roomId) {

					// Roll for damage
					player.damage = GameUtils.rollDamage(enemy);
					player.health = Math.max(0, player.health - player.damage);
					player.attacking = enemy.id;
					Logger.log('"' + enemy.name + '" (' + enemy.id + ') hit ' + player.name + ' for ' + player.damage + ' damage.', Logger.logTypes.DEBUG);

					// Check if the Player has died
					if (player.health < 1) {
						player.killTime = now;
						Logger.log(player.name + ' died.', Logger.logTypes.DEBUG);
					}
				} else {

					// End combat
					enemy.attacking = 0;
				}
			}
		});

		// Handle Player updates
		this.players.map.forEach(player => {

			// Reset actions from last update
			player.damage = 0
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
					player.health = player.maxHealth;
				}
			}

			// Check if Player is currently in combat
			else if (player.attacking) {

				// Check if the target Enemy is still available to fight
				const enemy = this.enemies.get(player.attacking);
				if (enemy.id && enemy.health && enemy.roomId === player.roomId) {

					// Roll for damage
					enemy.damage = GameUtils.rollDamage(player);
					enemy.health = Math.max(0, enemy.health - enemy.damage);
					enemy.attacking = player.id;
					Logger.log(player.name + ' hit "' + enemy.name + '" (' + enemy.id + ') for ' + enemy.damage + ' damage.', Logger.logTypes.DEBUG);

					// Check if the Enemy has died
					if (enemy.health < 1) {
						enemy.killTime = now;
						Logger.log('"' + enemy.name + '" (' + enemy.id + ') died.', Logger.logTypes.DEBUG);

						// Reward the Player
						player.experience += GameUtils.getExperienceReward(player, enemy);
						player.level = GameUtils.getExperienceLevel(player);
					}
				} else {

					// End comvat
					player.attacking = 0;
				}
			}
		});
	}
}

module.exports = Game;