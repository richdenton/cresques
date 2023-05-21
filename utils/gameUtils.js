class GameUtils {

	/**
	 * Get the current server time in milliseconds.
	 * @return {Number} The current time.
	 */
	static getCurrentTimeMs() {
		let time = process.hrtime();
		return time[0] * 1000 + time[1] / 1000000;
	}
}

module.exports = GameUtils;