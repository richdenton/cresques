import { Link } from 'react-router-dom';
import strings from '../config/strings';
import PageContainer from '../components/PageContainer';

export default function Home() {

	// Determine whether to render authentication or continue controls
	const renderControls = () => {
		if (document.cookie && document.cookie.indexOf('email=') > -1) {
			return <p><Link to={`/select`} className="button contained">{strings.selectPlayer}</Link></p>;
		} else {
			return (
				<>
					<p><Link to={`/login`} className="button contained'">{strings.login}</Link></p>
					<p><Link to={`/signup`} className="button contained">{strings.signup}</Link></p>
				</>
			);
		}
	};

	// Render the home page
	return (
		<PageContainer id="home">
			<h1>{strings.title}</h1>
			{renderControls()}
		</PageContainer>
	);
};