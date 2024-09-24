export default function CombatSection({ isActive, mob }) {
	if (!isActive) {
		return null;
	}
	return (
		<section className="combat">
			<div className="meter">
				<div className="fill" style={{width: mob.health / mob.healthBase * 100}}/>
			</div>
		</section>
	);
};