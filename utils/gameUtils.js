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
	 * Calculate the current experience level of an Entity.
	 * @param {Entity} entity - A Player or Enemy.
	 * @return {Number} The level of the Entity.
	 */
	static getExperienceLevel(entity) {
		let level = 0;
		while (entity.experience > (config.experienceBase * Math.pow(level + 1, config.experiencePowerCurve))) {
			level++;
		}
		return level;
	}

	/**
	 * Calculate the max hit points of an Entity.
	 * @param {Entity} entity - A Player or Enemy.
	 * @param {Species} species - The Species of the Entity.
	 * @return {Number} The max health of the Entity.
	 */
	static getMaxHealth(entity, species) {
		return Math.floor(species.health + ((entity.stamina + species.stamina) / 10) * entity.level);
	}

	/**
	 * Use the difference between battling Entities to determing experience bonuses.
	 * @param {Entity} attacker - A Player or Enemy.
	 * @param {Entity} target - A Player or Enemy.
	 * @return {Object} The threat level object. See gameConfig.threatScale.
	 */
	static getThreatLevel(attacker, target) {
		let lastThreatLevel = 0,
			levelDelta = target.level - attacker.level;
		for (const currentThreatLevel in config.threatScale) {
			if (lastThreatLevel) {
				if (levelDelta <= config.threatScale[currentThreatLevel].levelDelta) {
					return config.threatScale[currentThreatLevel];
				}
				if (levelDelta <= config.threatScale[lastThreatLevel].levelDelta) {
					return config.threatScale[lastThreatLevel];
				}
			}
			lastThreatLevel = currentThreatLevel;
		}
		return config.threatScale[lastThreatLevel];
	}

	/**
	 * Calculate how much experience an Entity should earn after defeating their target.
	 * @param {Entity} attacker - A Player or Enemy.
	 * @param {Entity} target - A Player or Enemy.
	 * @return {Object} The number of experienece points to reward.
	 */
	static getExperienceReward(attacker, target) {
		return Math.floor(((attacker.level * 5) + config.experiencePerMob) * GameUtils.getThreatLevel(attacker, target).multiplier);
	}

	/**
	 * Calculate the damage an Entity produces based on a D20 roll.
	 * @param {Entity} entity - A Player or Enemy.
	 * @return {Number} The damage to be dealt.
	 */
	static rollDamage(entity) {
		return Math.floor(Math.random() * 20 + 1) + Math.floor(GameUtils.getExperienceLevel(entity) / 2);
	}

	/**
	 * Calculate how much weight a Player can hold.
	 * @param {Player} player - The Player to check.
	 * @return {Number} The total weight a Player can hold before becoming encumbered.
	 */
	static getMaxWeight(player) {
		return player.strength * config.staminaMultiplier;
	}
}

module.exports = GameUtils;