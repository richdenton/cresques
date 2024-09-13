export default function PageContainer({ children, ...props }) {
	return (
		<div className="container" {...props}>
			<div className="outer">
				<div className="inner">
					{children}
				</div>
			</div>
		</div>
	);
};