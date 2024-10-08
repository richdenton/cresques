export default function Sheet({ isOpen, onClose, children }) {
	if (!isOpen) {
		return null;
	}
	return (
		<div className="sheet">
			<div className="background" onClick={onClose}></div>
			<div className="foreground">{children}</div>
		</div>
	);
};

export function SheetActions({ children }) {
	return (
		<div className="actions">{ children }</div>
	)
};

export function SheetAction({ onClick, children }) {
	return (
		<p><a href="#" className="button contained" onClick={onClick}>{children}</a></p>
	);
};