const config = require('../config/gameConfig');
const Game = require('../models/game');
const GameUtils = require('../utils/gameUtils');
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
		setInterval(function(_this) {
			const now = GameUtils.getCurrentTimeMs();
			_this.game.update(now);
			_this.playerControllers.forEach(playerController => {
				playerController.update(now);
			});
		}, config.refreshRate, this);
	}

	/**
	 * Add a new PlayerController to the game.
	 * @param {PlayerController} playerController - The PlayerController to be added.
	 */
	addPlayerController(playerController) {
		playerController.player.isActive = true;
		this.playerControllers.push(playerController);
		Logger.log(playerController.player.name + ' entered the game.', Logger.logTypes.INFO);
	}

	/**
	 * Remove a PlayerController from the game.
	 * @param {PlayerController} playerController - The PlayerController to be removed.
	 */
	removePlayerController(playerController) {
		playerController.player.isActive = false;
		this.playerControllers = this.playerControllers.filter(pc => pc.player.id !== playerController.player.id);
		Logger.log(playerController.player.name + ' left the game.', Logger.logTypes.INFO);
	}

	/**
	 * Move a Player to a new Room.
	 * @param {Player} player - The Player to be moved.
	 * @param {Number} direction - The direction to be moved. See roomDirections.
	 */
	move(player, direction) {

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

		// Check if the new Room is valid
		if (newRoomId > 0) {
			const newRoom = this.game.rooms.get(newRoomId);
			if (newRoom.id > 0) {

				// Update the Game
				currentRoom.removePlayer(player);
				newRoom.addPlayer(player);
				Logger.log(player.name + ' moved to ' + newRoom.name + '.', Logger.logTypes.DEBUG);

				// Update Players
				this.playerControllers.forEach(playerController => {
					if (playerController.player.id === player.id) {
						playerController.move(newRoom);
					} else {
						if (playerController.player.roomId === currentRoom.id) {
							playerController.leave(player);
						}
						if (playerController.player.roomId === newRoom.id) {
							playerController.enter(player);
						}
					}
				});
			} else {
				Logger.log('Could not move ' + player.name + '.', Logger.logTypes.ERROR);
			}
		}
	}

	/**
	 * Handle a Player saying something to everyone in the current Room.
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
	 * Handle a Player taking an Item from a Room.
	 * @param {Player} player - The Player who is taking the Item.
	 * @param {Number} itemId - The unique ID of the Item.
	 */
	take(player, itemId) {
		const room = this.game.rooms.get(player.roomId);
		if (room.id > 0) {
			const item = room.items.find(i => i.id === itemId);
			if (item.id > 0) {
				if (item.playerId === player.id) {

					// Update the Game
					player.addItem(item);
					room.removeItem(item);
					Logger.log(player.name + ' picked up ' + item.name + '.', Logger.logTypes.DEBUG);

					// Update Players
					this.playerControllers.forEach(playerController => {
						playerController.take(player, item);
					});
				} else {
					Logger.log('Item ' + itemId + ' does not belong to ' + player.name + '.', Logger.logTypes.ERROR);
				}
			} else {
				Logger.log('Item ' + itemId + ' not found in ' + room.name + '.', Logger.logTypes.ERROR);
			}
		} else {
			Logger.log(player.name + ' is not in a room.', Logger.logTypes.ERROR);
		}
	}
}

module.exports = GameController;