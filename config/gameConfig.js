module.exports = {
	refreshRate: 1000,
	playerRespawnTime: 10000,
	meleeDelay: 2000,
	experienceBase: 1000,
	experiencePowerCurve: 3,
	experiencePerMob: 50,
	threatScale: {
		TRIVIAL: {
			index: 0,
			levelDelta: -10,
			multiplier: 0
		},
		EASY: {
			index: 1,
			levelDelta: -1,
			multiplier: 0.5
		},
		EVEN: {
			index: 2,
			levelDelta: 0,
			multiplier: 1
		},
		DIFFICULT: {
			index: 3,
			levelDelta: 1,
			multiplier: 1.5
		},
		IMPOSSIBLE: {
			index: 4,
			levelDelta: 3,
			multiplier: 2.0
		}
	},
	factionScale: {
		AGGRESSIVE: {
			index: 0,
			factionDelta: -3000
		},
		THREATENINGLY: {
			index: 1,
			factionDelta: -1500
		},
		DUBIOUS: {
			index: 2,
			factionDelta: -750
		},
		APPREHENSIVE: {
			index: 3,
			factionDelta: -250
		},
		INDIFFERENT: {
			index: 4,
			factionDelta: 0
		},
		AMIABLY: {
			index: 5,
			factionDelta: 250
		},
		KINDLY: {
			index: 6,
			factionDelta: 500
		},
		WARMLY: {
			index: 7,
			factionDelta: 750
		},
		ALLY: {
			index: 8,
			factionDelta: 1000
		}
	},
	missRateMaxLevelDelta: 2,
	missRateEvenBase: 0.05,
	missRateEvenMultiplier: 0.005,
	missRateUnevenBase: 0.2,
	missRateUnevenMultiplier: 0.02,
	strengthMultiplier: 5,
	roomDirections: {
		NORTH: 0,
		EAST: 1,
		SOUTH: 2,
		WEST: 3,
		UP: 4,
		DOWN: 5
	},
	itemSlots: {
		WEAPON: 0,
		HEAD: 1,
		CHEST: 2,
		ARMS: 3,
		LEGS: 4
	}
};