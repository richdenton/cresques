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
		this.factions = [
			{
				id: 0,
				score: 0
			}
		];
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
	 * Calculate the combat multiplier between this and another Character. 
	 * @param {Character} target - A Player or Mob.
	 * @return {Object} The threat level object. See gameConfig.threatScale.
	 */
	getThreatLevel(target) {
		const levelDelta = target.level - this.level;
		let result = gameConfig.threatScale.TRIVIAL;
		for (const tier in gameConfig.threatScale) {
			if (levelDelta <= gameConfig.threatScale[tier].levelDelta) {
				result = gameConfig.threatScale[tier];
				break;
			}
		}
		return result;
	}

	/**
	 * Calculate the faction score difference between this and another Character. 
	 * @param {Character} target - A Player or Mob.
	 * @return {Object} The faction level object. See gameConfig.factionScale.
	 */
	getFactionLevel(target) {
		let result = gameConfig.factionScale.AGGRESSIVE;
		target.factions.forEach(faction => {
			const factionDelta = faction.score - (this.factions.find(f => f.id === faction.id) || { score: 0 }).score;
			for (const tier in gameConfig.factionScale) {
				if (gameConfig.factionScale[tier].index < result.index) {
					continue;
				}
				if (factionDelta <= gameConfig.factionScale[tier].factionDelta) {
					result = gameConfig.factionScale[tier];
					break;
				}
			}
		});
		return result;
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

	 /**
	 * Update the score of a given Faction.
	 * @param {Number} id - A unique ID of a Faction.
	 * @param {Number} score - The Faction score to increase or decrease.
	 */
	updateFactionRank(id, score) {
		let faction = this.factions.find(f => f.id === id);
		if (faction) {
			faction.score += score;
		} else {
			this.factions.add({
				id: id,
				score: score
			});
		}
	}
}

module.exports = Character;