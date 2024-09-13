export default function PlayerListEntry({ player, ...props }) {
	return (
		<a href="#" className="button contained player" {...props}>
			<span className="name">{player.name}</span>
			<span className="level">{player.level}</span>
		</a>
	);
};