import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/SocketProvider';
import PageContainer from '../components/PageContainer';
import { Tabs, TabPanel, TabList, Tab } from '../components/Tabs';
import MobSheet from '../components/MobSheet';
import strings from '../config/strings';
import gameConfig from '../config/gameConfig';
import '../assets/game.css';

export default function Game() {

	// Get the selected player
	const location = useLocation();
	const [thisPlayer, setThisPlayer] = useState(location.state.player);
	
	// Watch for game state changes
	const [messages, setMessages] = useState([]);
	const [roomDescription, setRoomDescription] = useState('');
	const [roomDoors, setRoomDoors] = useState([]);
	const [roomItems, setRoomItems] = useState([]);
	const [roomMobs, setRoomMobs] = useState([]);
	const [roomPlayers, setRoomPlayers] = useState([]);
	const roomItemsRef = useRef(null);
	const roomMobsRef = useRef(null);
	const roomPlayersRef = useRef(null);
	let messageIndex = 0;

	// Get the current WebSocket connection
	const socket = useWebSocket();

	// Handle action sheet visibility
	const [mobSheetOpen, setMobSheetOpen] = useState(false);
	const [activeMob, setActiveMob] = useState(null);
	const openMobSheet = (event, mob) => {
		event.preventDefault();
		setActiveMob(mob);
		setMobSheetOpen(true);
	};
	const closeMobSheet = () => {
		setActiveMob(null);
		setMobSheetOpen(false);
	};

	// Move the current player
	const movePlayer = (event, direction) => {
		event.preventDefault();
		if (event.target.className !== 'disabled') {
			if (thisPlayer.attacking) {
				setMessages(messages => [...messages, {
					content: strings.errorCombat,
					type: 'error'
				}]);
			} else if (thisPlayer.encumbered) {
				setMessages(messages => [...messages, {
					content: strings.errorEncumbered,
					type: 'error'
				}]);
			} else {
				socket.sendJsonMessage({
					action: gameConfig.messageActions.MOVE,
					direction: direction
				});
			}
		}
	};

	// Listen for new messages
	useEffect(() => {
		const message = socket.lastJsonMessage;
		if (message) {
			let target = {},
				targets = [],
				i;
			switch (message.action) {
				case gameConfig.messageActions.MOVE:

					// Display Zone information
					if (thisPlayer.lastZoneId !== message.room.zoneId) {
						setMessages(messages => [...messages, {
							content: strings.chatEnterYou.replace('{0}', message.zone.name),
							type: 'zone'
						}]);
						thisPlayer.lastZoneId = message.room.zoneId;
					}

					// Store Room information
					setRoomDescription(message.room.description);
					setRoomDoors(message.room.doors);
					roomItemsRef.current = message.room.items;
					setRoomItems(roomItemsRef.current);
					roomMobsRef.current = message.room.mobs;
					setRoomMobs(roomMobsRef.current);
					roomPlayersRef.current = message.room.players;
					setRoomPlayers(roomPlayersRef.current);
					break;
				case gameConfig.messageActions.ENTER:
					if (message.player) {

						// Update the Players lists
						roomPlayersRef.current.push(message.player);
						setRoomPlayers(roomPlayersRef.current);

						// Write message to the chat panel
						setMessages(messages => [...messages, {
							content: strings.chatEnter.replace('{0}', message.player.name),
							type: 'enter'
						}]);

					} else if (message.mob) {

						// Update the Mobs lists
						roomMobsRef.current.push(message.mob);
						setRoomMobs(roomMobsRef.current);
						
						// Write message to the chat panel
						setMessages(messages => [...messages, {
							content: strings.chatEnter.replace('{0}', message.mob.name),
							type: 'enter'
						}]);
					}
					break;
				case gameConfig.messageActions.LEAVE:
					if (message.playerId) {

						// Find the Player who left
						target = roomPlayersRef.find(p => p.id === message.playerId);

						// Uopdate the Players lists
						if (target.id) {
							roomPlayersRef.current = roomPlayersRef.current.filter(p => p.id !== target.id);
							setRoomPlayers(roomPlayersRef.current);
						}

						// Write message to the chat panel
						if (target.name) {
							setMessages(messages => [...messages, {
								content: strings.chatLeave.replace('{0}', target.name),
								type: 'leave'
							}]);
						}
					} else if (message.mobId) {

						// Find the Mob that left
						target = roomMobsRef.current.find(m => m.id === message.mobId);

						// Update the Mobs lists
						if (target.id) {
							roomMobsRef.current = roomMobsRef.current.filter(m => m.id !== target.id);
							setRoomMobs(roomMobsRef.current);
						}

						// Write message to the chat panel
						if (target.name) {
							setMessages(messages => [...messages, {
								content: strings.chatLeave.replace('{0}', target.name),
								type: 'leave'
							}]);
						}
					}
					break;
				case gameConfig.messageActions.SAY:

					// Check if the current Player is speaking
					if (message.sender.type === gameConfig.entityTypes.PLAYER && message.senderId === thisPlayer.id) {
						
						// Write message to the chat panel
						setMessages(messages => [...messages, {
							content: strings.chatSayYou.replace('{0}', message.text),
							type: 'say'
						}]);
					} else {

						// Otherwise, find the speaker
						targets = message.sender.type === gameConfig.entityTypes.PLAYER ? roomPlayersRef.current : roomMobsRef.current;
						for (i = 0; i < targets.length; i++) {
							if (targets[i].id === message.sender.id) {
								target = targets[i];
								break;
							}
						}

						// Write message to the chat panel
						if (target.name) {
							setMessages(messages => [...messages, {
								content: strings.chatSayOther.replace('{0}', target.name).replace('{1}', message.text),
								type: 'say'
							}]);
						}
					}
					break;
				case gameConfig.messageActions.YELL:

					// Check if the current Player is yelling
					if (message.sender.type === gameConfig.entityTypes.PLAYER && message.senderId === thisPlayer.id) {
						
						// Write message to the chat panel
						setMessages(messages => [...messages, {
							content: strings.chatYellYou.replace('{0}', message.text),
							type: 'yell'
						}]);
					} else {

						// Otherwise, find the yeller
						targets = message.sender.type === gameConfig.entityTypes.PLAYER ? roomPlayersRef.current : roomMobsRef.current;
						for (i = 0; i < targets.length; i++) {
							if (targets[i].id === message.sender.id) {
								target = targets[i];
								break;
							}
						}

						// Write message to the chat panel
						if (target.name) {
							setMessages(messages => [...messages, {
								content: strings.chatYellOther.replace('{0}', target.name).replace('{1}', message.text),
								type: 'yell'
							}]);
						}
					}
					break;
				case gameConfig.messageActions.CONSIDER:

					// Find the Mob being considered
					target = roomMobsRef.current.find(m => m.id === message.mobId);

					// Write message to the chat panel
					if (target.name) {
						setMessages(messages => [...messages, {
							content: strings.chatConsider.replace('{0}', target.name).replace('{1}', strings.chatConsiderFactions[message.faction]).replace('{2}', strings.chatConsiderThreats[message.threat]),
							type: 'consider threat_' + message.threat
						}]);
					}
					break;
				case gameConfig.messageActions.ATTACK:

					// Find the attacker
					targets = message.attacker.type === gameConfig.entityTypes.PLAYER ? roomPlayersRef.current : roomMobsRef.current;
					let attacker = targets.find(a => a.id === message.attacker.id);

					// Find the defender
					targets = message.defender.type === gameConfig.entityTypes.PLAYER ? roomPlayersRef.current : roomMobsRef.current;
					let defender = targets.find(d => d.id === message.defender.id);

					// Write message to the chat panel
					if (attacker.name && defender.name) {
						setMessages(messages => [...messages, {
							content: message.attacker.type === gameConfig.entityTypes.PLAYER && attacker.id === thisPlayer.id
								? strings.chatAttack.replace('{0}', defender.name).replace('{1}', message.defender.damage)
								: strings.chatDefend.replace('{0}', attacker.name).replace('{1}', message.defender.damage),
							type: 'attack'
						}]);
					}
					break;
				case gameConfig.messageActions.DIE:

					// Find the attacker
					let corpse = {},
						thisPlayerAttacked = false,
						thisPlayerDied = false;
					targets = message.attacker.type === gameConfig.entityTypes.PLAYER ? roomPlayers : roomMobs;
					for (i = 0; i < targets.length; i++) {
						if (targets[i].id === message.attacker.id) {
							attacker = targets[i];
							if (attacker.id === thisPlayer.id) {
								thisPlayerAttacked = true;
							}
							break;
						}
					}

					// Find the corpse
					targets = message.corpse.type === gameConfig.entityTypes.PLAYER ? roomPlayers : roomMobs;
					for (i = 0; i < targets.length; i++) {
						if (targets[i].id === message.corpse.id) {
							corpse = targets[i];
							if (corpse.id === thisPlayer.id) {
								thisPlayerDied = true;
							}
							break;
						}
					}

					// Write message to the chat panel
					if (corpse.name) {
						if (attacker.name) {
							setMessages(messages => [...messages, {
								content: thisPlayerAttacked
									? strings.chatKillYou.replace('{0}', corpse.name)
									: strings.chatKillOther.replace('{0}', attacker.name).replace('{1}', corpse.name),
								type: 'die'
							}]);
							if (thisPlayerAttacked) {
								thisPlayer.attacking = false;
							}
						} else {
							setMessages(messages => [...messages, {
								content: thisPlayerDied
									? strings.chatDieYou
									: strings.chatDieOther.replace('{0}', corpse.name),
								type: 'die'
							}]);
							if (thisPlayerDied) {
								thisPlayer.attacking = false;
							}
						}
					}

					// Update the Mobs lists
					if (message.corpse.type === gameConfig.entityTypes.MOB) {
						roomMobsRef.current = roomMobsRef.current.filter(m => m.id !== corpse.id);
						setRoomMobs(roomMobsRef.current);
					}
					break;
				case gameConfig.messageActions.TAKE:

					// Update the Items lists
					roomItemsRef.current = roomItemsRef.current.filter(i => i.id !== message.item.id);
					setRoomItems(roomItemsRef.current);

					// Write message to the chat panel
					if (message.playerId === thisPlayer.id) {
						setMessages(messages => [...messages, {
							content: strings.chatTake.replace('{0}', message.item.name),
							type: 'take'
						}]);
						thisPlayer.items.push(message.item);
					}
					break;
				case gameConfig.messageActions.DROP:

					// Update the Items lists
					roomItemsRef.push(message.item);
					setRoomItems(roomItemsRef);

					// Find the Player/Mob that dropped the Item
					const targetId = message.playerId || message.mobId;
					targets = message.playerId ? roomPlayersRef : roomMobsRef;
					target = targets.find(t => t.id === targetId);

					// Write message to the chat panel
					const thisPlayerDropped = targets === roomPlayersRef && target.id === thisPlayer.id;
					setMessages(messages => [...messages, {
						content: thisPlayerDropped
							? strings.chatDropYou.replace('{0}', message.item.name)
							: strings.chatDropYou.replace('{0}', entity.name).replace('{1}', message.item.name),
						type: 'item'
					}]);
					break;
			}
		}
	}, [socket.lastJsonMessage]);

	return (
		<PageContainer id="game">
			<header>
				<span className="stat health">
					<span className="label">Health</span>
					<span className="meter">
						<span className="fill" style={{width: thisPlayer.health / thisPlayer.healthBase * 100}}/>
					</span>
				</span>
				<span className="stat level">
					<span className="label">Level</span>
					<span className="value">{thisPlayer.level}</span>
				</span>
				<span className="stat money">
					<span className="label">Money</span>
					<span className="value">{thisPlayer.money}</span>
				</span>
			</header>
			<Tabs defaultSelectedTab="explore">
				<TabPanel tab="explore">
					<div className="world">
						<div className="description">{roomDescription}</div>
						<div className="mobs">
							{roomMobs.map(mob => (
								<a href="#" className="mob" key={'mob-' + mob.id} onClick={event => openMobSheet(event, mob)}>{mob.name}</a>
							))}
						</div>
						<div className="items">
							{roomItems.map(item => (
								<a href="#" className="item" key={'item-' + item.id}>{item.name}</a>
							))}
						</div>
					</div>
					<nav>
						<div className="exits">
							<div className="cell">
								<a href="#" className={roomDoors.hasOwnProperty('w') ? '' : 'disabled'} onClick={event => movePlayer(event, 'w')}>
									<i className="arrow west" />
								</a>
							</div>
							<div className="cell">
								<a href="#" className={roomDoors.hasOwnProperty('n') ? '' : 'disabled'} onClick={event => movePlayer(event, 'n')}>
									<i className="arrow north" />
								</a>
								<a href="#" className={roomDoors.hasOwnProperty('s') ? '' : 'disabled'} onClick={event => movePlayer(event, 's')}>
									<i className="arrow south" />
								</a>
							</div>
							<div className="cell">
								<a href="#" className={roomDoors.hasOwnProperty('e') ? '' : 'disabled'} onClick={event => movePlayer(event, 'e')}>
									<i className="arrow east" />
								</a>
							</div>
						</div>
						<div className="chat">
							{messages.map(message => (
								<div className={'message ' + message.type} key={'message-' + messageIndex++}>{message.content}</div>
							))}
						</div>
					</nav>
				</TabPanel>
				<TabPanel tab="player">
					<div className="title">{thisPlayer.name}</div>
					<div className="stats"></div>
					<div className="items"></div>
				</TabPanel>
				<TabPanel tab="settings">
					<Link to={`/select`} className="button contained">{strings.selectPlayer}</Link>
				</TabPanel>
				<TabList>
					<Tab tab="explore">{strings.explore}</Tab>
					<Tab tab="player">{strings.player}</Tab>
					<Tab tab="settings">{strings.settings}</Tab>
				</TabList>
			</Tabs>
			<MobSheet
				mob={activeMob}
				open={mobSheetOpen}
				onClose={closeMobSheet}
			/>
		</PageContainer>
	);
};