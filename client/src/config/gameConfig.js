const gameConfig = {
	messageActions: {
		MOVE: 'move',
		ENTER: 'enter',
		LEAVE: 'leave',
		SAY: 'say',
		YELL: 'yell',
		CONSIDER: 'con',
		HAIL: 'hail',
		ATTACK: 'attack',
		DIE: 'die',
		TAKE: 'take',
		DROP: 'drop',
		DECAY: 'decay',
		EQUIP: 'equip',
		SHOP: 'shop',
		BUY: 'buy',
		SELL: 'sell'
	},
	entityTypes: {
		PLAYER: 'player',
		MOB: 'mob'
	},
	itemSlots: {
		WEAPON: 0,
		HEAD: 1,
		CHEST: 2,
		ARMS: 3,
		LEGS: 4
	}
};
export default gameConfig;