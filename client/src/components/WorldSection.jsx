export default function WorldSection({ isActive, roomDescription, thisPlayer, mobs, players, items, openMobSheet, openPlayerSheet, openItemSheet }) {
	if (!isActive) {
		return null;
	}
	return (
		<section className="world">
			<div className="description">{roomDescription}</div>
			<div className="mobs">
				{mobs.map(mob => (
					<a href="#" className="button mob" key={'mob-' + mob.id} onClick={event => openMobSheet(event, mob)}>{mob.name}</a>
				))}
			</div>
			<div className="players">
				{players.map(player => {
					if (player.id !== thisPlayer.id) {
						return (
							<a href="#" className="button player" key={'player-' + player.id} onClick={event => openPlayerSheet(event, player)}>{player.name}</a>
						);
					}
				})}
			</div>
			<div className="items">
				{items.map(item => (
					<a href="#" className="button item" key={'item-' + item.id} onClick={event => openItemSheet(event, item)}>{item.name}</a>
				))}
			</div>
		</section>
	);
};