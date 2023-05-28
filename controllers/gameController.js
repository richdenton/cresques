const config = require('../config/gameConfig');
const Game = require('../models/game');
const GameUtils = require('../utils/gameUtils');
const Logger = require('../utils/logger');

class GameController {

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

		// Determine if the Player can move
		if (player.health > 0 && !player.attacking && !player.encumbered) {

			// Determine if the direction is available
			const currentRoom = this.game.rooms.get(player.roomId);
			let newRoomId = 0;
			if (currentRoom.id) {
				switch(direction) {
					case config.roomDirections.NORTH:
						newRoomId = currentRoom.exits.north;
						break;
					case config.roomDirections.EAST:
						newRoomId = currentRoom.exits.east;
						break;
					case config.roomDirections.SOUTH:
						newRoomId = currentRoom.exits.south;
						break;
					case config.roomDirections.WEST:
						newRoomId = currentRoom.exits.west;
						break;
					case config.roomDirections.UP:
						newRoomId = currentRoom.exits.up;
						break;
					case config.roomDirections.DOWN:
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
				if (newRoom) {

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

					// End any open Conversations
					player.conversation = {};
				} else {
					Logger.log('Could not move ' + player.name + '.', Logger.logTypes.ERROR);
				}
			}
		}
	}

	/**
	 * Handle a Player or Mob saying something to everyone in the current Room.
	 * @param {Entity} sender - The Player or Mob who sent the message.
	 * @param {Number} type - The type of the Entity.
	 * @param {String} text - The content of the message.
	 */
	say(sender, type, text) {
		const currentRoomId = sender.roomId;

		// Notify other Players
		this.playerControllers.forEach(playerController => {
			if (playerController.player.roomId == currentRoomId) {
				playerController.say(sender, type, text);
			}
		});
		Logger.log(sender.name + ' says, \'' + text + '\'', Logger.logTypes.DEBUG);

		// Check if Player is in a Conversation
		if (sender.conversation) {
			const mob = this.game.mobs.get(sender.conversation.mobId);
			if (mob && mob.roomId === sender.roomId) {
				const conversation = mob.conversations.find(c => c.id === sender.conversation.id);
				if (conversation) {
					const response = conversation.responses.find(r => text.toLowerCase().indexOf(r.input) > -1);
					if (response) {
						const nextConversation = mob.conversations.find(n => n.id === response.nextId);
						if (nextConversation && sender.meetsConditions(nextConversation)) {
							sender.conversation = {
								id: nextConversation.id,
								mobId: mob.id
							};
							this.say(mob, 1, nextConversation.getFormattedMessage(sender));
						}
					}
				}
			}
		}
	}

	/**
	 * Handle a Player or Mob yelling something to everyone in nearby Rooms.
	 * @param {Entity} sender - The Player or Mob who sent the message.
	 * @param {Number} type - The type of the Entity.
	 * @param {String} text - The content of the message.
	 */
	yell(sender, type, text) {
		const currentRoom = this.game.rooms.get(sender.roomId);
		this.playerControllers.forEach(playerController => {
			if (playerController.player.roomId == currentRoom.id
				|| playerController.player.roomId == currentRoom.exits.north
				|| playerController.player.roomId == currentRoom.exits.east
				|| playerController.player.roomId == currentRoom.exits.south
				|| playerController.player.roomId == currentRoom.exits.west
				|| playerController.player.roomId == currentRoom.exits.up
				|| playerController.player.roomId == currentRoom.exits.down) {
				playerController.yell(sender, type, text);
			}
		});
		Logger.log(sender.name + ' yells, \'' + text + '\'', Logger.logTypes.DEBUG);
	}

	/**
	 * Handle a Player considering the threat and faction levels of a Mob.
	 * @param {PlayerController} playerController - The Player who is considering.
	 * @param {Number} mobId - The unique ID of the Mob to be considered.
	 */
	consider(playerController, mobId) {
		const mob = this.game.mobs.get(mobId);
		if (mob) {
			if (mob.roomId === playerController.player.roomId) {
				const threatLevel = playerController.player.getThreatLevel(mob),
					factionLevel = playerController.player.getFactionLevel(mob);
				playerController.consider(mob, threatLevel, factionLevel);
				Logger.log(playerController.player.name + ' considered "' + mob.name + '" (threat: ' + threatLevel.index + ', faction: ' + factionLevel.index + ').', Logger.logTypes.DEBUG);
			} else {
				Logger.log(playerController.player.name + ' is too far away from "' + mob.name + '".', Logger.logTypes.ERROR);
			}
		} else {
			Logger.log('No mob found with ID ' + mobId + '.', Logger.logTypes.ERROR);
		}
	}

	/**
	 * Handle a Player hailing a Mob.
	 * @param {PlayerController} playerController - The Player who is considering.
	 * @param {Number} mobId - The unique ID of the Entity being hailed.
	 */
	hail(playerController, mobId) {
		const mob = this.game.mobs.get(mobId);
		if (mob) {
			if (mob.roomId === playerController.player.roomId) {
				const factionLevel = playerController.player.getFactionLevel(mob).index;
				if (factionLevel >= config.factionScale.INDIFFERENT.index) {

					// Determine if Mob is a merchant
					if (mob.shop) {
						playerController.shop(mob.shop);
						return;
					}

					// Otherwise, find the most applicable Conversation
					let conversation = null;
					for (const iterator of mob.conversations.filter(c => c.parentId === 0)) {
						if (playerController.player.meetsConditions(iterator)) {
							conversation = iterator;
						}
					}

					// Save current Conversation to the Player and display the message
					if (conversation) {
						playerController.player.conversation = {
							id: conversation.id,
							mobId: conversation.mobId
						};
						this.say(mob, 1, conversation.getFormattedMessage(playerController.player));
					}
				} else if (factionLevel == config.factionScale.AGGRESSIVE.index) {
					mob.attacking = player.id;
					Logger.log('"' + mob.name + '" attacked ' + playerController.player.name + '.', Logger.logTypes.DEBUG);
				}
			} else {
				Logger.log(playerController.player.name + ' is too far away from "' + mob.name + '".', Logger.logTypes.ERROR);
			}
		} else {
			Logger.log('No mob found with ID ' + mobId + '.', Logger.logTypes.ERROR);
		}
	}

	/**
	 * Handle a Player attacking a Mob.
	 * @param {Player} player - The Player who is attacking.
	 * @param {Number} mobId - The unique ID of the Mob.
	 */
	attack(player, mobId) {
		const mob = this.game.mobs.get(mobId);
		if (mob) {
			if (mob.roomId === player.roomId) {
				player.attacking = mobId;
				Logger.log(player.name + ' attacked "' + mob.name + '".', Logger.logTypes.DEBUG);
			} else {
				Logger.log(player.name + ' is too far away from "' + mob.name + '".', Logger.logTypes.ERROR);
			}
		} else {
			Logger.log('No mob found with ID ' + mobId + '.', Logger.logTypes.ERROR);
		}
	}

	/**
	 * Handle a Player taking an Item from a Room.
	 * @param {Player} player - The Player who is taking the Item.
	 * @param {Number} itemId - The unique ID of the Item.
	 */
	take(player, itemId) {
		const room = this.game.rooms.get(player.roomId);
		if (room) {
			const item = room.items.find(i => i.id === itemId);
			if (item) {
				if ((item.playerId || player.id) === player.id) {

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

	/**
	 * Handle a Player dropping an Item in a Room.
	 * @param {Player} player - The Player who is dropping the Item.
	 * @param {Number} itemId - The unique ID of the Item.
	 */
	drop(player, itemId) {
		const room = this.game.rooms.get(player.roomId);
		if (room) {
			const item = player.items.find(i => i.id === itemId);
			if (item) {

				// Update the Game
				room.addItem(item);
				player.removeItem(item);
				Logger.log(player.name + ' dropped ' + item.name + '.', Logger.logTypes.DEBUG);

				// Update Players
				this.playerControllers.forEach(playerController => {
					playerController.drop(player, item);
				});
			} else {
				Logger.log(player.name + ' is not carrying item ' + itemId + '.', Logger.logTypes.ERROR);
			}
		} else {
			Logger.log(player.name + ' is not in a room.', Logger.logTypes.ERROR);
		}
	}

	/**
	 * Handle a Player equipping an Item from their Inventory.
	 * @param {PlayerController} playerController - The Player who is equipping the Item.
	 * @param {Number} itemId - The unique ID of the Item.
	 */
	equip(playerController, itemId) {

		// Ensure the Player has possession of the Item
		const item = playerController.player.items.find(i => i.id === itemId);
		if (item) {
			if (item.type === config.itemTypes.EQUIPMENT) {
				playerController.player.equipItem(item);
				playerController.equip(item);
			} else {
				Logger.log(playerController.player.name + ' cannot equip item ' + itemId + '.', Logger.logTypes.ERROR);
			}
		} else {
			Logger.log(playerController.player.name + ' is not carrying item ' + itemId + '.', Logger.logTypes.ERROR);
		}
	}

	/**
	 * Handle a Player buying an Item from a Shop.
	 * @param {Player} player - The Player who is buying.
	 * @param {Number} mobId - The unique ID of the Mob.
	 * @param {Number} itemId - The unique ID of the Item.
	 */
	buy(player, mobId, itemId) {
		const mob = this.game.mobs.get(mobId);
		if (mob) {
			if (mob.roomId === player.roomId) {
				const shop = mob.shop;
				if (shop) {
					const item = shop.items.find(i => i.id === itemId);
					if (item) {
						if (player.money >= item.value) {
							
							// Make the sale
							player.money -= item.value;
							player.addItem(item);
							shop.sellItem(item);

							// Update Players in the Room
							this.playerControllers.forEach(playerController => {
								if (playerController.player.roomId === player.roomId) {
									playerController.buy(player, mob, item);
								}
							});
						} else {
							Logger.log(player.name + ' cannot afford ' + item.name + '.', Logger.logTypes.ERROR);
						}
					} else {
						Logger.log('No item found with ID ' + itemId + ' in the shop associated with "' +  mob.name + '".', Logger.logTypes.ERROR);
					}
				} else {
					Logger.log('No shop associated with "' + mob.name + '".', Logger.logTypes.ERROR);
				}
			} else {
				Logger.log(player.name + ' is too far away from "' + mob.name + '".', Logger.logTypes.ERROR);
			}
		} else {
			Logger.log('No mob found with ID ' + mobId + '.', Logger.logTypes.ERROR);
		}
	}

	/**
	 * Handle a Player selling an Item to a Shop.
	 * @param {Player} player - The Player who is selling.
	 * @param {Number} mobId - The unique ID of the Mob.
	 * @param {Number} itemId - The unique ID of the Item.
	 */
	buy(player, mobId, itemId) {
		const mob = this.game.mobs.get(mobId);
		if (mob) {
			if (mob.roomId === player.roomId) {
				const shop = mob.shop;
				if (shop) {
					const item = shop.items.find(i => i.id === itemId);
					if (item) {
						if (shop.money >= item.value) {
							
							// Make the sale
							player.money += item.value;
							player.removeItem(item);
							shop.buyItem(item);

							// Update Players in the Room
							this.playerControllers.forEach(playerController => {
								if (playerController.player.roomId === player.roomId) {
									playerController.sell(player, mob, item);
								}
							});
						} else {
							Logger.log('"' + mob.name + '" cannot afford ' + item.name + '.', Logger.logTypes.ERROR);
						}
					} else {
						Logger.log('No item found with ID ' + itemId + ' in the shop associated with "' +  mob.name + '".', Logger.logTypes.ERROR);
					}
				} else {
					Logger.log('No shop associated with "' + mob.name + '".', Logger.logTypes.ERROR);
				}
			} else {
				Logger.log(player.name + ' is too far away from "' + mob.name + '".', Logger.logTypes.ERROR);
			}
		} else {
			Logger.log('No mob found with ID ' + mobId + '.', Logger.logTypes.ERROR);
		}
	}
}

module.exports = GameController;