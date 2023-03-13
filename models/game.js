const Items = require('../models/items');
const Rooms = require('../models/rooms');
const Species = require('../models/species');
const EnemySpawns = require('../models/enemySpawns');
const EnemyTemplates = require('../models/enemyTemplates');
const Enemies = require('../models/enemies');
const Players = require('../models/players');
const PlayerInventories = require('../models/playerInventories');
const GameUtils = require('../utils/gameUtils');

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
	 * Update all object in the Game.
	 */
	update() {

		// Handle Enemy attacks
		this.enemies.map.forEach(enemy => {
			enemy.damage = 0;
			if (enemy.attacking) {
				const player = this.players.get(enemy.attacking);
				if (player.id > 0 && enemy.roomId === player.roomId) {
					if (player.health > 0) {
						player.damage = GameUtils.calculateDamage(enemy);
						player.health = Math.max(0, player.health - player.damage);
						player.attacking = enemy.id;
					} else {
						enemy.attacking = 0;
						player.damage = 0;
						player.attacking = 0;
					}
				} else {
					enemy.attacking = 0;
				}
			}
		});

		// Handle Player attacks
		this.players.map.forEach(player => {
			player.damage = 0;
			if (player.attacking) {
				const enemy = this.enemies.get(player.attacking);
				if (enemy.id > 0 && player.roomId === enemy.roomId) {
					if (enemy.health > 0) {
						enemy.damage = GameUtils.calculateDamage(player);
						enemy.health = Math.max(0, enemy.health - enemy.damage);
						enemy.attacking = player.id;
					} else {
						player.attacking = 0;
						enemy.damage = 0;
						enemy.attacking = 0;
					}
				} else {
					player.attacking = 0;
				}
			}
		});
	}
}

module.exports = Game;