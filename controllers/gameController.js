const config = require('../config/gameConfig');
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
		this.playerControllers = [];
		this.game = new Game();
	}

	/**
	 * Start the main game loop.
	 */
	startGameLoop() {
		setInterval(function(playerControllers, game) {
			game.update();
			playerControllers.forEach(playerController => {
				playerController.update();
			});
		}, config.refreshRate, this.playerControllers, this.game);
	}

	/**
	 * Add a new PlayerController to the game.
	 * @param {PlayerController} playerController - The PlayerController to be added.
	 */
	addPlayerController(playerController) {
		this.playerControllers.push(playerController);
		Logger.log(playerController.player.name + ' entered the game.', Logger.logTypes.INFO);
	}

	/**
	 * Remove a PlayerController from the game.
	 * @param {PlayerController} playerController - The PlayerController to be removed.
	 */
	removePlayerController(playerController) {
		this.playerControllers = this.playerControllers.filter(p => p !== playerController);
		Logger.log(playerController.player.name + ' left the game.', Logger.logTypes.INFO);
	}

	/**
	 * Move a Player to a new Room.
	 * @param {Player} player - The Player to be moved.
	 * @param {Number} direction - The direction to be moved. See roomDirections.
	 */
	movePlayer(player, direction) {

		// Determine if the Player can move in this direction
		const currentRoom = this.game.rooms.get(player.roomId);
		let newRoomId = 0;
		if (currentRoom.id) {
			switch(direction) {
				case GameController.roomDirections.NORTH:
					newRoomId = currentRoom.exits.north;
					break;
				case GameController.roomDirections.EAST:
					newRoomId = currentRoom.exits.east;
					break;
				case GameController.roomDirections.SOUTH:
					newRoomId = currentRoom.exits.south;
					break;
				case GameController.roomDirections.WEST:
					newRoomId = currentRoom.exits.west;
					break;
				case GameController.roomDirections.UP:
					newRoomId = currentRoom.exits.up;
					break;
				case GameController.roomDirections.DOWN:
					newRoomId = currentRoom.exits.down;
					break;
				default:
					newRoomId = currentRoom.id;
					break;
			}
		}

		// Update the Game
		if (newRoomId > 0) {
			const newRoom = this.game.rooms.get(newRoomId);
			if (newRoom.id > 0) {
				currentRoom.removePlayer(player);
				newRoom.addPlayer(player);
				Logger.log(player.name + ' moved to ' + newRoom.name + '.', Logger.logTypes.DEBUG);
			}
		}

		// Return the new Room ID
		return newRoomId;
	}

	/**
	 * Handle a Player attacking an Enemy.
	 * @param {Player} player - The Player who is attacking.
	 * @param {Number} enemyId - The unique ID of the Enemy.
	 */
	attack(player, enemyId) {
		const enemy = this.game.enemies.get(enemyId);
		if (enemy.id > 0 && enemy.roomId === player.roomId) {
			player.attacking = enemyId;
			Logger.log(player.name + ' attacked "' + enemy.name + '".', Logger.logTypes.DEBUG);
		}
	}

	/**
	 * Handle a Player saying something to everyone else in their current Room.
	 * @param {Player} player - The Player who sent the message.
	 * @param {String} text - The content of the message.
	 */
	say(player, text) {
		const currentRoomId = player.roomId;
		this.playerControllers.forEach(playerController => {
			if (playerController.player.roomId == currentRoomId) {
				playerController.say(player, text);
			}
		});
		Logger.log(player.name + ' says, \'' + text + '\'.', Logger.logTypes.DEBUG);
	}

	/**
	 * Handle a Player yelling something to everyone in nearby Rooms.
	 * @param {Player} player - The Player who sent the message.
	 * @param {String} text - The content of the message.
	 */
	yell(player, text) {
		const currentRoom = this.game.rooms.get(player.roomId);
		this.playerControllers.forEach(playerController => {
			if (playerController.player.roomId == currentRoom.id
				|| playerController.player.roomId == currentRoom.exits.north
				|| playerController.player.roomId == currentRoom.exits.east
				|| playerController.player.roomId == currentRoom.exits.south
				|| playerController.player.roomId == currentRoom.exits.west
				|| playerController.player.roomId == currentRoom.exits.up
				|| playerController.player.roomId == currentRoom.exits.down) {
				playerController.yell(player, text);
			}
		});
		Logger.log(player.name + ' yells, \'' + text + '\'.', Logger.logTypes.DEBUG);
	}
}

module.exports = GameController;