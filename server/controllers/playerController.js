const Logger = require("../utils/logger");

class PlayerController {

	static messageActions = {
		MOVE: 'move',
		ENTER: 'enter',
		LEAVE: 'leave',
		SAY: 'say',
		YELL: 'yell',
		CONSIDER: 'con',
		HAIL: 'hail',
		ATTACK: 'attack',
		DIE: 'die',
		RESPAWN: 'res',
		TAKE: 'take',
		DROP: 'drop',
		DECAY: 'decay',
		EQUIP: 'equip',
		SHOP: 'shop',
		BUY: 'buy',
		SELL: 'sell'
	};

	static entityType = {
		PLAYER: 'player',
		MOB: 'mob'
	};

	/**
	 * Represents a Player client connection.
	 * @param {Player} player - The Player to be controlled.
	 * @param {WebSocket} socket - The WebSocket connection.
	 * @param {GameController} gameController - The GameController instance.
	 * @constructor
	 */
	constructor(player, socket, gameController) {
		this.player = player;
		this.socket = socket;
		this.gameController = gameController;
		this.handleMessage = this.socket.on('message', this.handleMessage.bind(this));
		this.handleClose = this.socket.on('close', this.handleClose.bind(this));

		// Enter the Room
		const room = this.gameController.game.rooms.get(this.player.roomId);
		if (room.id > 0) {
			room.addPlayer(this.player);
			this.move(room);
		}
	}

	/**
	 * Handle incoming WebSocket "message" events.
	 * @param {Object} data - The content that was received.
	 * @param {Boolean} isBinary - Boolean to determine if the data is binary.
	 */
	handleMessage(data, isBinary) {
		if (data) {
			try {
				const message = JSON.parse(isBinary ? data : data.toString());
				switch (message.action) {

					// Move the Player
					case PlayerController.messageActions.MOVE:
						this.gameController.move(this.player, message.direction);
						break;

					// Say something to the Room
					case PlayerController.messageActions.SAY:
						this.gameController.say(this.player, PlayerController.entityType.PLAYER, message.text);
						break;

					// Yell something to all nearby Rooms
					case PlayerController.messageActions.YELL:
						this.gameController.yell(this.player, PlayerController.entityType.PLAYER, message.text);
						break;

					// Consider the threat level of a Mob
					case PlayerController.messageActions.CONSIDER:
						this.gameController.consider(this, message.mobId);
						break;

					// Hail a Mob
					case PlayerController.messageActions.HAIL:
						this.gameController.hail(this, message.mobId);
						break;

					// Attack a Mob
					case PlayerController.messageActions.ATTACK:
						this.gameController.attack(this.player, message.mobId);
						break;

					// Respawn a Player
					case PlayerController.messageActions.RESPAWN:
						this.gameController.respawn(this.player);
						break;

					// Take an Item
					case PlayerController.messageActions.TAKE:
						this.gameController.take(this.player, message.itemId);
						break;

					// Drop an Item
					case PlayerController.messageActions.DROP:
						this.gameController.drop(this.player, message.itemId);
						break;

					// Equip an Item
					case PlayerController.messageActions.EQUIP:
						this.gameController.equip(this, message.itemId);
						break;

					// View a Shop
					case PlayerController.messageActions.SHOP:
						this.gameController.shop(this, message.mobId);
						break;

					// Buy an Item
					case PlayerController.messageActions.BUY:
						this.gameController.buy(this, message.mobId, message.itemId);
						break;

					// Sell an Item
					case PlayerController.messageActions.SELL:
						this.gameController.sell(this, message.mobId, message.itemId);
						break;
				}
			} catch (error) {
				Logger.log(error, Logger.logTypes.ERROR);
			}
		}
	}

	/**
	 * Handle WebSocket "close" events to explicitly terminate connections.
	 */
	handleClose() {
		this.socket.close();
		this.gameController.removePlayerController(this);
		this.gameController.game.players.updatePlayer(this.player);
	}

	/**
	 * Notify Player of any changes in the Game.
	 * @param {Number} now - The current time in milliseconds.
	 */
	update(now) {
		const room = this.gameController.game.rooms.get(this.player.roomId),
			socket = this.socket;
		if (room.id > 0) {

			// Notify about Mob movement and combat
			room.mobs.forEach(mob => {

				// Enter / Respawn
				if (mob.newRoomId && mob.newRoomId === this.player.roomId) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ENTER,
						mob: mob
					},
						[ 'action', 'mob', 'id', 'name' ]
					));
				}

				// Leave
				if (mob.oldRoomId && mob.oldRoomId === this.player.roomId) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.LEAVE,
						mobId: mob.id
					}));
				}

				// Combat
				if (mob.damage > -1) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						attacker: {
							type: PlayerController.entityType.PLAYER,
							id: mob.attacker
						},
						defender: {
							type: PlayerController.entityType.MOB,
							id: mob.id,
							damage: mob.damage
						}
					}));
				}
			});

			// Notify about Player movement and combat
			room.players.forEach(player => {

				// Enter / Respawn
				if (player.newRoomId && player.newRoomId === this.player.roomId) {
					if (player.id === this.player.id) {
						socket.send(JSON.stringify({
							action: PlayerController.messageActions.MOVE,
							zone: this.gameController.game.zones.get(room.zoneId),
							room: room,
						},
							[ 'action', 'zone', 'room', 'id', 'name', 'description', 'image', 'doors', 'n', 'e', 's', 'w', 'u', 'd', 'roomId', 'zoneId', 'players', 'mobs', 'items', 'health', 'healthMax' ]
						));
					} else {
						socket.send(JSON.stringify({
							action: PlayerController.messageActions.ENTER,
							player: player
						},
							[ 'action', 'player', 'id', 'name' ]
						));
					}
				}

				// Combat
				if (player.damage > -1) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						attacker: {
							type: PlayerController.entityType.MOB,
							id: player.attacker
						},
						defender: {
							type: PlayerController.entityType.PLAYER,
							id: player.id,
							damage: player.damage
						}
					}));
				}

				// Death
				if (player.killTime === now) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DIE,
						attacker: {
							type: PlayerController.entityType.MOB,
							id: player.attacking
						},
						corpse: {
							type: PlayerController.entityType.PLAYER,
							id: player.id
						}
					}));
				}
			});

			// Notify about Mob deaths
			room.mobs.forEach(mob => {
				if (mob.killTime === now) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DIE,
						attacker: {
							type: PlayerController.entityType.PLAYER,
							id: mob.attacking
						},
						corpse: {
							type: PlayerController.entityType.MOB,
							id: mob.id
						}
					}));
				}
			});

			// Notify about Item changes
			room.items.forEach(item => {
				if (item.dropTime === now && item.playerId === this.player.id) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DROP,
						mobId: item.mobId,
						item: item
					}));
				}
				if (item.decayed) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DECAY,
						item: item
					},
						[ 'action', 'item', 'id', 'name' ]
					));
				}
			});
		}

		// Notify about Mobs no longer in the Room
		this.gameController.game.mobs.map.forEach(mob => {
			if (mob.oldRoomId && mob.oldRoomId === this.player.roomId) {
				socket.send(JSON.stringify({
					action: PlayerController.messageActions.LEAVE,
					mobId: mob.id
				}));
			}
		});

		// Notify about Players no longer in the Room
		this.gameController.game.players.map.forEach(player => {
			if (player.oldRoomId && player.oldRoomId === this.player.roomId && player.id !== this.player.id) {
				socket.send(JSON.stringify({
					action: PlayerController.messageActions.LEAVE,
					playerId: player.id
				}));
			}
		});
	}

	/**
	 * Player entered a new Room.
	 * @param {Room} room - The Room the Player entered.
	 */
	move(room) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.MOVE,
			zone: this.gameController.game.zones.get(room.zoneId),
			room: room,
		},
			[ 'action', 'zone', 'room', 'id', 'name', 'description', 'image', 'doors', 'n', 'e', 's', 'w', 'u', 'd', 'roomId', 'zoneId', 'players', 'mobs', 'items', 'health', 'healthMax' ]
		));
	}

	/**
	 * Another Player entered the Room.
	 * @param {Player} player - The Player who entered.
	 */
	enter(player) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.ENTER,
			player: player
		},
			[ 'action', 'player', 'id', 'name' ]
		));
	}

	/**
	 * Another Player left the Room.
	 * @param {Player} player - The Player who left.
	 */
	leave(player) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.LEAVE,
			playerId: player.id
		}));
	}

	/**
	 * Retrieved a chat message from a Player or Mob in the same Room.
	 * @param {Entity} sender - The Entity who sent the message.
	 * @param {Number} type - The type of the Entity.
	 * @param {String} text - The content of the message.
	 */
	say(sender, type, text) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.SAY,
			sender: {
				id: sender.id,
				type: type
			},
			text: text
		}));
	}

	/**
	 * Retrieved a chat message from a Player or Mob in a nearby Room.
	 * @param {Entity} sender - The Entity who sent the message.
	 * @param {Number} type - The type of the Entity.
	 * @param {String} text - The content of the message.
	 */
	yell(sender, type, text) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.YELL,
			sender: {
				id: sender.id,
				type: type
			},
			text: text
		}));
	}

	/**
	 * Player considered the threat and faction levels of a Mob.
	 * @param {Mob} mob - The Mob being considered.
	 * @param {Object} threat - The threat level object. See gameConfig.threatScale.
	 * @param {Object} faction - The faction level object. See gameConfig.factionScale.
	 */
	consider(mob, threat, faction) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.CONSIDER,
			mobId: mob.id,
			threat: threat.index,
			faction: faction.index
		}));
	}

	/**
	 * Player hailed a Mob.
	 * @param {Player} player - The Player performing the hail.
	 * @param {Mob} mob - The Mob being hailed.
	 */
	hail(player, mob) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.HAIL,
			mobId: mob.id,
			playerId: player.id
		}));
	}

	/**
	 * Player picked up an Item.
	 * @param {Player} player - The Player who took the Item.
	 * @param {Item} item - The Item that was taken.
	 */
	take(player, item) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.TAKE,
			playerId: player.id,
			item: item
		}));
	}

	/**
	 * Player dropped an Item.
	 * @param {Player} player - The Player who dropped the Item.
	 * @param {Item} item - The Item that was dropped.
	 */
	drop(player, item) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.DROP,
			playerId: player.id,
			item: item
		}));
	}

	/**
	 * Player equipped an Item from their Inventory.
	 * @param {Item} item - The Item that was equipped.
	 */
	equip(item) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.EQUIP,
			itemId: item.id
		}));
	}

	/**
	 * Player viewed a Shop's Inventory.
	 * @param {Shop} shop - The Shop that was viewed.
	 */
	shop(shop) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.SHOP,
			shop: shop
		}));
	}

	/**
	 * Player bought an Item from a Shop.
	 * @param {Player} player - The Player who bought the Item.
	 * @param {Mob} mob - The Mob associated with the Shop.
	 * @param {Item} item - The Item associated with the sale.
	 */
	buy(player, mob, item) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.BUY,
			playerId: player.id,
			mobId: mob.id,
			item: item
		}));
	}

	/**
	 * Player sold an Item to a Shop.
	 * @param {Player} player - The Player who sold the Item.
	 * @param {Mob} mob - The Mob associated with the Shop.
	 * @param {Item} item - The Item associated with the sale.
	 */
	sell(player, mob, item) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.SELL,
			playerId: player.id,
			mobId: mob.id,
			item: item
		}));
	}
}

module.exports = PlayerController;