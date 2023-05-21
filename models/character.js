const gameConfig = require('../config/gameConfig');
const Entity = require('./entity');

class Character extends Entity {

	/**
	 * Represents an in-game Player or Mob.
	 * @constructor
	 */
	constructor() {
		super();
        this.roomId = 0;
        this.items = [];
		this.equipment = {};
	}

    /**
	 * Calculate the current experience level of a Character.
	 * @return {Number} The level of the Character.
	 */
	getExperienceLevel() {
		let level = 0;
		while (this.experience > (gameConfig.experienceBase * Math.pow(level + 1, gameConfig.experiencePowerCurve))) {
			level++;
		}
		return level;
	}

	/**
	 * Calculate the max hit points of a Character.
	 * @return {Number} The max health of the Character.
	 */
	getMaxHealth() {
		return Math.floor(this.healthBase + ((this.stamina + this.staminaBase) / 10) * this.level);
	}

	/**
	 * Use the difference between battling Characters to determine experience bonuses.
	 * @param {Character} target - A Player or Mob.
	 * @return {Object} The threat level object. See gameConfig.threatScale.
	 */
	getThreatLevel(target) {
		let lastThreatLevel = 0,
			levelDelta = target.level - this.level;
		for (const currentThreatLevel in gameConfig.threatScale) {
			if (lastThreatLevel) {
				if (levelDelta <= gameConfig.threatScale[currentThreatLevel].levelDelta) {
					return gameConfig.threatScale[currentThreatLevel];
				}
				if (levelDelta <= gameConfig.threatScale[lastThreatLevel].levelDelta) {
					return gameConfig.threatScale[lastThreatLevel];
				}
			}
			lastThreatLevel = currentThreatLevel;
		}
		return gameConfig.threatScale[lastThreatLevel];
	}

	/**
	 * Calculate how much experience a Character should earn after defeating their target.
	 * @param {Character} target - A Player or Mob.
	 * @return {Object} The number of experienece points to reward.
	 */
	getExperienceReward(target) {
		return Math.floor(((this.level * 5) + gameConfig.experiencePerMob) * this.getThreatLevel(target).multiplier);
	}

	/**
	 * Calculate the chance an attack will land based on the level difference of the attacker and defender.
	 * @param {Character} target - A Player or Mob.
	 * @return {Boolean} Whether or not the next attack will hit.
	 */
	willHit(target) {
		const evenlyMatched = Math.abs(this.level - target.level) <= gameConfig.missRateMaxLevelDelta;
		return Math.random() > (evenlyMatched ? gameConfig.missRateEvenBase : gameConfig.missRateUnevenBase) + (this.level - target.level) * (evenlyMatched ? gameConfig.missRateEvenMultiplier : gameConfig.missRateUnevenMultiplier);
	}

	/**
	 * Calculate the damage a Character produces based on a D20 roll.
	 * @return {Number} The damage to be dealt.
	 */
	rollDamage() {
		const weapon = this.items.find(i => i.id === this.equipment[gameConfig.itemSlots.WEAPON]);
		return Math.floor(Math.random() * 20 + 1) + (weapon ? weapon.damage : 0) + Math.floor(this.level / 2);
	}

    /**
	 * Calculate how much weight a Character can hold.
	 * @return {Number} The total weight a Character can hold before becoming encumbered.
	 */
	getMaxWeight() {
		let armorBonus = 0;
		Object.keys(this.equipment).forEach(itemId => {
			const item = this.items.find(i => i.id === itemId);
			if (item) {
				armorBonus += item.strength;
			}
		});
		return (this.strengthBase + this.strength + armorBonus) * gameConfig.strengthMultiplier;
	}

    /**
	 * Calculate the next time the Character can attack.
	 * @return {Number} The number of milliseconds until the Character can attack again.
	 */
	getNextAttackTime() {
		const weapon = this.items.find(i => i.id === this.equipment[gameConfig.itemSlots.WEAPON]);
		return weapon ? weapon.delay : gameConfig.meleeDelay;
	}
}

module.exports = Character;