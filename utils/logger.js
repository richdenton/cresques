const config = require('../config/logConfig');

class Logger {

	static logTypes = {
		NONE: 0,
		ERROR: 1,
		WARN: 2,
		INFO: 3,
		DEBUG: 4
	}

	static log(message, type) {
		if (type <= config.level) {
			console.log('[' + Object.keys(Logger.logTypes).find(key => Logger.logTypes[key] === type) + '] ' + new Date().toLocaleString().replace(',','') + ' - ' + message);
		}
	}
}

module.exports = Logger;