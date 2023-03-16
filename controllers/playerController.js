class PlayerController {

	static messageActions = {
		MOVE: 0,
		ENTER: 1,
		LEAVE: 2,
		SAY: 3,
		YELL: 4,
		ATTACK: 5,
		DIE: 6
	};

	static attackTypes = {
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
			}
		}
	}

	/**
	 * Handle incoming WebSocket "close" events.
	 */
	handleClose() {
		this.socket.close();
		this.gameController.removePlayerController(this);
		this.gameController.game.players.updatePlayer(this.player);
	}

	/**
	 * Notify Player of any changes in the Game.
	 */
	update() {
		const room = this.gameController.game.rooms.get(this.player.roomId),
			socket = this.socket;
		if (room.id > 0) {

			// Notify about Enemy changes
			room.enemies.forEach(enemy => {

				// Combat
				if (enemy.damage) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						attacker: {
							type: PlayerController.attackTypes.PLAYER,
							id: enemy.attacking
						},
						defender: {
							type: PlayerController.attackTypes.ENEMY,
							id: enemy.id,
							damage: enemy.damage
						}
					}));
				}

				// Death
				if (enemy.health < 1) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DIE,
						enemyId: enemy.id
					}));
				}
			});

			// Notify about other Player changes
			room.players.forEach(player => {

				// Movement
				if (player.moved) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.MOVE,
						room: room
					}));
				}

				// Combat
				if (player.damage) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						attacker: {
							type: PlayerController.attackTypes.PLAYER,
							id: player.attacking
						},
						defender: {
							type: PlayerController.attackTypes.ENEMY,
							id: player.id,
							damage: player.damage
						}
					}));
				}

				// Death
				if (player.health < 1) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DIE,
						playerId: player.id
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
			playerId: player.id
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
}

module.exports = PlayerController;