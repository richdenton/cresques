class PlayerController {

	static messageActions = {
		MOVE: 0,
		ATTACK: 1,
		SAY: 2,
		YELL: 3
	};

	/**
	 * Represents a Player client connection.
	 * @constructor
	 */
	constructor(player, socket, gameController) {
		this.player = player;
		this.socket = socket;
		this.gameController = gameController;
		this.handleMessage = this.socket.on('message', this.handleMessage.bind(this));
		this.handleMessage = this.socket.on('close', this.handleClose.bind(this));

		// Welcome the Player
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
						this.player.roomId = newRoomId;
						this.socket.send(JSON.stringify({
							action: PlayerController.messageActions.MOVE,
							room: this.gameController.game.rooms.get(newRoomId)
						}));
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
	}

	/**
	 * Notify Player of any changes in the Game.
	 */
	update() {
		const room = this.gameController.game.rooms.get(this.player.roomId),
			socket = this.socket;
		if (room.id > 0) {

			// Notify of Enemy damage
			room.enemies.forEach(function(enemy) {
				if (enemy.damage) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						enemyId: enemy.id,
						damage: enemy.damage
					}));
				}
			});

			// Notify of Player damage
			room.players.forEach(function(player) {
				if (player.damage) {
					socket.send(JSON.stringify({
						action: PlayerController.messageActions.ATTACK,
						playerId: player.id,
						damage: player.damage
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