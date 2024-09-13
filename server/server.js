require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const package = require('./package.json');
const webSocket = require('ws');

const ServerController = require('./controllers/serverController');

// Setup cookie handling
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup authentication routing
const serverController = new ServerController();
app.post('/api/signup', serverController.signup.bind(serverController));
app.post('/api/login', serverController.login.bind(serverController));
app.post('/api/logout', serverController.logout.bind(serverController));
app.get('/api/getRaces', serverController.getRaces.bind(serverController));
app.get('/api/getPlayers', serverController.getPlayers.bind(serverController));
app.post('/api/createPlayer', serverController.createPlayer.bind(serverController));
app.post('/api/deletePlayer', serverController.deletePlayer.bind(serverController));
app.post('/api/selectPlayer', serverController.selectPlayer.bind(serverController));

// Start the HTTP server
const port = process.env.PORT || 3001;
const expressServer = app.listen(port);
console.log(`Cresques Server/${package.version} is running on port ${port}.`);

// Start the WebSocket server
const wss = new webSocket.Server({
	server: expressServer,
	path: '/ws'
});
wss.on('connection', serverController.openConnection.bind(serverController));

// Load the databases
serverController.loadDatabases();

// Start the main game loop
serverController.gameController.startGameLoop();