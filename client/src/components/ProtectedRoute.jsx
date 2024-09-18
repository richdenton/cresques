import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';

export default function ProtectedRoute({ children }) {
	const auth = useAuth();
	if (!auth.user) {
		return <Navigate to="/login" />;
	}
	return children;
};