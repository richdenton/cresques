const config = require('../config/gameConfig');

class GameUtils {

	/**
	 * Get the current server time in milliseconds.
	 * @return {Number} The current time.
	 */
	static getCurrentTimeMs() {
		let time = process.hrtime();
		return time[0] * 1000 + time[1] / 1000000;
	}

	/**
	 * Calculate the curernt level of an Entity.
	 * @param {Entity} entity - An Player or Enemy.
	 * @return {Number} The level of the Entity.
	 */
	static getLevel(entity) {
		let level = 0;
		while (entity.experience > (config.experienceBase * Math.pow(level + 1, config.experiencePowerCurve))) {
			level++;
		}
		return level;
	}

	/**
	 * Calculate damage on an Entity based on a D20 roll.
	 * @param {Entity} entity - An Player or Enemy.
	 * @return {Number} The damage to be dealt.
	 */
	static calculateDamage(entity) {
		return Math.floor(Math.random() * 20 + 1) + Math.floor(GameUtils.getLevel(entity) / 2)
	}
}

module.exports = GameUtils;