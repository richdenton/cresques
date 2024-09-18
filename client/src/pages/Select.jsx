import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPlayers, selectPlayer } from '../services/playerApiService';
import strings from '../config/strings';
import PageContainer from '../components/PageContainer';
import PlayerListEntry from '../components/PlayerListEntry';
import clientConfig from '../config/clientConfig';

export default function Select() {
	const navigate = useNavigate();

	// Get all players associated with the current user
	const [players, setPlayers] = useState([]);
	const fetchPlayers = async () => {
		const data = await getPlayers();
		setPlayers(data.players);
	};
	useEffect(() => {
		fetchPlayers();
	}, []);

	// Handle selecting a player
	const handleSelectPlayer = async (event, playerId) => {
		event.preventDefault();
		try {
			const response = await selectPlayer(playerId);
			if (response.player) {
				navigate('/play', {
					replace: true,
					state: {
						player: response.player
					}
				});
			}
		} catch(error) {
			alert(error);
		}
	};

	// Append new player trigers to the list
	const renderEmptyPlayerListEntries = () => {
		let emptyPlayerListEntries = [];
		for (let index = 0; index < clientConfig.playerSlotLimit - players.length; index++) {
			emptyPlayerListEntries.push(<Link to={`/create`} key={'empty-' + index} className="button outlined">+</Link>);
		}
		return emptyPlayerListEntries;
	};

	// Render the player list
	return (
		<PageContainer id="select">
			<h2>{strings.selectPlayer}</h2>
			<div className="list players">
				{players.map(player => (
					<PlayerListEntry key={'player-' + player.id} player={player} onClick={event => handleSelectPlayer(event, player.id)} />
				))}
				{renderEmptyPlayerListEntries()}
			</div>
			<p><Link to={`/logout`}>{strings.logout}</Link></p>
		</PageContainer>
	);
};