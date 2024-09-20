import Sheet from './Sheet';
import strings from '../config/strings';
import { useWebSocket } from '../hooks/SocketProvider';
import gameConfig from '../config/gameConfig';

export default function MobSheet({ mob, open, onClose }) {

	// Get the current WebSocket connection
	const socket = useWebSocket();

	// Consider a Mob
	const considerMob = (event) => {
		event.preventDefault();
		onClose();
		socket.sendJsonMessage({
			action: gameConfig.messageActions.CONSIDER,
			mobId: mob.id
		});
	};

	// Attack a Mob
	const attackMob = (event) => {
		event.preventDefault();
		onClose();
		socket.sendJsonMessage({
			action: gameConfig.messageActions.ATTACK,
			mobId: mob.id
		});
	};

	return (
		<Sheet
			open={open}
			onClose={onClose}
		>
			<p><a href="#" className="button contained" onClick={event => considerMob(event)}>{strings.consider}</a></p>
			<p><a href="#" className="button contained" onClick={event => attackMob(event)}>{strings.attack}</a></p>
		</Sheet>
	);
};