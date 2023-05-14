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
	 * @param {Entity} entity - A Player or Mob.
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
	 * @param {Entity} entity - A Player or Mob.
	 * @param {Species} species - The Species of the Entity.
	 * @return {Number} The max health of the Entity.
	 */
	static getMaxHealth(entity, species) {
		return Math.floor(species.health + ((entity.stamina + species.stamina) / 10) * entity.level);
	}

	/**
	 * Use the difference between battling Entities to determine experience bonuses.
	 * @param {Entity} attacker - A Player or Mob.
	 * @param {Entity} target - A Player or Mob.
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
	 * @param {Entity} attacker - A Player or Mob.
	 * @param {Entity} target - A Player or Mob.
	 * @return {Object} The number of experienece points to reward.
	 */
	static getExperienceReward(attacker, target) {
		return Math.floor(((attacker.level * 5) + config.experiencePerMob) * GameUtils.getThreatLevel(attacker, target).multiplier);
	}

	/**
	 * Calculate the chance an attack will land based on the level difference of the attacker and defender.
	 * @param {Entity} attacker - A Player or Mob.
	 * @param {Entity} defender - A Player or Mob.
	 * @return {Boolean} Whether or not the next attack will hit.
	 */
	static willHit(attacker, defender) {
		const evenlyMatched = Math.abs(attacker.level - defender.level) <= config.missRateMaxLevelDelta;
		return Math.random() > (evenlyMatched ? config.missRateEvenBase : config.missRateUnevenBase) + (attacker.level - defender.level) * (evenlyMatched ? config.missRateEvenMultiplier : config.missRateUnevenMultiplier);
	}

	/**
	 * Calculate the damage an Entity produces based on a D20 roll.
	 * @param {Entity} entity - A Player or Mob.
	 * @return {Number} The damage to be dealt.
	 */
	static rollDamage(entity) {
		const weapon = entity.items.find(i => i.id === entity.equipment ? entity.equipment[config.itemSlots.WEAPON] : -1);
		return Math.floor(Math.random() * 20 + 1) + (weapon ? weapon.damage : 0) + Math.floor(entity.level / 2);
	}

	/**
	 * Calculate how much weight a Player can hold.
	 * @param {Player} player - The Player to check.
	 * @return {Number} The total weight a Player can hold before becoming encumbered.
	 */
	static getMaxWeight(player) {
		let armorBonus = 0;
		Object.keys(player.equipment).forEach(itemId => {
			const item = player.items.find(i => i.id === itemId);
			if (item) {
				armorBonus += item.strength;
			}
		});
		return (player.strengthBase + player.strength + armorBonus) * config.strengthMultiplier;
	}

	/**
	 * Calculate the next time the Entity can attack.
	 * @param {Entity} entity - A Player or Mob.
	 * @return {Number} The number of milliseconds until the Entity can attack again.
	 */
	static getNextAttackTime(entity) {
		const weapon = entity.items.find(i => i.id === entity.equipment ? entity.equipment[config.itemSlots.WEAPON] : -1);
		return weapon ? weapon.delay : config.meleeDelay;
	}

	/**
	 * Add sender-specific context to a conversation message.
	 * @param {Entity} entity - A Player or Mob.
	 * @param {String} text - The message content.
	 * @return {String} The formatted message.
	 */
	static formatConversationMessage(entity, text) {
		return text.replace('{name}', entity.name);
	}
}

module.exports = GameUtils;