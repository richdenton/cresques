import { Link, useLocation } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import { Tabs, TabPanel, TabList, Tab } from '../components/Tabs';
import strings from '../config/strings';
import '../assets/game.css';

export default function Game() {

	// Get the selected player
	const location = useLocation();
	const player = location.state.player;

	return (
		<PageContainer id="game">
			<header>
				<span className="stat health">
					<span className="label">Health</span>
					<span className="meter">
						<span className="fill" style={{width: player.health / player.healthBase * 100}}/>
					</span>
				</span>
				<span className="stat level">
					<span className="label">Level</span>
					<span className="value">{player.level}</span>
				</span>
				<span className="stat money">
					<span className="label">Money</span>
					<span className="value">{player.money}</span>
				</span>
			</header>
			<Tabs defaultSelectedTab="explore">
				<TabPanel tab="explore">
					<div className="world">
						<div className="description" />
						<div className="mobs" />
						<div className="items" />
					</div>
					<nav>
						<div className="exits">
							<div className="cell">
								<a href="#" data-direction="w">
									<i className="arrow west" />
								</a>
							</div>
							<div className="cell">
								<a href="#" data-direction="n">
									<i className="arrow north" />
								</a>
								<a href="#" data-direction="s">
									<i className="arrow south" />
								</a>
							</div>
							<div className="cell">
								<a href="#" data-direction="e">
									<i className="arrow east" />
								</a>
							</div>
						</div>
						<div className="chat" />
					</nav>
				</TabPanel>
				<TabPanel tab="player">
					<div className="title" />
					<div className="stats" />
					<div className="items" />
				</TabPanel>
				<TabPanel tab="settings">
					<Link to={`/select`} className="button contained">{strings.selectPlayer}</Link>
				</TabPanel>
				<TabList>
					<Tab tab="explore">Explore</Tab>
					<Tab tab="player">Player</Tab>
					<Tab tab="settings">Settings</Tab>
				</TabList>
			</Tabs>
		</PageContainer>
	);
};