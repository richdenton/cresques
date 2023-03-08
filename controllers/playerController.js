class PlayerController {

	static messageTypes = {
		MOVEMENT: 0,
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
			type: PlayerController.messageTypes.MOVEMENT,
			room: this.gameController.rooms.get(this.player.roomId)
		}));
	}

	/**
	 * Handle WebSocket "message" events.
	 * @param {Object} data - The content that was received.
	 * @param {Boolean} isBinary - Boolean to determine if the data is binary.
	 */
	handleMessage(data, isBinary) {
		if (data) {
			const message = JSON.parse(isBinary ? data : data.toString());

			// Move the Player
			if (message.move !== undefined) {
				const newRoomId = this.gameController.movePlayer(this.player, message.move);
				if (newRoomId > 0) {
					this.player.roomId = newRoomId;
					this.socket.send(JSON.stringify({
						type: PlayerController.messageTypes.MOVEMENT,
						room: this.gameController.rooms.get(newRoomId)
					}));
				}
			}
		}
	}

	/**
	 * Handle WebSocket "close" events.
	 */
	handleClose() {
		this.socket.close();
		this.gameController.removePlayerController(this);
	}
}

module.exports = PlayerController;