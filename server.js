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

// Setup static files
//app.use(express.static('public'));

// Setup authentication routing
const serverController = new ServerController();
app.post('/signup', serverController.signup.bind(serverController));
app.post('/login', serverController.login.bind(serverController));
app.post('/logout', serverController.logout.bind(serverController));
app.get('/getSpecies', serverController.getSpecies.bind(serverController));
app.get('/getPlayers', serverController.getPlayers.bind(serverController));
app.post('/createPlayer', serverController.createPlayer.bind(serverController));
app.post('/deletePlayer', serverController.deletePlayer.bind(serverController));
app.post('/selectPlayer', serverController.selectPlayer.bind(serverController));

// Start the HTTP server
const port = process.env.PORT || 3000;
const expressServer = app.listen(port);
console.log(`Cresques/${package.version} is running on port ${port}.`);

// Start the WebSocket server
const wss = new webSocket.Server({
	server: expressServer,
	path: '/ws'
});
wss.on('connection', serverController.openConnection.bind(serverController));

// Load the databases
serverController.loadDatabases();

// Start the main game loop
serverController.startGameLoop();