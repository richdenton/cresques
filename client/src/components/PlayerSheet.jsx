import Sheet, { SheetAction, SheetActions } from './Sheet';
import strings from '../config/strings';
import { useWebSocket } from '../hooks/SocketProvider';
import gameConfig from '../config/gameConfig';

export default function PlayerSheet({ player, isOpen, onClose }) {

	// Get the current WebSocket connection
	const { sendJsonMessage } = useWebSocket();

	// Send the appropriate action to the server
	const handleItemAction = (event, action) => {
		event.preventDefault();
		onClose();
		sendJsonMessage({
			action: action,
			playerId: player.id
		});
	};

	return (
		<Sheet
			isOpen={isOpen}
			onClose={onClose}
		>
			<SheetActions>
				<SheetAction onClick={event => handleItemAction(event, gameConfig.messageActions.HAIL)}>{strings.hail}</SheetAction>
			</SheetActions>
		</Sheet>
	);
};