import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/SocketProvider';
import PageContainer from '../components/PageContainer';
import { Tabs, TabPanel, TabList, Tab } from '../components/Tabs';
import MobSheet from '../components/MobSheet';
import ItemSheet from '../components/ItemSheet';
import strings from '../config/strings';
import gameConfig from '../config/gameConfig';
import '../assets/game.css';

export default function Game() {

	// Get the selected player
	const location = useLocation();
	const [thisPlayer, setThisPlayer] = useState(location.state.player);
	const [thisPlayerAttacking, setThisPlayerAttacking] = useState(false);
	
	// Watch for game state changes
	const [chatMessages, setChatMessages] = useState([]);
	const [roomDescription, setRoomDescription] = useState('');
	const [roomDoors, setRoomDoors] = useState([]);
	const [roomItems, setRoomItems] = useState([]);
	const [roomMobs, setRoomMobs] = useState([]);
	const [roomPlayers, setRoomPlayers] = useState([]);
	const roomItemsRef = useRef([]);
	const roomMobsRef = useRef([]);
	const roomPlayersRef = useRef([]);
	let messageIndex = 0;

	// Get the current WebSocket connection
	const { sendJsonMessage, lastJsonMessage } = useWebSocket();

	// Handle Item action sheet visibility
	const [itemSheetOpen, setItemSheetOpen] = useState(false);
	const [activeItem, setActiveItem] = useState(null);
	const openItemSheet = (event, item) => {
		event.preventDefault();
		setActiveItem(item);
		setItemSheetOpen(true);
	};
	const closeItemSheet = () => {
		setActiveItem(null);
		setItemSheetOpen(false);
	};

	// Handle Mob action sheet visibility
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

	// Add a new chat message to the array
	const appendChatMessage = (content, type) => {
		setChatMessages(chatMessages => [...chatMessages, {
			content: content,
			type: type
		}]);
	};

	// Move the current player
	const movePlayer = (event, direction) => {
		event.preventDefault();
		if (event.target.className !== 'disabled') {
			if (thisPlayerAttacking) {
				appendChatMessage(strings.errorCombat, 'combat');
			} else if (thisPlayer.encumbered) {
				appendChatMessage(strings.errorEncumbered, 'encumbered');
			} else {
				sendJsonMessage({
					action: gameConfig.messageActions.MOVE,
					direction: direction
				});
			}
		}
	};

	// Listen for new messages
	useEffect(() => {
		const message = lastJsonMessage;
		if (message) {
			let attacker = {},
				defender = {},
				target = {},
				targets = [],
				i;
			switch (message.action) {
				case gameConfig.messageActions.MOVE:

					// Display Zone information
					if (thisPlayer.lastZoneId !== message.room.zoneId) {
						appendChatMessage(strings.chatEnterYou.replace('{0}', message.zone.name), 'zone');
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
						appendChatMessage(strings.chatEnter.replace('{0}', message.player.name), 'enter');

					} else if (message.mob) {

						// Update the Mobs lists
						roomMobsRef.current.push(message.mob);
						setRoomMobs(roomMobsRef.current);

						// Write message to the chat panel
						appendChatMessage(strings.chatEnter.replace('{0}', message.mob.name), 'enter');
					}
					break;
				case gameConfig.messageActions.LEAVE:
					if (message.playerId) {

						// Find the Player who left
						target = roomPlayersRef.current.find(p => p.id === message.playerId);

						// Update the Players lists
						if (target.id) {
							roomPlayersRef.current = roomPlayersRef.current.filter(p => p.id !== target.id);
							setRoomPlayers(roomPlayersRef.current);
						}

						// Write message to the chat panel
						if (target.name) {
							appendChatMessage(strings.chatLeave.replace('{0}', target.name), 'leave');
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
							appendChatMessage(strings.chatLeave.replace('{0}', target.name), 'leave');
						}
					}
					break;
				case gameConfig.messageActions.SAY:

					// Check if the current Player is speaking
					if (message.sender.type === gameConfig.entityTypes.PLAYER && message.senderId === thisPlayer.id) {

						// Write message to the chat panel
						appendChatMessage(strings.chatSayYou.replace('{0}', message.text), 'say you');
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
							appendChatMessage(strings.chatSayOther.replace('{0}', target.name).replace('{1}', message.text), 'say other');
						}
					}
					break;
				case gameConfig.messageActions.YELL:

					// Check if the current Player is yelling
					if (message.sender.type === gameConfig.entityTypes.PLAYER && message.senderId === thisPlayer.id) {
						
						// Write message to the chat panel
						appendChatMessage(strings.chatYellYou.replace('{0}', message.text), 'yell you');
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
							appendChatMessage(strings.chatYellOther.replace('{0}', target.name).replace('{1}', message.text), 'yell other');
						}
					}
					break;
				case gameConfig.messageActions.CONSIDER:

					// Find the Mob being considered
					target = roomMobsRef.current.find(m => m.id === message.mobId);

					// Write message to the chat panel
					if (target.name) {
						appendChatMessage(strings.chatConsider.replace('{0}', target.name).replace('{1}', strings.chatConsiderFactions[message.faction]).replace('{2}', strings.chatConsiderThreats[message.threat]), 'consider threat_' + message.threat);
					}
					break;
				case gameConfig.messageActions.HAIL:

					// Find the Mob being hailed
					target = roomMobsRef.current.find(m => m.id === message.mobId);

					// Check if the current Player is speaking
					if (message.playerId === thisPlayer.id) {
						
						// Write message to the chat panel
						appendChatMessage(strings.chatHailYou.replace('{0}', target.name), 'hail');
					} else {

						// Otherwise, find the speaker
						let player = null;
						targets = roomPlayersRef.current;
						for (i = 0; i < targets.length; i++) {
							if (targets[i].id === message.playerId) {
								player = targets[i];
								break;
							}
						}

						// Write message to the chat panel
						if (player.name) {
							appendChatMessage(strings.chatHailYou.replace('{0}', player.name).replace('{1}', target.text), 'hail');
						}
					}
					break;
				case gameConfig.messageActions.ATTACK:

					// Find the attacker
					targets = message.attacker.type === gameConfig.entityTypes.PLAYER ? roomPlayersRef.current : roomMobsRef.current;
					attacker = targets.find(a => a.id === message.attacker.id);

					// Find the defender
					targets = message.defender.type === gameConfig.entityTypes.PLAYER ? roomPlayersRef.current : roomMobsRef.current;
					defender = targets.find(d => d.id === message.defender.id);

					// Write message to the chat panel
					if (attacker.name && defender.name) {
						const isThisPlayerAttacking = message.attacker.type === gameConfig.entityTypes.PLAYER && attacker.id === thisPlayer.id;
						setThisPlayerAttacking(isThisPlayerAttacking);
						appendChatMessage(isThisPlayerAttacking
							? strings.chatAttack.replace('{0}', defender.name).replace('{1}', message.defender.damage)
							: strings.chatDefend.replace('{0}', attacker.name).replace('{1}', message.defender.damage),
						'attack ' + (isThisPlayerAttacking ? 'you' : 'other'));
					}
					break;
				case gameConfig.messageActions.DIE:

					// Find the attacker
					let corpse = {},
						thisPlayerAttacked = false,
						thisPlayerDied = false;
					targets = message.attacker.type === gameConfig.entityTypes.PLAYER ? roomPlayersRef.current : roomMobsRef.current;
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
					targets = message.corpse.type === gameConfig.entityTypes.PLAYER ? roomPlayersRef.current : roomMobsRef.current;
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
							appendChatMessage(thisPlayerAttacked ? strings.chatKillYou.replace('{0}', corpse.name) : strings.chatKillOther.replace('{0}', attacker.name).replace('{1}', corpse.name), 'die');
							if (thisPlayerAttacked) {
								setThisPlayerAttacking(false);
							}
						} else {
							appendChatMessage(thisPlayerDied ? strings.chatDieYou : strings.chatDieOther.replace('{0}', corpse.name), 'die');
							if (thisPlayerDied) {
								setThisPlayerAttacking(false);
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
						appendChatMessage(strings.chatTake.replace('{0}', message.item.name), 'take');
						thisPlayer.items.push(message.item);
					}
					break;
				case gameConfig.messageActions.DROP:

					// Update the Items lists
					roomItemsRef.current.push(message.item);
					setRoomItems(roomItemsRef.current);

					// Find the Player/Mob that dropped the Item
					const targetId = message.playerId || message.mobId;
					targets = message.playerId ? roomPlayersRef.current : roomMobsRef.current;
					target = targets.find(t => t.id === targetId);

					// Write message to the chat panel
					const thisPlayerDropped = targets === roomPlayersRef.current && target.id === thisPlayer.id;
					appendChatMessage(thisPlayerDropped ? strings.chatDropYou.replace('{0}', message.item.name) : strings.chatDropOther.replace('{0}', target.name).replace('{1}', message.item.name), 'item');
					break;
			}
		}
	}, [lastJsonMessage]);

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
								<a href="#" className="item" key={'item-' + item.id} onClick={event => openItemSheet(event, item)}>{item.name}</a>
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
							{chatMessages.map(message => (
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
			<ItemSheet
				item={activeItem}
				open={itemSheetOpen}
				onClose={closeItemSheet}
			/>
			<MobSheet
				mob={activeMob}
				open={mobSheetOpen}
				onClose={closeMobSheet}
			/>
		</PageContainer>
	);
};