module.exports = {
	refreshRate: 1000,
	playerRespawnTime: 10000,
	meleeAttackTime: 2000,
	experienceBase: 1000,
	experiencePowerCurve: 3,
	experiencePerMob: 50,
	threatScale: {
		TRIVIAL: {
			levelDelta: -10,
			multiplier: 0
		},
		EASY: {
			levelDelta: -1,
			multiplier: 0.5
		},
		EVEN: {
			levelDelta: 0,
			multiplier: 1
		},
		DIFFICULT: {
			levelDelta: 1,
			multiplier: 1.5
		},
		IMPOSSIBLE: {
			levelDelta: 3,
			multiplier: 2.0
		}
	},
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