import { useState, useEffect, useRef } from 'react';
import { Link, useFetcher, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/SocketProvider';
import PageContainer from '../components/PageContainer';
import WorldSection from '../components/WorldSection';
import CombatSection from '../components/CombatSection';
import DeathSection from '../components/DeathSection';
import { Tabs, TabPanel, TabList, Tab } from '../components/Tabs';
import ItemSheet from '../components/ItemSheet';
import MobSheet from '../components/MobSheet';
import PlayerSheet from '../components/PlayerSheet';
import strings from '../config/strings';
import gameConfig from '../config/gameConfig';
import '../assets/game.css';

export default function Game() {

	// Initialize the current player
	const location = useLocation();
	const [thisPlayer, setThisPlayer] = useState(location.state.player);
	const [thisPlayerInCombat, setThisPlayerInCombat] = useState(false);
	const [thisPlayerHealth, setThisPlayerHealth] = useState(thisPlayer.health);
	const [thisPlayerHealthMax, setThisPlayerHealthMax] = useState(thisPlayer.healthMax);
	const [thisPlayerLevel, setThisPlayerLevel] = useState(thisPlayer.level);
	const [thisPlayerMoney, setThisPlayerMoney] = useState(thisPlayer.money);
	const [thisPlayerEncumbered, setThisPlayerEncumbered] = useState(thisPlayer.encumbered);
	const [thisPlayerLastZoneId, setThisPlayerLastZoneId] = useState(thisPlayer.lastZoneId);
	
	// Watch for game state changes
	const [chatMessages, setChatMessages] = useState([]);
	const [roomDescription, setRoomDescription] = useState('');
	const [roomImage, setRoomImage] = useState(null);
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

	// Handle main section visibility
	const [activeSection, setActiveSection] = useState(thisPlayer.health < 1 ? 'death' : 'world');

	// Handle Item action sheet visibility
	const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
	const [activeItem, setActiveItem] = useState(null);
	const openItemSheet = (event, item) => {
		event.preventDefault();
		setActiveItem(item);
		setIsItemSheetOpen(true);
	};
	const closeItemSheet = () => {
		setIsItemSheetOpen(false);
	};

	// Handle Player action sheet visibility
	const [isPlayerSheetOpen, setIsPlayerSheetOpen] = useState(false);
	const [activePlayer, setActivePlayer] = useState(null);
	const openPlayerSheet = (event, player) => {
		event.preventDefault();
		setActivePlayer(player);
		setIsPlayerSheetOpen(true);
	};
	const closePlayerSheet = () => {
		setIsPlayerSheetOpen(false);
	};

	// Handle Mob action sheet visibility
	const [isMobSheetOpen, setIsMobSheetOpen] = useState(false);
	const [activeMob, setActiveMob] = useState(null);
	const [activeMobHealth, setActiveMobHealth] = useState(0);
	const [activeMobHealthMax, setActiveMobHealthMax] = useState(0);
	const openMobSheet = (event, mob) => {
		event.preventDefault();
		setActiveMob(mob);
		setIsMobSheetOpen(true);
	};
	const closeMobSheet = () => {
		setIsMobSheetOpen(false);
	};

	// Add a new chat message to the array
	const appendChatMessage = (content, type) => {
		setChatMessages(chatMessages => [...chatMessages, {
			content: content,
			type: type
		}]);
	};

	// Move the current player
	const movePlayer = (direction) => {
		if (thisPlayerInCombat) {
			appendChatMessage(strings.chatErrorCombat, 'error combat');
		} else if (thisPlayerEncumbered) {
			appendChatMessage(strings.chatErrorEncumbered, 'error encumbered');
		} else {
			sendJsonMessage({
				action: gameConfig.messageActions.MOVE,
				direction: direction
			});
		}
	};

	// Respawn the current player
	const respawnPlayer = () => {
		setThisPlayerHealth(thisPlayerHealthMax);
		setActiveSection('world');
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

					// Display when the player enters a new Zone
					if (thisPlayerLastZoneId !== message.room.zoneId || activeSection !== 'world') {
						appendChatMessage(strings.chatEnterYou.replace('{0}', message.zone.name), 'zone');
						setThisPlayerLastZoneId(message.room.zoneId);
					}

					// Store Room information
					setRoomDescription(message.room.description);
					setRoomImage(message.room.image);
					setRoomDoors(message.room.doors);
					roomItemsRef.current = message.room.items;
					setRoomItems(roomItemsRef.current);
					roomMobsRef.current = message.room.mobs;
					setRoomMobs(roomMobsRef.current);
					roomPlayersRef.current = message.room.players;
					setRoomPlayers(roomPlayersRef.current);

					// Open the world section, if applicable
					if (thisPlayerHealth > 0) {
						setActiveSection('world');
					}
					break;
				case gameConfig.messageActions.ENTER:
					if (message.player) {

						// Update the Players lists
						roomPlayersRef.current.push(message.player);
						setRoomPlayers(roomPlayersRef.current);

						// Write message to the chat panel
						appendChatMessage(strings.chatEnterOther.replace('{0}', message.player.name), 'enter');

					} else if (message.mob) {

						// Update the Mobs lists
						roomMobsRef.current.push(message.mob);
						setRoomMobs(roomMobsRef.current);

						// Write message to the chat panel
						appendChatMessage(strings.chatEnterOther.replace('{0}', message.mob.name), 'enter');
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
							appendChatMessage(strings.chatLeaveOther.replace('{0}', target.name), 'leave');
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
							appendChatMessage(strings.chatLeaveOther.replace('{0}', target.name), 'leave');
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
						let speaker = null;
						targets = roomPlayersRef.current;
						for (i = 0; i < targets.length; i++) {
							if (targets[i].id === message.playerId) {
								speaker = targets[i];
								break;
							}
						}

						// Write message to the chat panel
						if (speaker.name) {
							appendChatMessage(strings.chatHailYou.replace('{0}', speaker.name).replace('{1}', target.text), 'hail');
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

					// Update the current player, if applicable
					if (message.defender.type === gameConfig.entityTypes.PLAYER && defender.id === thisPlayer.id) {
						setThisPlayerHealth(Math.max(0, thisPlayerHealth - message.defender.damage));
					}

					// Update the active mob, if applicable
					if (message.defender.type === gameConfig.entityTypes.MOB && defender.id === activeMob.id) {
						setActiveMobHealth(Math.max(0, activeMobHealth - message.defender.damage));
					}

					// Write message to the chat panel
					if (attacker.name && defender.name) {
						const thisPlayerAttacked = message.attacker.type === gameConfig.entityTypes.PLAYER && attacker.id === thisPlayer.id,
							thisPlayerDefended = message.defender.type === gameConfig.entityTypes.PLAYER && defender.id === thisPlayer.id;
						setThisPlayerInCombat(thisPlayerAttacked || thisPlayerDefended);
						if (thisPlayerAttacked) {
							appendChatMessage(strings.chatAttackYou.replace('{0}', defender.name).replace('{1}', message.defender.damage), 'attack you');
						} else if (thisPlayerDefended) {
							appendChatMessage(strings.chatDefendYou.replace('{0}', attacker.name).replace('{1}', message.defender.damage), 'defend you');
						} else {
							appendChatMessage(strings.chatAttackOther.replace('{0}', attacker.name).replace('{1}', defender.name).replace('{2}', message.defender.damage), 'attack other');
						}
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
								setThisPlayerInCombat(false);
							}
						} else {
							appendChatMessage(thisPlayerDied ? strings.chatDieYou : strings.chatDieOther.replace('{0}', corpse.name), 'die');
							if (thisPlayerDied) {
								setThisPlayerInCombat(false);
							}
						}
					}

					// Update the Mobs lists
					if (message.corpse.type === gameConfig.entityTypes.MOB) {
						roomMobsRef.current = roomMobsRef.current.filter(m => m.id !== corpse.id);
						setRoomMobs(roomMobsRef.current);
					}

					// Return to the appropriate section
					if (thisPlayerDied) {
						setActiveSection('death');
					} else if (thisPlayerAttacked) {
						setActiveSection('world');
					}
					break;
				case gameConfig.messageActions.TAKE:

					// Update the Items lists
					roomItemsRef.current = roomItemsRef.current.filter(i => i.id !== message.item.id);
					setRoomItems(roomItemsRef.current);

					// Find the Player/Mob that picked up the Item
					const takerId = message.playerId || message.mobId;
					targets = message.playerId ? roomPlayersRef.current : roomMobsRef.current;
					target = targets.find(t => t.id === takerId);

					// Write message to the chat panel
					const thisPlayerTook = targets === roomPlayersRef.current && target.id === thisPlayer.id;
					appendChatMessage(thisPlayerTook ? strings.chatTakeYou.replace('{0}', message.item.name) : strings.chatTakeOther.replace('{0}', target.name).replace('{1}', message.item.name), 'item take');
					break;
				case gameConfig.messageActions.DROP:

					// Update the Items lists
					roomItemsRef.current.push(message.item);
					setRoomItems(roomItemsRef.current);

					// Find the Player/Mob that dropped the Item
					const dropperId = message.playerId || message.mobId;
					targets = message.playerId ? roomPlayersRef.current : roomMobsRef.current;
					target = targets.find(t => t.id === dropperId);

					// Write message to the chat panel
					const thisPlayerDropped = targets === roomPlayersRef.current && target.id === thisPlayer.id;
					appendChatMessage(thisPlayerDropped ? strings.chatDropYou.replace('{0}', message.item.name) : strings.chatDropOther.replace('{0}', target.name).replace('{1}', message.item.name), 'item drop');
					break;
			}
		}
	}, [lastJsonMessage]);

	return (
		<PageContainer id="game" backgroundImage={roomImage}>
			<header>
				<span className="stat health">
					<span className="label">{strings.health}</span>
					<span className="meter">
						<span className="fill" style={{width: thisPlayerHealth / thisPlayerHealthMax * 100 + '%'}}/>
					</span>
				</span>
				<span className="stat level">
					<span className="label">{strings.level}</span>
					<span className="value">{thisPlayerLevel}</span>
				</span>
				<span className="stat money">
					<span className="label">{strings.money}</span>
					<span className="value">{thisPlayerMoney}</span>
				</span>
			</header>
			<Tabs defaultSelectedTab="explore">
				<TabPanel tab="explore">
					<WorldSection
						isActive={activeSection === 'world'}
						roomDescription={roomDescription}
						roomDoors={roomDoors}
						thisPlayer={thisPlayer}
						mobs={roomMobs}
						players={roomPlayers}
						items={roomItems}
						openMobSheet={openMobSheet}
						openPlayerSheet={openPlayerSheet}
						openItemSheet={openItemSheet}
						movePlayer={movePlayer}
					/>
					<CombatSection
						isActive={activeSection === 'combat'}
						mobHealth={activeMobHealth}
						mobHealthMax={activeMobHealthMax}
					/>
					<DeathSection
						isActive={activeSection === 'death'}
						onClose={respawnPlayer}
					/>
					<div className="chat">
						{chatMessages.map(message => (
							<div className={'message ' + message.type} key={'message-' + messageIndex++}>{message.content}</div>
						))}
					</div>
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
				isOpen={isItemSheetOpen}
				onClose={closeItemSheet}
			/>
			<MobSheet
				mob={activeMob}
				isOpen={isMobSheetOpen}
				onClose={closeMobSheet}
				onAttack={() => setActiveSection('combat')}
			/>
			<PlayerSheet
				player={activePlayer}
				isOpen={isPlayerSheetOpen}
				onClose={closePlayerSheet}
			/>
		</PageContainer>
	);
};