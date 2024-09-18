import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Create from './pages/Create';
import Select from './pages/Select';
import Game from './pages/Game';
import strings from './config/strings';
import './assets/index.css';
import AuthProvider from './hooks/AuthProvider';

document.title = strings.title;

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/signup" element={<Signup />} />
					<Route path="/login" element={<Login />} />
					<Route path="/logout" element={<Logout />} />
					<Route
						path="/create"
						element={
							<ProtectedRoute>
								<Create />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/select"
						element={
							<ProtectedRoute>
								<Select />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/play"
						element={
							<ProtectedRoute>
								<Game />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Home />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);