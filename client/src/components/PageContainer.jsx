export default function PageContainer({ id, backgroundImage, children }) {
	return (
		<div id={id} className="container" style={{backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none'}}>
			<div className="outer">
				<div className="inner">
					{children}
				</div>
			</div>
		</div>
	);
};