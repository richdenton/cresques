class PlayerController {

	static messageActions = {
		MOVE: 0,
		ATTACK: 1,
		SAY: 2,
		YELL: 3,
		DEATH: 4,
		ENTER: 5
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
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.MOVE,
			room: this.gameController.game.rooms.get(this.player.roomId)
		}));
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
					const newRoomId = this.gameController.movePlayer(this.player, message.direction);
					if (newRoomId > 0) {
						const newRoom = this.gameController.game.rooms.get(newRoomId);
						if (newRoom.id > 0) {
							this.socket.send(JSON.stringify({
								action: PlayerController.messageActions.MOVE,
								room: newRoom
							}));
						}
					}
					break;

				// Attack an Enemy
				case PlayerController.messageActions.ATTACK:
					this.gameController.attack(this.player, message.enemyId);
					break;

				// Say something to the Room
				case PlayerController.messageActions.SAY:
					this.gameController.say(this.player, message.text);
					break;

				// Yell something to all nearby Rooms
				case PlayerController.messageActions.YELL:
					this.gameController.yell(this.player, message.text);
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
						enemyId: enemy.id,
						damage: enemy.damage
					}));
				}

				// Death
				if (enemy.health < 1) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DEATH,
						enemy: enemy
					}));
				}

				// Movement
				if (enemy.moved) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ENTER,
						enemy: enemy
					}));
				}
			});

			// Notify about Player changes
			room.players.forEach(player => {

				// Combat
				if (player.damage) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						playerId: player.id,
						damage: player.damage
					}));
				}

				// Death
				if (player.health < 1) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.DEATH,
						player: player
					}));
				}

				// Movement
				if (player.moved && player.id !== this.player.id) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ENTER,
						player: player
					}));
				}
			});
		}
	}

	/**
	 * Retrieved a chat message from a Player in the same Room.
	 * @param {Player} sender - The Player who sent the message.
	 * @param {String} text - The content of the message.
	 */
	say(sender, text) {
		this.socket.send(JSON.stringify({
			action: PlayerController.messageActions.SAY,
			sender: sender,
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
			sender: sender,
			text: text
		}));
	}
}

module.exports = PlayerController;