const config = require('../config/serverConfig');
const strings = require('../config/strings');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const GameController = require('./gameController');
const Player = require('../models/player');
const PlayerController = require('./playerController');
const User = require('../models/user');
const Users = require('../models/users');
const Logger = require('../utils/logger');

class ServerController {

	constructor() {
		this.gameController = new GameController();
		this.users = new Users();
	}

	/**
	 * Fill local model stores with data from the database.
	 */
	async loadDatabases() {
		await this.users.load();
		await this.gameController.game.items.load();
		await this.gameController.game.rooms.load();
		await this.gameController.game.species.load();
		await this.gameController.game.enemySpawns.load();
		await this.gameController.game.enemyTemplates.load();
		this.gameController.game.enemies.init(this.gameController.game.enemySpawns, this.gameController.game.enemyTemplates, this.gameController.game.rooms);
		await this.gameController.game.players.load();
		await this.gameController.game.playerInventories.load(this.gameController.game.players, this.gameController.game.items);
	}

	/**
	 * Start the main game loop.
	 */
	startGameLoop() {
		this.gameController.startGameLoop();
	}

	/**
	 * Lookup the currently logged in User.
	 * @param {Request} request - The request data.
	 * @return {User} The current User, or an empy object.
	 */
	getUserFromCookie(request) {
		let user = new User();

		// Look for a valid access token cookie
		let cookies = {};
		if (request.headers.cookie) {
			request.headers.cookie.split(';').forEach(function(cookie) {
				var parts = cookie.match(/(.*?)=(.*)$/);
				cookies[parts[1].trim()] = (parts[2] || '').trim();
			});
		}

		// Verify the token
		if (cookies.access_token) {
			jwt.verify(cookies.access_token, config.tokenSecret, (error, decoded) => {
				if (decoded) {
					user = this.users.findById(decoded.id);
				}
			});
		}

		// Return the User
		return user;
	}

	/**
	 * Register a new User to the system.
	 * @param {Request} request - The request data.
	 * @param {Response} response - The response to return to.
	 * @return {Response} Response with a new access token cookie attached.
	 */
	async signup(request, response) {
		try {

			// Verify that the user does not already exist
			let user = this.users.findByEmail(request.body.email);
			if (user.id) {
				Logger.log('Could not register user due to duplicate email: ' + request.body.email, Logger.logTypes.WARN);
				return response.status(401).send({
					message: strings.emailInvalid
				});
			}

			// Create user and save to the database
			user = new User({
				email: request.body.email,
				password: bcrypt.hashSync(request.body.password, config.passwordSaltLength)
			});
			user = await this.users.saveUser(user);

			// Verify the user was created
			if (user.id < 1) {
				Logger.log('Could not write user to the database: ' + request.body, Logger.logTypes.WARN);
				return response.status(500).send({
					message: strings.signupError
				});
			}

			// Generate a new token
			const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
				expiresIn: config.tokenExpiration
			});

			// Save access token and User ID cookies
			response.cookie('access_token', token, { httpOnly: true });
			response.cookie('uid', user.id, { maxAge: config.tokenExpiration * 1000 });

			// Return the response
			Logger.log('User ' + user.id + ' signed up.', Logger.logTypes.INFO);
			return response.status(200).send({
				message: strings.signupSuccess
			});
		} catch (error) {
			response.status(500).send({
				message: error.message
			});
		}
	}

	/**
	 * Login an existing User.
	 * @param {Request} request - The request data.
	 * @param {Response} response - The response to return to.
	 * @return {Response} Status message assigned to the response.
	 */
	async login(request, response) {
		try {

			// Look for an active access token in the request
			let user = this.getUserFromCookie(request);

			// Otherwise, attempt to login with email and password
			if (user.id < 1) {

				// Verify that the User exists
				user = this.users.findByEmail(request.body.email);
				if (user.id < 1) {
					Logger.log('Could not login user: ' + request.body, Logger.logTypes.WARN);
					return response.status(401).send({
						message: strings.loginError
					});
				}

				// Verify password
				const passwordIsValid = bcrypt.compareSync(request.body.password, user.password);
				if (!passwordIsValid) {
					Logger.log('User ' + user.id + ' entered the wrong password.', Logger.logTypes.WARN);
					return response.status(401).send({
						message: strings.loginError
					});
				}
			}

			// Generate a new token
			const token = jwt.sign({ id: user.id }, config.tokenSecret, {
				expiresIn: config.tokenExpiration
			});

			// Save access token and User ID cookies
			response.cookie('access_token', token, { httpOnly: true });
			response.cookie('uid', user.id, { maxAge: config.tokenExpiration * 1000 });

			// Return the response
			Logger.log('User ' + user.id + ' logged in.', Logger.logTypes.INFO);
			return response.status(200).send({
				message: strings.loginSuccess
			});
		} catch (error) {
			return response.status(500).send({
				message: error.message
			});
		}
	}

	/**
	 * Logout an existing User from the system.
	 * @param {Request} request - The request data.
	 * @param {Response} response - The response to return to.
	 * @return {Response} Status message assigned to the response. Access token will be removed.
	 */
	async logout(request, response) {
		try {

			// Get the currently logged in User
			const user = this.getUserFromCookie(request);
			if (user.id < 1) {
				return response.status(500).send({
					message: strings.unauthorized
				});
			}

			// Delete the access token cookie
			response.clearCookie('access_token');
			response.clearCookie('uid');

			// Return the response
			Logger.log('User ' + user.id + ' logged out.', Logger.logTypes.INFO);
			return response.status(200).send({
				message: strings.logoutSuccess
			});
		} catch (error) {
			this.next(error);
		}
	}

	/**
	 * Lookup the list of available Species to choose from.
	 * @param {Request} request - The request data with an access token.
	 * @param {Response} response - The response to return any status to.
	 * @return {Response} Response with a list of Players attached.
	 */
	async getSpecies(request, response) {
		try {

			// Get the currently logged in User
			const user = this.getUserFromCookie(request);
			if (user.id < 1) {
				return response.status(500).send({
					message: strings.unauthorized
				});
			}

			// Find and return all Players owned by this User
			const species = this.gameController.species.getAll();
			return response.status(200).send(JSON.stringify({
				species: species
			}));
		} catch (error) {
			response.status(500).send({
				message: error.message
			});
		}
	}

	/**
	 * Lookup all Players owned by the current User.
	 * @param {Request} request - The request data with an access token.
	 * @param {Response} response - The response to return any status to.
	 * @return {Response} Response with a list of Players attached.
	 */
	async getPlayers(request, response) {
		try {

			// Get the currently logged in User
			const user = this.getUserFromCookie(request);
			if (user.id < 1) {
				return response.status(500).send({
					message: strings.unauthorized
				});
			}

			// Find and return all Players owned by this User
			const players = this.gameController.game.players.findAllByUserId(user.id);
			return response.status(200).send(JSON.stringify({
				players: players
			}));
		} catch (error) {
			response.status(500).send({
				message: error.message
			});
		}
	}

	/**
	 * Create a new Player and save to the database.
	 * @param {Request} request - The request data including "name" and "speciesId" of the new Player.
	 * @param {Response} response - The response to return to.
	 * @return {Response} Response with a list of Players attached.
	 */
	async createPlayer(request, response) {
		try {
		
			// Get the currently logged in User
			const user = this.getUserFromCookie(request);
			if (user.id < 1) {
				return response.status(500).send({
					message: strings.unauthorized
				});
			}

			// todo: validate name and species

			// Create and return a new Player
			let player = new Player();
			player.name = request.body.name;
			player.userId = user.id;
			player.speciesId = parseInt(request.body.speciesId);

			// Determine starting location
			const species = this.gameController.species.get(player.speciesId);
			if (species.id) {
				player.health = species.health;
				player.roomId = species.roomId;
			} else {
				return response.status(500).send(JSON.stringify({
					message: strings.createPlayerError
				}));
			}

			// Save and return the Player
			player = await this.gameController.game.players.savePlayer(player);
			if (player.id) {
				return response.status(200).send(JSON.stringify({
					player: player
				}));
			} else {
				return response.status(500).send(JSON.stringify({
					message: strings.createPlayerError
				}));
			}
		} catch (error) {
			response.status(500).send({
				message: error.message
			});
		}
	}

	/**
	 * Delete a given Player from the database.
	 * @param {Request} request - The request data including "id" of the Player.
	 * @param {Response} response - The response to return to.
	 * @return {Response} Status message assigned to the response.
	 */
	async deletePlayer(request, response) {
		try {

			// Get the currently logged in User
			const user = this.getUserFromCookie(request);
			if (user.id < 1) {
				return response.status(500).send({
					message: strings.unauthorized
				});
			}

			// Retrieve the Player ID from the request and attmept to delete
			const success = this.gameController.game.players.deletePlayer(request.body.playerId);
			if (success) {
				return response.status(200).send(JSON.stringify({
					message: strings.deletePlayerSuccess
				}));
			} else {
				return response.status(500).send(JSON.stringify({
					message: strings.deletePlayerError
				}));
			}
		} catch (error) {
			response.status(500).send({
				message: error.message
			});
		}
	}

	/**
	 * Mark a given Player as active.
	 * @param {Request} request - The request data including "id" of the Player.
	 * @param {Response} response - The response to return to.
	 * @return {Response} Status message assigned to the response.
	 */
	selectPlayer(request, response) {
		try {

			// Get the currently logged in User
			const user = this.getUserFromCookie(request);
			if (user.id < 1) {
				return response.status(500).send({
					message: strings.unauthorized
				});
			}

			// Set Player as active
			user.playerId = parseInt(request.body.playerId);
			return response.status(200).send(JSON.stringify({
				message: strings.loginPlayerSuccess
			}));
		} catch (error) {
			response.status(500).send({
				message: error.message
			});
		}
	}

	/**
	 * Handle new WebSocket connections
	 * @param {WebSocket} socker - The socket attempting to connect.
	 * @param {Request} request - The request data including "id" of the Player.
	 */
	openConnection(socket, request) {

		// Get the currently logged in User
		const user = this.getUserFromCookie(request);
		if (user.id < 1) {
			socket.close();
			return;
		}

		// Get the currently active Player
		const player = this.gameController.game.players.get(user.playerId);
		if (player.id < 1) {
			socket.close();
			return;
		}

		// Add this Player to the game
		const playerController = new PlayerController(player, socket, this.gameController);
		this.gameController.addPlayerController(playerController);
	}
}

module.exports = ServerController;