const config = require('../config/databaseConfig.js');
const mysql = require('mysql2/promise');

class DatabaseController {

	static pool = mysql.createPool({
		host: config.host,
		user: config.user,
		password: config.password,
		database: config.database,
		connectionLimit: 10
	});
}

module.exports = DatabaseController;