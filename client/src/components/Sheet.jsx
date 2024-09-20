export default function Sheet({ open, onClose, children }) {
	if (!open) {
		return null;
	}
	return (
		<div className="sheet">
			<div className="background" onClick={onClose}></div>
			<div className="foreground">{children}</div>
		</div>
	);
};