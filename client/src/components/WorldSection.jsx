import { useRef, useEffect } from 'react';
import useSwipe from '../hooks/useSwipe';


export default function WorldSection({ isActive, roomDescription, roomDoors, thisPlayer, mobs, players, items, openMobSheet, openPlayerSheet, openItemSheet, movePlayer }) {
	if (!isActive) {
		return null;
	}

	// Move the player on swipe
	const sectionWorldRef = useRef(null);
	const { direction, touchDeltaX, touchDeltaY } = useSwipe({ ref: sectionWorldRef, threshold: 100  });
	useEffect(() => {
		movePlayer(direction);
	}, [direction]);

	// Move the player on click
	const handleMoveClick = (event, direction) => {
		event.preventDefault();
		if (event.target.className !== 'disabled') {
			movePlayer(direction);
		}
	};

	return (
		<section className="world" ref={sectionWorldRef}>
			<article className="room" style={{transform: `translateX(${touchDeltaX}px) translateY(${touchDeltaY}px)`}}>
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
			</article>
			<nav className="exits">
				{['north', 'west', 'east', 'south'].map(direction => (
					<a href="#" className={'exit ' + direction + (roomDoors.hasOwnProperty(direction[0]) ? '' : ' disabled')} key={'direction-' + direction} onClick={event => handleMoveClick(event, direction[0])}>
						<span className="arrow" />
					</a>
				))}
			</nav>
		</section>
	);
};