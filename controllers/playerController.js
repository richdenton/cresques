class PlayerController {

	static messageActions = {
		MOVE: 0,
		ENTER: 1,
		LEAVE: 2,
		SAY: 3,
		YELL: 4,
		ATTACK: 5,
		DIE: 6,
		TAKE: 7,
		DROP: 8,
		EQUIP: 9
	};

	static entityType = {
		PLAYER: 0,
		ENEMY: 1
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
			const message = JSON.parse(isBinary ? data : data.toString());
			switch (message.action) {

				// Move the Player
				case PlayerController.messageActions.MOVE:
					this.gameController.move(this.player, message.direction);
					break;

				// Say something to the Room
				case PlayerController.messageActions.SAY:
					this.gameController.say(this.player, message.text);
					break;

				// Yell something to all nearby Rooms
				case PlayerController.messageActions.YELL:
					this.gameController.yell(this.player, message.text);
					break;

				// Attack an Enemy
				case PlayerController.messageActions.ATTACK:
					this.gameController.attack(this.player, message.enemyId);
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
					this.gameController.equip(this.player, message.itemId);
					break;
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

			// Notify about Enemy changes
			room.enemies.forEach(enemy => {

				// Enter / Respawn
				if (enemy.newRoomId && enemy.newRoomId === this.player.roomId) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ENTER,
						enemy: enemy
					}));
				}

				// Combat
				if (enemy.damage) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						attacker: {
							type: PlayerController.entityType.PLAYER,
							id: enemy.attacker
						},
						defender: {
							type: PlayerController.entityType.ENEMY,
							id: enemy.id,
							damage: enemy.damage
						}
					}));
				}
			});

			// Notify about other Player changes
			room.players.forEach(player => {

				// Enter / Respawn
				if (player.newRoomId && player.newRoomId === this.player.roomId) {
					if (player.id === this.player.id) {
						socket.send(JSON.stringify({
							action: PlayerController.messageActions.MOVE,
							room: room
						}));
					} else {
						socket.send(JSON.stringify({
							action: PlayerController.messageActions.ENTER,
							player: player
						}));
					}
				}

				// Leave
				if (player.oldRoomId && player.oldRoomId === this.player.roomId && player.id !== this.player.id) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.LEAVE,
						playerId: player.id
					}));
				}

				// Combat
				if (player.damage) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						attacker: {
							type: PlayerController.entityType.ENEMY,
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
							type: PlayerController.entityType.ENEMY,
							id: player.attacking
						},
						corpse: {
							type: PlayerController.entityType.PLAYER,
							id: player.id
						}
					}));
				}
			});

			// Notify about Enemy deaths
			room.enemies.forEach(enemy => {
				if (enemy.killTime === now) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DIE,
						attacker: {
							type: PlayerController.entityType.PLAYER,
							id: enemy.attacking
						},
						corpse: {
							type: PlayerController.entityType.ENEMY,
							id: enemy.id
						}
					}));
				}
			});

			// Notify about Item changes
			room.items.forEach(item => {
				if (item.dropTime === now && item.playerId === this.player.id) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DROP,
						enemyId: item.enemyId,
						item: item
					}));
				}
			});
		}
	}

	/**
	 * Player entered a new Room.
	 * @param {Room} room - The Room the Player entered.
	 */
	move(room) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.MOVE,
			room: room
		}));
	}

	/**
	 * Another Player entered the Room.
	 * @param {Player} player - The Player who entered.
	 */
	enter(player) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.ENTER,
			player: player
		}));
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
	 * Retrieved a chat message from a Player in the same Room.
	 * @param {Player} sender - The Player who sent the message.
	 * @param {String} text - The content of the message.
	 */
	say(sender, text) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.SAY,
			senderId: sender.id,
			text: text
		}));
	}

	/**
	 * Retrieved a chat message from a Player in a nearby Room.
	 * @param {Player} sender - The Player who sent the message.
	 * @param {String} text - The content of the message.
	 */
	yell(sender, text) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.YELL,
			senderId: sender.id,
			text: text
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
	 * Player dropped up an Item.
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
}

module.exports = PlayerController;