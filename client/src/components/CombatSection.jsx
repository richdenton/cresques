export default function CombatSection({ isActive, mobHealth, mobHealthMax }) {
	if (!isActive) {
		return null;
	}
	return (
		<section className="combat">
			<div className="meter">
				<div className="fill" style={{width: mobHealth / mobHealthMax * 100 + '%'}}/>
			</div>
		</section>
	);
};