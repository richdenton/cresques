import { createContext, useRef, useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { flushSync } from 'react-dom';
import clientConfig from '../config/clientConfig';

const SocketContext = createContext();

export default function SocketProvider({ children }) {
	const webSocketRef = useRef(null);

	// Store the last message
	const [lastMessage, setLastMessage] = useState(null);
	const lastJsonMessage = useMemo(() => {
		if (lastMessage) {
			try {
				return JSON.parse(lastMessage.data);
			} catch(error) {
				return {};
			}
		}
		return null; 
	}, [lastMessage]);

	// Send a message as plain text
	const sendMessage = useCallback((message) => {
		if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
			webSocketRef.current.send(message);
		}
	}, []);

	// Send a message as JSON
	const sendJsonMessage = useCallback((message) => {
		sendMessage(JSON.stringify(message));
	}, [sendMessage]);

	// Get a reference to the WebSocket
	const getWebSocket = useCallback(() => {
		return webSocketRef.current;
	});

	// Open the WebSocket connection
	useEffect(() => {
		if (!webSocketRef.current || webSocketRef.current.readyState === WebSocket.CLOSED) {
			webSocketRef.current = new WebSocket(clientConfig.webSocketServer);
			webSocketRef.current.onmessage = (message) => {
				flushSync(() => setLastMessage(message));
			};
			return () => {
				setLastMessage(null);
				webSocketRef.current.close();
				webSocketRef.current = null;
			};
		}
	}, [sendMessage]);

	return (
		<SocketContext.Provider value={{ sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, getWebSocket }}>
			{children}
		</SocketContext.Provider>
	);
};

export const useWebSocket = () => {
	return useContext(SocketContext);
};