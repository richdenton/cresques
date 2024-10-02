import { useWebSocket } from '../hooks/SocketProvider';
import gameConfig from '../config/gameConfig';
import strings from '../config/strings';

export default function DeathSection({ isActive, onClose }) {
	if (!isActive) {
		return null;
	}

	// Get the current WebSocket connection
	const { sendJsonMessage } = useWebSocket();

	// Notify the server that the player would like to respawn
	const handleRespawn = (event) => {
		event.preventDefault();
		sendJsonMessage({
			action: gameConfig.messageActions.RESPAWN
		});
		onClose();
	};

	return (
		<section className="death">
			<h1>{strings.chatDieYou}</h1>
			<p>{strings.respawnDescription}</p>
			<a href="#" className="button contained" onClick={event => handleRespawn(event)}>{strings.respawn}</a>
		</section>
	);
};