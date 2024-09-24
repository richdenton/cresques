import Sheet, { SheetAction, SheetActions } from './Sheet';
import strings from '../config/strings';
import { useWebSocket } from '../hooks/SocketProvider';
import gameConfig from '../config/gameConfig';

export default function MobSheet({ mob, open, onClose }) {

	// Get the current WebSocket connection
	const { sendJsonMessage } = useWebSocket();

	// Send the appropriate action to the server
	const handleMobAction = (event, action, chatMessage) => {
		event.preventDefault();
		onClose();
		sendJsonMessage({
			action: action,
			mobId: mob.id
		});
	};

	return (
		<Sheet
			open={open}
			onClose={onClose}
		>
			<SheetActions>
				<SheetAction onClick={event => handleMobAction(event, gameConfig.messageActions.CONSIDER)}>{strings.consider}</SheetAction>
				<SheetAction onClick={event => handleMobAction(event, gameConfig.messageActions.HAIL)}>{strings.hail}</SheetAction>
				<SheetAction onClick={event => handleMobAction(event, gameConfig.messageActions.ATTACK)}>{strings.attack}</SheetAction>
			</SheetActions>
		</Sheet>
	);
};