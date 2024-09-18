import { useContext, createContext, useState, useEffect } from 'react';
import { loginUser, logoutUser } from '../services/userApiService';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [ isLogout, setIsLogout ] = useState(false);

	// Handle user login
	const login = async (email, password) => {
		try {
			const response = await loginUser(email, password);
			if (response.user) {
				setUser(response.user);
				return;
			}
		} catch (error) {
			alert(error);
		}
	};

	// Handle user logout
	const logout = async () => {
		try {
			setIsLogout(true);
			setUser(null);
			await logoutUser();
			setIsLogout(false);
			return;
		} catch (error) {
			alert(error);
		}
	};

	// Attempt to automatically login the user
	const autoLogin = async () => {
		if (!isLogout && !user && (document.cookie && document.cookie.indexOf('email=') > -1)) {
			await login();
		}
	}
	useEffect(() => {
		autoLogin();
	});

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};