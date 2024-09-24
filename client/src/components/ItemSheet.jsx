import Sheet, { SheetAction, SheetActions } from './Sheet';
import strings from '../config/strings';
import { useWebSocket } from '../hooks/SocketProvider';
import gameConfig from '../config/gameConfig';

export default function ItemSheet({ item, open, onClose }) {

	// Get the current WebSocket connection
	const { sendJsonMessage } = useWebSocket();

	// Send the appropriate action to the server
	const handleItemAction = (event, action) => {
		event.preventDefault();
		onClose();
		sendJsonMessage({
			action: action,
			itemId: item.id
		});
	};

	return (
		<Sheet
			open={open}
			onClose={onClose}
		>
			<SheetActions>
				<SheetAction onClick={event => handleItemAction(event, gameConfig.messageActions.TAKE)}>{strings.takeItem}</SheetAction>
			</SheetActions>
		</Sheet>
	);
};