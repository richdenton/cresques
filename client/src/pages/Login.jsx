import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/userApiService';
import clientConfig from '../config/clientConfig';
import strings from '../config/strings';
import PageContainer from '../components/PageContainer';
import Input from '../components/Input';

export default function Login() {
	const navigate = useNavigate();

	// Attempt automatic login
	if (document.cookie && document.cookie.indexOf('email=') > -1) {
		navigate('/select', { replace: true });
	}

	// Handle email and password changes
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	// Handle login form submission
	const handleLogin = async (event) => {
		event.preventDefault();
		try {
			await loginUser(email, password);
			navigate('/select', { replace: true });
		} catch(error) {
			alert(error);
		}
	};

	// Render the user login form
	return (
		<PageContainer id="login">
			<h2>{strings.loginTitle}</h2>
			<form onSubmit={handleLogin}>
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
				<p><input type="submit" value={strings.login} className="button contained" /></p>
			</form>
			<p>{strings.loginGoToSignup} <Link to={`/signup`}>{strings.signupNow}</Link></p>
		</PageContainer>
	);
};