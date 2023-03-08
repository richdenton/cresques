const config = require('../config/gameConfig');

const Items = require('../models/items');
const Rooms = require('../models/rooms');
const EnemySpawns = require('../models/enemySpawns');
const EnemyTemplates = require('../models/enemyTemplates');
const Enemies = require('../models/enemies');
const Players = require('../models/players');
const PlayerInventories = require('../models/playerInventories');
const Game = require('../models/game');
const Logger = require('../utils/logger');

class GameController {

	static itemTypes = {
		ARMOR: 0,
		WEAPON: 1,
		CONSUMABLE: 2
	};

	static itemRarities = {
		COMMON: 0,
		UNCOMMON: 1,
		RARE: 2,
		EPIC: 3
	};

	static itemSlots = {
		HEAD: 0,
		CHEST: 1,
		ARMS: 2,
		LEGS: 3
	};

	static roomDirections = {
		NORTH: 0,
		EAST: 1,
		SOUTH: 2,
		WEST: 3,
		UP: 4,
		DOWN: 5
	};

	static playerAttributes = {
		STRENGTH: 0,
		STAMINA: 1,
		AGILITY: 2,
		INTELLIGENCE: 3
	};

	constructor() {
		this.items = new Items();
		this.rooms = new Rooms();
		this.enemySpawns = new EnemySpawns();
		this.enemyTemplates = new EnemyTemplates();
		this.enemies = new Enemies();
		this.players = new Players();
		this.playerInventories = new PlayerInventories();
		this.playerControllers = [];
		this.game = new Game();
	}

	/**
	 * Start the main game loop.
	 */
	startGameLoop() {
		setInterval(function(game) {
			game.update();
		}, config.refreshRate, this.game);
	}

	/**
	 * Add a new PlayerController to the game.
	 * @param {PlayerController} playerController - The PlayerController to be added.
	 */
	addPlayerController(playerController) {
		this.playerControllers.push(playerController);
		this.game.players.push(playerController.player);
		Logger.log('Player ' + playerController.player.id + ' entered the game.', Logger.logTypes.INFO);
	}

	/**
	 * Remove a PlayerController from the game.
	 * @param {PlayerController} playerController - The PlayerController to be removed.
	 */
	removePlayerController(playerController) {
		this.playerControllers = this.playerControllers.filter(p => p !== playerController);
		Logger.log('Player ' + playerController.player.id + ' left the game.', Logger.logTypes.INFO);
	}

	/**
	 * Move the Player to a new Room.
	 * @param {Player} player - The Player to be moved.
	 * @param {Number} direction - The direction to be moved. See roomDirections.
	 */
	movePlayer(player, direction) {

		// Determine if the Player can move in this direction
		const currentRoom = this.rooms.findById(player.roomId);
		let newRoomId = 0;
		if (currentRoom.id) {
			switch(direction) {
				case GameController.roomDirections.NORTH:
					newRoomId = currentRoom.northRoomId;
					break;
				case GameController.roomDirections.EAST:
					newRoomId = currentRoom.eastRoomId;
					break;
				case GameController.roomDirections.SOUTH:
					newRoomId = currentRoom.southRoomId;
					break;
				case GameController.roomDirections.WEST:
					newRoomId = currentRoom.westRoomId;
					break;
				case GameController.roomDirections.UP:
					newRoomId = currentRoom.upRoomId;
					break;
				case GameController.roomDirections.DOWN:
					newRoomId = currentRoom.downRoomId;
					break;
				default:
					newRoomId = currentRoom.id;
					break;
			}
		}

		// Update the Game
		if (newRoomId > 0) {
			this.rooms.findById(player.roomId).removePlayer(player);
			this.rooms.findById(newRoomId).addPlayer(player);
			player.roomId = newRoomId;
			Logger.log('Player ' + player.id + ' moved to Room ' + newRoomId + '.', Logger.logTypes.DEBUG);
		}

		// Return the new Room ID
		return newRoomId;
	}
}

module.exports = GameController;