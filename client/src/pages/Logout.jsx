import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { logoutUser } from '../services/userApiService';

export default function Logout() {

	// Handle logout
	const handleLogout = async () => {
		if (document.cookie && document.cookie.indexOf('email=') > -1) {
			try {
				await logoutUser();
			} catch(error) {
				alert(error);
			}
		}
	};
	useEffect(() => {
		handleLogout();
	}, []);

	// Return to the user login form
	return <Navigate to="/login" />;
};