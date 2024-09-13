import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
	if (!(document.cookie && document.cookie.indexOf('email=') > -1)) {
		return <Navigate to="/login" />;
	}
	return children;
};