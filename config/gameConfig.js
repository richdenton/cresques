module.exports = {
	refreshRate: 1000,
	playerRespawnTime: 10000,
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
	}
};