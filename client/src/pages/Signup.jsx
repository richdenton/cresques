import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../services/userApiService';
import clientConfig from '../config/clientConfig';
import strings from '../config/strings';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';

export default function Signup() {
	const navigate = useNavigate();

	// Attempt automatic login
	if (document.cookie && document.cookie.indexOf('email=') > -1) {
		navigate('/select', { replace: true });
	}

	// Handle email and password changes
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	// Handle signup form submission
	const handleSignup = async (event) => {
		event.preventDefault();
		try {
			await signupUser(email, password);
			navigate('/select', { replace: true });
		} catch(error) {
			alert(error);
		}
	};

	// Render the user signup form
	return (
		<PageContainer id="signup">
			<h2>{strings.signupTitle}</h2>
			<form onSubmit={handleSignup}>
				<p>
					<Input
						type="text"
						name="email"
						id="email"
						minLength={clientConfig.nameMinLength}
						maxLength={clientConfig.nameMaxLength}
						required="required"
						onChange={(event) => setEmail(event.target.value)}
					>
						{strings.email}
					</Input>
				</p>
				<p>
					<Input
						type="password"
						name="password"
						id="password"
						minLength={clientConfig.passwordMinLength}
						maxLength={clientConfig.passwordMaxLength}
						required="required"
						onChange={(event) => setPassword(event.target.value)}
					>
						{strings.password}
					</Input>
				</p>
				<p><input type="submit" value={strings.signup} className="button contained" /></p>
			</form>
			<p>{strings.signupGoToLogin} <Link to={`/login`}>{strings.loginNow}</Link></p>
		</PageContainer>
	);
};