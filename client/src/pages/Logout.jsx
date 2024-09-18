import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';

export default function Logout() {
	const auth = useAuth();

	// Handle logout
	const logoutUser = async () => {
		if (auth.user) {
			await auth.logout();
		}
	};
	useEffect(() => {
		logoutUser();
	}, []);

	// Return to the user login form
	return <Navigate to="/login" />;
};