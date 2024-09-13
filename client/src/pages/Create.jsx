import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPlayer, getRaces } from '../services/playerApiService';
import clientConfig from '../config/clientConfig';
import strings from '../config/strings';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';

export default function Create() {
	const navigate = useNavigate();

	// Handle player name and race selections
	const [playerName, setPlayerName] = useState('');
	const [playerRace, setPlayerRace] = useState(1);

	// Get all races available to select
	const [races, setRaces] = useState([]);
	const fetchRaces = async () => {
		const data = await getRaces();
		setRaces(data.races);
	};
	useEffect(() => {
		fetchRaces();
	}, []);

	// Handle selecting a race
	const handlePlayerRaceChange = (event) => {
		setPlayerRace(parseInt(event.target.value));
	};

	// Handle creating a new player
	const handleCreatePlayer = async (event) => {
		event.preventDefault();
		try {
			await createPlayer(playerName, playerRace);
			navigate('/select', { replace: true });
		} catch(error) {
			alert(error);
		}
	};

	// Render the player creation form
	return (
		<PageContainer id="create">
			<h2>{strings.createPlayer}</h2>
			<form onSubmit={handleCreatePlayer}>
				<p>
					<Input
						type="text"
						name="name"
						minLength={clientConfig.nameMinLength}
						maxLength={clientConfig.nameMaxLength}
						required="required"
						onChange={(event) => setPlayerName(event.target.value)}
					>
						{strings.createPlayerName}
					</Input>
				</p>
				<fieldset>
					{races.map(race => (
						<span className={'button contained radio' + (playerRace === race.id ? ' selected' : '')} key={'race-' + race.id}>
							<input
								type="radio"
								name="race"
								id={'race-' + race.id}
								value={race.id}
								onChange={handlePlayerRaceChange}
							/>
							<label htmlFor={'race-' + race.id}>{race.name}</label>
						</span>
					))}
				</fieldset>
				<p>
					<input type="submit" value={strings.createPlayerDone} className="button contained" />
				</p>
			</form>
			<p><Link to={`/select`}>{strings.cancel}</Link></p>
		</PageContainer>
	);
};