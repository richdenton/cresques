export default function Input({ children, ...props }) {
	return (
		<span className="input">
			<label htmlFor={props.id}>{children}</label>
			<input {...props} />
		</span>
	);
};