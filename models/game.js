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
	 */
	update() {
		const now = GameUtils.getCurrentTimeMs();

		// Handle Enemy changes
		this.enemies.map.forEach(enemy => {
			enemy.moved = false;

			// Respawns
			if (enemy.killTime > 0 && now > enemy.killTime + enemy.respawnTime) {

				// Respawn Enemy in the Room
				const room = this.rooms.get(enemy.roomId);
				if (room.id > 0) {
					room.addEnemy(enemy);
					Logger.log('"' + enemy.name + '" (' + enemy.id + ') respawned in ' + room.name + '.', Logger.logTypes.DEBUG);
				} else {
					Logger.log('Could not respawn "' + enemy.name + '" (' + enemy.id + ').', Logger.logTypes.DEBUG);
				}

				// Reset Enemy stats
				enemy.killTime = 0;
				enemy.health = enemy.maxHealth;
			}

			// Combat
			if (enemy.attacking) {
				if (enemy.health > 0) {
					enemy.damage = 0;
					const player = this.players.get(enemy.attacking);
					if (player.id > 0 && enemy.roomId === player.roomId) {
						if (player.health > 0) {

							// Roll for damage
							player.damage = GameUtils.rollDamage(enemy);
							player.health = Math.max(0, player.health - player.damage);
							player.attacking = enemy.id;
							Logger.log('"' + enemy.name + '" (' + enemy.id + ') attacked ' + player.name + ' for ' + player.damage + ' damage.', Logger.logTypes.DEBUG);
						} else {

							// End combat
							enemy.attacking = 0;
							player.damage = 0;
							player.attacking = 0;
							Logger.log(player.name + ' died.', Logger.logTypes.DEBUG);
						}
					} else {
						enemy.attacking = 0;
					}
				} else {
					enemy.attacking = 0;
				}
			}
		});

		// Handle Player changes
		this.players.map.forEach(player => {
			player.moved = false;

			// Respawns
			if (player.health < 1) {

				// End any existing combat
				player.attacking = 0;

				// Remove Player from the current Room
				let room = this.rooms.get(player.roomId);
				if (room.id > 0) {
					room.removePlayer(player);
					Logger.log(player.name + ' was removed from ' + room.name + '.', Logger.logTypes.DEBUG);
				} else {
					Logger.log(player.name + ' is not in a Room.', Logger.logTypes.ERROR);
				}

				// Respawn Player in Species starting Room
				const species = this.species.get(player.speciesId);
				if (species.id > 0) {
					room = this.rooms.get(species.roomId);
					if (room.id > 0) {
						room.addPlayer(player);
						Logger.log(player.name + ' respawned in ' + room.name + '.', Logger.logTypes.DEBUG);
					} else {
						Logger.log('Could not respawn ' + player.name + ' (missing Room).', Logger.logTypes.ERROR);
					}
				} else {
					Logger.log('Could not respawn ' + player.name + ' (missing Species).', Logger.logTypes.ERROR);
				}

				// Reset Player stats
				player.health = player.maxHealth;
				// todo: apply penalties
			}

			// Combat
			if (player.attacking) {
				if (player.health > 0) {
					player.damage = 0;
					const enemy = this.enemies.get(player.attacking);
					if (enemy.id > 0 && player.roomId === enemy.roomId) {
						if (enemy.health > 0) {

							// Roll for damage
							enemy.damage = GameUtils.rollDamage(player);
							enemy.health = Math.max(0, enemy.health - enemy.damage);
							enemy.attacking = player.id;
							Logger.log(player.name + ' attacked "' + enemy.name + '" (' + enemy.id + ') for ' + enemy.damage + ' damage.', Logger.logTypes.DEBUG);
						} else {

							// End combat
							player.attacking = 0;
							enemy.damage = 0;
							enemy.attacking = 0;
							Logger.log('"' + enemy.name + '" (' + enemy.id + ') died.', Logger.logTypes.DEBUG);

							// Remove Enemy from the Room
							const room = this.rooms.get(enemy.roomId);
							if (room.id > 0) {
								room.removeEnemy(enemy);
								enemy.killTime = now;
								Logger.log('"' + enemy.name + '" (' + enemy.id + ') was removed from ' + room.name + '.', Logger.logTypes.DEBUG);
							}

							// Reward the Player
							player.experience += GameUtils.getExperienceReward(player, enemy);
							player.level = GameUtils.getExperienceLevel(player);
						}
					} else {
						player.attacking = 0;
					}
				} else {
					player.attacking = 0;
				}
			}
		});
	}
}

module.exports = Game;