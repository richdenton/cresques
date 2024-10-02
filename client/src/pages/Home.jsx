import { Link } from 'react-router-dom';
import strings from '../config/strings';
import PageContainer from '../components/PageContainer';
import { useAuth } from '../hooks/AuthProvider';

export default function Home() {
	const auth = useAuth();

	// Determine whether to render authentication or continue controls
	const renderControls = () => {
		if (auth.user) {
			return <p><Link to={`/select`} className="button contained">{strings.selectPlayer}</Link></p>;
		} else {
			return (
				<>
					<p><Link to={`/login`} className="button contained">{strings.login}</Link></p>
					<p><Link to={`/signup`} className="button contained">{strings.signup}</Link></p>
				</>
			);
		}
	};

	// Render the home page
	return (
		<PageContainer id="home">
			<h1>{process.env.REACT_APP_NAME}</h1>
			<p>{strings.version.replace('{0}', process.env.REACT_APP_VERSION)}</p>
			{renderControls()}
		</PageContainer>
	);
};